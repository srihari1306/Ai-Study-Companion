import os
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SESSION_TYPE = 'filesystem'
    UPLOAD_FOLDER = './uploads'
