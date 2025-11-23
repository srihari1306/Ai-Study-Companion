from dotenv import load_dotenv
import os

load_dotenv()

from flask import Flask
from config import Config
from models import db, User
from flask_cors import CORS
from flask_login import LoginManager
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.workspace import workspace_bp
from routes.documents import document_bp
from routes.study_plan import study_plan_bp
from routes.flashcards import flashcard_bp
from routes.summary import summarization_bp

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app, supports_credentials=True)

login_manager = LoginManager()
login_manager.init_app(app)
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.register_blueprint(auth_bp)
app.register_blueprint(workspace_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(document_bp)
app.register_blueprint(study_plan_bp)
app.register_blueprint(flashcard_bp)
app.register_blueprint(summarization_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5000)