from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, Workspace, Document, StudyPlan
from datetime import datetime

from services.study_plan_generator import StudyPlanGenerator

study_plan_generator = StudyPlanGenerator()

study_plan_bp = Blueprint("study_plan",__name__)

@study_plan_bp.route('/workspaces/<int:workspace_id>/study-plan',methods=['GET'])
@login_required
def get_study_plan(workspace_id):
    workspace = Workspace.query.get(workspace_id)
    if not workspace or workspace.user_id != current_user.id:
        return jsonify({"error": "Workspace not found"}), 404
    
    if not workspace.deadline:
        return jsonify({"error": "Please set a deadline for this workspace first"}), 400
    
    documents = Document.query.filter_by(workspace_id = workspace_id).all()

    regenerate = request.args.get("regenerate", "false").lower() == "true"

    existing_plan = StudyPlan.query.filter_by(workspace_id=workspace_id).first()
    if existing_plan and not regenerate:
        return jsonify({
            "plan": existing_plan.plan_text,
            "workspace_name": workspace.name,
            "deadline": workspace.deadline.isoformat(),
            "days_left": (workspace.deadline - datetime.now()).days,
            "document_count": len(documents),
            "cached": True
        })

    try:
        plan = study_plan_generator.generate_plan(workspace_name=workspace.name, deadline=workspace.deadline, documents=documents)

        if existing_plan:
            existing_plan.plan_text = plan
            existing_plan.generated_at = datetime.now()
        else:
            new_plan = StudyPlan(workspace_id=workspace_id, plan_text = plan)
            db.session.add(new_plan)
        db.session.commit()

        return jsonify({
            "plan":plan,
            "workspace_name": workspace.name,
            "deadline": workspace.deadline.isoformat(),
            "days_left":(workspace.deadline - datetime.now()).days,
            "document_count":len(documents),
            "cached": False
        })
    except Exception as e:
        print(f"Error generating plan: {e}")
        return jsonify({"error":"Failed to generate study plan"})