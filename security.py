from flask import Blueprint, request, jsonify, current_app, g
from flask_login import current_user
from functools import wraps
from datetime import datetime, timedelta
import jwt
from Models import app, Utilisateurs, db

security_bp = Blueprint('security', __name__)

# Configuration des clés pour JWT
JWT_SECRET_KEY = app.config['SECRET_KEY']
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

# Middleware pour vérifier si l'utilisateur est connecté
def login_required_route(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentification requise'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Middleware pour vérifier si l'utilisateur est admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentification requise'}), 401
        
        if current_user.rôle != 'admin':
            return jsonify({'error': 'Accès restreint aux administrateurs'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

# Fonction pour générer un token JWT
def generate_jwt_token(user_id, is_refresh=False):
    expiration = datetime.utcnow() + (JWT_REFRESH_TOKEN_EXPIRES if is_refresh else JWT_ACCESS_TOKEN_EXPIRES)
    
    payload = {
        'user_id': user_id,
        'exp': expiration,
        'iat': datetime.utcnow(),
        'type': 'refresh' if is_refresh else 'access'
    }
    
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
    return token

# Fonction pour vérifier un token JWT
def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Middleware pour vérifier le token JWT
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Token invalide ou expiré'}), 401
        
        user = Utilisateurs.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

# Route pour générer un nouveau token JWT
@security_bp.route('/security/token', methods=['POST'])
@login_required_route
def get_token():
    access_token = generate_jwt_token(current_user.id_user)
    refresh_token = generate_jwt_token(current_user.id_user, is_refresh=True)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': JWT_ACCESS_TOKEN_EXPIRES.total_seconds()
    }), 200

# Route pour rafraîchir un token JWT
@security_bp.route('/security/token/refresh', methods=['POST'])
def refresh_token():
    refresh_token = request.json.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'error': 'Refresh token manquant'}), 400
    
    payload = verify_jwt_token(refresh_token)
    if not payload or payload.get('type') != 'refresh':
        return jsonify({'error': 'Refresh token invalide ou expiré'}), 401
    
    user = Utilisateurs.query.get(payload['user_id'])
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    new_access_token = generate_jwt_token(user.id_user)
    
    return jsonify({
        'access_token': new_access_token,
        'expires_in': JWT_ACCESS_TOKEN_EXPIRES.total_seconds()
    }), 200

# Route protégée par JWT pour tester
@security_bp.route('/security/protected', methods=['GET'])
@token_required
def protected_route():
    return jsonify({
        'message': 'Accès autorisé à la route protégée',
        'user_id': g.current_user.id_user,
        'email': g.current_user.email
    }), 200

# Route d'administration protégée
@security_bp.route('/admin/dashboard', methods=['GET'])
@login_required_route
@admin_required
def admin_dashboard():
    return jsonify({
        'message': 'Accès à l\'interface d\'administration',
        'user': {
            'id': current_user.id_user,
            'email': current_user.email,
            'role': current_user.rôle
        }
    }), 200

# Obtenir la liste des utilisateurs (admin uniquement)
@security_bp.route('/admin/users', methods=['GET'])
@login_required_route
@admin_required
def get_users():
    users = Utilisateurs.query.all()
    users_list = []
    
    for user in users:
        user_data = {
            'id_user': user.id_user,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'rôle': user.rôle,
            'date_inscription': user.date_inscription.isoformat() if hasattr(user.date_inscription, 'isoformat') else user.date_inscription
        }
        users_list.append(user_data)
    
    return jsonify(users_list), 200

# Modifier le rôle d'un utilisateur (admin uniquement)
@security_bp.route('/admin/users/<user_id>/role', methods=['PUT'])
@login_required_route
@admin_required
def update_user_role(user_id):
    user = Utilisateurs.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    data = request.json
    new_role = data.get('role')
    
    if not new_role or new_role not in ['user', 'admin']:
        return jsonify({'error': 'Rôle invalide. Choix possibles: user, admin'}), 400
    
    user.rôle = new_role
    db.session.commit()
    
    return jsonify({
        'message': f'Rôle modifié pour l\'utilisateur {user.id_user}',
        'user': {
            'id_user': user.id_user,
            'email': user.email,
            'rôle': user.rôle
        }
    }), 200

# Vérifier les permissions d'un utilisateur
@security_bp.route('/security/check-permissions', methods=['GET'])
@login_required_route
def check_permissions():
    return jsonify({
        'user': {
            'id_user': current_user.id_user,
            'email': current_user.email,
            'rôle': current_user.rôle
        },
        'permissions': {
            'is_admin': current_user.rôle == 'admin',
            'can_access_admin_panel': current_user.rôle == 'admin',
            'can_modify_users': current_user.rôle == 'admin'
        }
    }), 200