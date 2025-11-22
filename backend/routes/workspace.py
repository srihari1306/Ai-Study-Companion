from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from models import db, Workspace, Document, ChatMessage
from config import Config
import os
from services.document_processor import DocumentProcessor
from services.embeddings import EmbeddingService
from datetime import datetime


doc_processor = DocumentProcessor()
embebbing_sevice = EmbeddingService()


workspace_bp = Blueprint('workspace',__name__)

@workspace_bp.route('/workspaces', methods=['GET'])
@login_required
def get_workspaces():
    workspaces = Workspace.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id':w.id,
        'name':w.name,
        'deadline':w.deadline,
        'created_by':w.created_at.isoformat()
    } for w in workspaces])

@workspace_bp.route('/workspaces', methods=['POST'])
@login_required
def create_workspaces():
    data = request.json
    name = data['name']
    deadline_str = data['deadline']

    if not name or not deadline_str:
        return jsonify({"error": "Workspace name and deadline are required"}), 400
    
    try:
        deadline = datetime.strptime(deadline_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    workspace = Workspace(
        name = name,
        deadline = deadline,
        user_id = current_user.id
    )


    db.session.add(workspace)
    db.session.commit()

    return jsonify({"id":workspace.id,"name":workspace.name})

@workspace_bp.route('/workspaces/<int:workspace_id>', methods=['DELETE'])
@login_required
def delete_workspace(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    try:
        documents = Document.query.filter_by(workspace_id=workspace_id).all()
        try:
            collection = embebbing_sevice.get_or_create_collection(workspace_id)
            embebbing_sevice.client._delete_collection(f"workspace_{workspace_id}")
        except Exception as e:
            print(f"Warning: Could not delete ChromaDB collection: {e}")
        
        for doc in documents:
            if doc.file_path and os.path.exists(doc.file_path):
                try:
                    os.remove(doc.file_path)
                except Exception as e:
                    print(f"Warning: Could not delete file {doc.file_path}: {e}")
        
        ChatMessage.query.filter_by(workspace_id=workspace_id).delete()
        Document.query.filter_by(workspace_id=workspace_id).delete()
        db.session.delete(workspace)
        db.commit()

        return jsonify({"message":"Workspace deleted successfully"})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting workspace: {e}")
        return jsonify({'error':'Failed to delete workspace'}), 500
