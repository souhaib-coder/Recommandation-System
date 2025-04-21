from flask import request, jsonify, redirect, url_for, flash,Blueprint
from flask_jwt_extended import JWTManager, create_access_token, decode_token, jwt_required, get_jwt_identity
from functools import wraps
from datetime import timedelta
from flask_login import current_user
from Models import app


security_bp = Blueprint('security', __name__)


jwt = JWTManager()

def init_jwt(app):
    jwt.init_app(app)

# Génération de token JWT

def generate_token(user_id):
    expiration = timedelta(minutes=133)
    token = create_access_token(identity=user_id, expires_delta=expiration)
    return token

# Décodage d'un token JWT

def decode_jwt_token(token):
    try:
        decoded = decode_token(token)
        return decoded['sub']  # Renvoie l'identité (ici user_id)
    except Exception as e:
        return None

# Middleware personnalisé pour vérification de token dans une API REST

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[-1]

        if not token:
            return jsonify({"message": "Token manquant"}), 401

        user_id = decode_jwt_token(token)
        if not user_id:
            return jsonify({"message": "Token invalide ou expiré"}), 401

        return f(user_id=user_id, *args, **kwargs)

    return decorated

# Middleware pour routes protégées avec Flask-Login

def login_required_route(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash("Veuillez vous connecter pour accéder à cette page", "warning")
        return f(*args, **kwargs)
    return decorated_function

# Middleware pour vérifier le rôle d'admin

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash("Connexion requise", "warning")
            return redirect(url_for('auth.login'))

        if current_user.rôle != "admin":
            flash("Accès refusé : droits insuffisants", "danger")
            return redirect(url_for('home'))

        return f(*args, **kwargs)

    return decorated_function
