from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask import Flask

app= Flask(__name__)

db = SQLAlchemy(app)
bcrypt = Bcrypt()
login_manager = LoginManager()

UPLOAD_FOLDER = 'static/'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'pptx', 'txt'}


