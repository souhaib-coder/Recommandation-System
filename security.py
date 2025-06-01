from flask import Blueprint, request, jsonify
from flask_login import current_user
from functools import wraps
from Models import Utilisateurs, db

security_bp = Blueprint('security', __name__)



# Middleware pour vérifier si l'utilisateur est connecté
def login_required_route(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentification requise'}), 401
        return f(*args, **kwargs)
    return decorated_function


@security_bp.route('/api/auth/check', methods=['GET'])
@login_required_route
def check_auth():
    return jsonify({"authenticated": True}), 200




# Middleware pour vérifier si l'utilisateur est admin
def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Utilisateur non connecté"}), 401
        if current_user.rôle != "admin":
            return jsonify({"error": "Accès refusé"}), 403
        return f(*args, **kwargs)
    return wrapper

@security_bp.route('/api/admin/check', methods=['GET'])
@admin_required
def check_admin():
    return jsonify({"isAdmin":True}),200





@security_bp.route('/api/admin/users', methods=['GET'])
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


@security_bp.route('/api/admin/users/<user_id>/role', methods=['PUT'])
@login_required_route
@admin_required
def update_user_role(user_id):
    user = Utilisateurs.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    data = request.json
    # Accepter à la fois 'role' (sans accent) et 'rôle' (avec accent)
    new_role = data.get('role', data.get('rôle'))
    
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
