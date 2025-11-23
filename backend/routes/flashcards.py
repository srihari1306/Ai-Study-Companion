from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, Workspace, Document, Flashcard
from services.flash_card_generator import FlashCardGenerator
from services.embeddings import EmbeddingService
from datetime import datetime

flashcard_bp = Blueprint('flashcard', __name__)

flashcard_engine = FlashCardGenerator()
embedding_service = EmbeddingService()

@flashcard_bp.route('/workspaces/<int:workspace_id>/flashcards/generate', methods=['POST'])
@login_required
def generate_flashcards(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Workspace not found"}), 404
    
    count = request.json.get('count', 10)
    documents = Document.query.filter_by(workspace_id=workspace_id).all()

    if not documents:
        return jsonify({"error": "No documents uploaded. Please upload study materials first."}), 400
    
    try:
        flashcard_data = flashcard_engine.generate_flashcards(
            documents=documents,
            embedding_service=embedding_service,
            workspace_id=workspace_id,
            count=count
        )

        if not flashcard_data:
            return jsonify({"error":"Could not generate flashcards from the content"}), 400
        
        created_flashcards = []
        for cards in flashcard_data:
            flashcard = Flashcard(
                workspace_id=workspace_id,
                question=cards['question'],
                answer = cards['answer']
            )

            db.session.add(flashcard)
            created_flashcards.append(flashcard)
        db.session.commit()

        return jsonify({
            "message": f"Generated {len(created_flashcards)} flashcards",
            "count": len(created_flashcards),
            "flashcards": [{
                "id": fc.id,
                "question": fc.question,
                "answer": fc.answer
            } for fc in created_flashcards]
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error generating flashcards: {e}")
        return jsonify({"error":"Failed to generate flashcards"})
    
@flashcard_bp.route('/workspaces/<int:workspace_id>/flashcards/due', methods=['GET'])
@login_required
def get_due_flashcards(workspace_id):
    """Get flashcards that are due for review"""
    
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Workspace not found"}), 404
    
    flashcards = Flashcard.query.filter(
        Flashcard.workspace_id == workspace_id,
        Flashcard.next_review <= datetime.now()
    ).limit(10).all()
    
    return jsonify([{
        'id': fc.id,
        'question': fc.question,
        'answer': fc.answer,
        'repetitions': fc.repetitions,
        'interval': fc.interval,
        'next_review': fc.next_review.isoformat() if fc.next_review else None
    } for fc in flashcards])


@flashcard_bp.route('/workspaces/<int:workspace_id>/flashcards/all', methods=['GET'])
@login_required
def get_all_flashcards(workspace_id):
    
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Workspace not found"}), 404
    
    flashcards = Flashcard.query.filter_by(workspace_id=workspace_id).all()
    
    return jsonify({
        'total': len(flashcards),
        'flashcards': [{
            'id': fc.id,
            'question': fc.question,
            'answer': fc.answer,
            'repetitions': fc.repetitions,
            'interval': fc.interval,
            'easiness_factor': fc.easiness_factor,
            'next_review': fc.next_review.isoformat() if fc.next_review else None,
            'last_reviewed': fc.last_reviewed.isoformat() if fc.last_reviewed else None
        } for fc in flashcards]
    })


@flashcard_bp.route('/flashcards/<int:flashcard_id>/review', methods=['POST'])
@login_required
def review_flashcard(flashcard_id):
    """Review a flashcard and update using SM-2 algorithm"""
    
    flashcard = Flashcard.query.get(flashcard_id)
    if not flashcard:
        return jsonify({"error": "Flashcard not found"}), 404
    
    workspace = Workspace.query.get(flashcard.workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.json
    quality = data.get('quality', 3)
    
    if not isinstance(quality, int) or quality < 0 or quality > 5:
        return jsonify({"error": "Quality must be an integer between 0-5"}), 400
    
    try:
        updated_flashcard = flashcard_engine.update_sm2(flashcard, quality)
        db.session.commit()
        
        return jsonify({
            "message": "Flashcard reviewed",
            "next_review": updated_flashcard.next_review.isoformat(),
            "interval": updated_flashcard.interval,
            "repetitions": updated_flashcard.repetitions,
            "easiness_factor": updated_flashcard.easiness_factor
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error reviewing flashcard: {e}")
        return jsonify({"error": "Failed to update flashcard"}), 500


@flashcard_bp.route('/flashcards/<int:flashcard_id>', methods=['DELETE'])
@login_required
def delete_flashcard(flashcard_id):
    
    flashcard = Flashcard.query.get(flashcard_id)
    if not flashcard:
        return jsonify({"error": "Flashcard not found"}), 404
    
    workspace = Workspace.query.get(flashcard.workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    
    try:
        db.session.delete(flashcard)
        db.session.commit()
        return jsonify({"message": "Flashcard deleted"})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting flashcard: {e}")
        return jsonify({"error": "Failed to delete flashcard"}), 500