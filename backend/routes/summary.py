from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, Workspace, Document
from services.summarization import SummarizationService
from services.embeddings import EmbeddingService

summarization_bp = Blueprint('summarization', __name__)

summarization_service = SummarizationService()
embedding_service = EmbeddingService()


@summarization_bp.route('/workspaces/<int:workspace_id>/summaries', methods=['GET'])
@login_required
def get_all_summaries(workspace_id):
    """Get summaries for all documents in a workspace"""
    
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Workspace not found"}), 404
    
    documents = Document.query.filter_by(workspace_id=workspace_id).all()
    
    if not documents:
        return jsonify({"error": "No documents found. Upload documents first."}), 400
    
    summaries = []
    
    for doc in documents:
        try:
            # Get chunks from ChromaDB
            collection = embedding_service.get_or_create_collection(workspace_id)
            results = collection.get(
                where={"document_id": doc.id}
            )
            
            chunks = results.get('documents', [])
            
            if not chunks:
                summaries.append({
                    'document_id': doc.id,
                    'filename': doc.filename,
                    'error': 'No content found',
                    'summary': None
                })
                continue
            
            # Generate summary
            summary_data = summarization_service.summarize_document(doc, chunks)
            
            summaries.append({
                'document_id': doc.id,
                'filename': doc.filename,
                'uploaded_at': doc.uploaded_at.isoformat(),
                'summary': summary_data['summary'],
                'key_points': summary_data['key_points'],
                'topics': summary_data['topics'],
                'word_count': summary_data['word_count'],
                'chunk_count': summary_data['chunk_count']
            })
            
        except Exception as e:
            print(f"Error summarizing document {doc.id}: {e}")
            summaries.append({
                'document_id': doc.id,
                'filename': doc.filename,
                'error': str(e),
                'summary': None
            })
    
    return jsonify({
        'workspace_name': workspace.name,
        'document_count': len(documents),
        'summaries': summaries
    })


@summarization_bp.route('/documents/<int:document_id>/summary', methods=['GET'])
@login_required
def get_document_summary(document_id):
    """Get summary for a specific document"""
    
    document = Document.query.get(document_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404
    
    # Verify ownership
    workspace = Workspace.query.get(document.workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        # Get chunks from ChromaDB
        collection = embedding_service.get_or_create_collection(document.workspace_id)
        results = collection.get(
            where={"document_id": document_id}
        )
        
        chunks = results.get('documents', [])
        
        if not chunks:
            return jsonify({"error": "No content found for this document"}), 400
        
        # Generate summary
        summary_data = summarization_service.summarize_document(document, chunks)
        
        return jsonify({
            'document_id': document.id,
            'filename': document.filename,
            'uploaded_at': document.uploaded_at.isoformat(),
            'summary': summary_data['summary'],
            'key_points': summary_data['key_points'],
            'topics': summary_data['topics'],
            'word_count': summary_data['word_count'],
            'chunk_count': summary_data['chunk_count']
        })
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to generate summary"}), 500


@summarization_bp.route('/documents/<int:document_id>/quick-summary', methods=['GET'])
@login_required
def get_quick_summary(document_id):
    """Get a quick one-paragraph summary"""
    
    document = Document.query.get(document_id)
    if not document:
        return jsonify({"error": "Document not found"}), 404
    
    # Verify ownership
    workspace = Workspace.query.get(document.workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        # Get first few chunks
        collection = embedding_service.get_or_create_collection(document.workspace_id)
        results = collection.get(
            where={"document_id": document_id},
            limit=5
        )
        
        chunks = results.get('documents', [])
        
        if not chunks:
            return jsonify({"error": "No content found"}), 400
        
        combined_text = "\n\n".join(chunks)
        quick_summary = summarization_service.generate_quick_summary(combined_text)
        
        return jsonify({
            'document_id': document.id,
            'filename': document.filename,
            'quick_summary': quick_summary
        })
        
    except Exception as e:
        print(f"Error generating quick summary: {e}")
        return jsonify({"error": "Failed to generate summary"}), 500