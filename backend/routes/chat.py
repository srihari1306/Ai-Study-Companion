from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, Workspace, ChatMessage
from services.rag_pipeline import RagPipeline
from services.embeddings import EmbeddingService
from services.llm_service import LLMService

embedding_service = EmbeddingService()
llm_service = LLMService()
rag_pipeline = RagPipeline(embedding_service=embedding_service, llm_service=llm_service)

chat_bp = Blueprint('chat',__name__)

@chat_bp.route('/workspaces/<int:workspace_id>/chat', methods=["POST"])
@login_required
def chat(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    data = request.json
    question = data['message']

    answer = rag_pipeline.answer_question(workspace_id, question)
    chat = ChatMessage(workspace_id = workspace_id, user_message=question, ai_response=answer)
    db.session.add(chat)
    db.session.commit()

    return jsonify({
        'answer':answer,
        'timestamp':chat.timestamp.isoformat()
    })


@chat_bp.route('/workspaces/<int:workspace_id>/chat/history', methods=['GET'])
@login_required
def chat_history(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error":"Unauthorized"}),401
    
    messages = ChatMessage.query.filter_by(workspace_id=workspace_id).order_by(ChatMessage.timestamp).all()

    return jsonify([{
        'user_message':m.user_message,
        'ai_response':m.ai_response,
        'timestamp':m.timestamp.isoformat()
    }for m in messages])
