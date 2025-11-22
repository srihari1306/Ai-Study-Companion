from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from models import db, Workspace, Document
from config import Config
import os
from services.document_processor import DocumentProcessor
from services.embeddings import EmbeddingService
from datetime import datetime

doc_processor = DocumentProcessor()
embebbing_service = EmbeddingService()

document_bp = Blueprint('document',__name__)

@document_bp.route("/workspaces/<int:workspace_id>/upload", methods=['POST'])
@login_required
def upload_document(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    if 'file' not in request.files:
        return jsonify({'error':'No files provided'}),400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(filepath)

    if filename.endswith('.pdf'):
        text = doc_processor.extract_text_from_pdf(filepath)
    elif filename.endswith('.docx'):
        text = doc_processor.extract_text_from_docx(filepath)
    else:
        return jsonify({'error':'Unsupported file type'}),400

    document = Document(filename=filename, file_path=filepath, workspace_id=workspace_id)
    db.session.add(document)
    db.session.flush()

    chunks = doc_processor.chunking(text)
    chunk_count = embebbing_service.embed_and_store(workspace_id=workspace_id,document_id=document.id, chunks=chunks)
    document.chunk_count = chunk_count
    db.session.commit()

    return jsonify({
        'message': 'Document processed',
        'document_id': document.id,
        'chunks': chunk_count
    })

@document_bp.route('/workspaces/<int:workspace_id>/documents', methods=['GET'])
@login_required
def get_workspace_documents(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    documents = Document.query.filter_by(workspace_id=workspace_id).all()
    return jsonify([{
        'id': doc.id,
        'filename': doc.filename,
        # 'uploaded_at': doc.uploaded_at.isoformat(),
        'chunk_count': doc.chunk_count
    } for doc in documents])

@document_bp.route('/documents/<int:document_id>', methods=['DELETE'])
@login_required
def delete_document(document_id):
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    workspace = Workspace.query.get(document.workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    try:
        collection = embebbing_service.get_or_create_collection(document.workspace_id)
        chunk_ids = [f"doc{document_id}_chunk{i}" for i in range(document.chunk_count)]
        try:
            collection.delete(ids=chunk_ids)
        except Exception as e:
            print(f"Warning: Could not delete embeddings: {e}")

        if document.file_path and os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        db.session.delete(document)
        db.session.commit()

        return jsonify({'message': 'Document deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting element: {e}")
        return jsonify({'error': 'Failed to delete document'}), 500


@document_bp.route('/documents/<int:document_id>', methods=['GET'])
def get_document(document_id):
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    workspace = Workspace.query.get(document.workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    return jsonify({
        'id': document.id,
        'filename': document.filename,
        'uploaded_at': "2025-11-23T02:45:12.389201",
        'chunk_count': document.chunk_count,
        'workspace_id': document.workspace_id
    })
