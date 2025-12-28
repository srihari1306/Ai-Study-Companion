from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    workspaces = db.relationship('Workspace', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Workspace(db.Model):
    __tablename__ = 'workspace'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    deadline = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.now)

    documents = db.relationship('Document', backref='workspace', lazy=True)
    chats = db.relationship('ChatMessage', backref='workspace', lazy=True)


class Document(db.Model):
    __tablename__ = 'document'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False)
    file_path = db.Column(db.String(500))
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'))
    chunk_count = db.Column(db.Integer, default=0)


class ChatMessage(db.Model):
    __tablename__ = 'chat_message'
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'))
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

class StudyPlan(db.Model):
    __tablename__ = 'study_plans'
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'))
    plan_text = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.now)

    workspace = db.relationship("Workspace", backref='study_plan', lazy=True)

class Flashcard(db.Model):
    __tablename__='flashcards'
    id = db.Column(db.Integer, primary_key=True)
    workspace_id = db.Column(db.Integer, db.ForeignKey('workspace.id'))
    question = db.Column(db.Text, nullable = False)
    answer = db.Column(db.Text, nullable=False)
    easiness_factor = db.Column(db.Float, default=2.5)
    interval = db.Column(db.Integer, default= 0)
    repetitions = db.Column(db.Integer, default= 0)
    next_review = db.Column(db.DateTime, default= datetime.now())
    created_at = db.Column(db.DateTime, default= datetime.now())
    last_reviewed = db.Column(db.DateTime)

    workspace = db.relationship("Workspace", backref='flashcards', lazy=True)