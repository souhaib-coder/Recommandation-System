from flask import Blueprint, request, jsonify, render_template
from flask_login import login_required, current_user, logout_user
from flask_wtf.csrf import generate_csrf
from datetime import datetime
from email_validator import validate_email, EmailNotValidError
from security import *
from Models import db, Cours, Favoris, Historique_Consultation, Profils_Utilisateurs, Utilisateurs, bcrypt

users_bp = Blueprint('users', __name__)

# API CSRF Token endpoint
@users_bp.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    return jsonify({
        "csrf_token": generate_csrf()
    })

# API Routes pour le frontend React

@users_bp.route('/api/user/profile', methods=['GET'])
@login_required_route
def get_user_profile():
    try:
        profil = Profils_Utilisateurs.query.filter_by(user_id=current_user.id_user).first()
        # 🔐 Gérer date_inscription même si c'est une string
        raw_date = current_user.date_inscription
        try:
            if isinstance(raw_date, str):
                parsed_date = datetime.fromisoformat(raw_date)
            else:
                parsed_date = raw_date
        except Exception as e:
            parsed_date = None

        user_data = {
            'id_user': current_user.id_user,
            'nom': current_user.nom,
            'prenom': current_user.prenom,
            'email': current_user.email,
            'date_inscription': parsed_date.isoformat() if parsed_date else None,
            'admin': current_user.rôle == "admin"
        }

        profil_data = None
        if profil:
            # Gérer date_mise_à_jour de la même manière que date_inscription
            raw_update_date = profil.date_mise_à_jour
            try:
                if isinstance(raw_update_date, str):
                    parsed_update_date = raw_update_date
                else:
                    parsed_update_date = raw_update_date.isoformat() if raw_update_date else None
            except Exception as e:
                parsed_update_date = None
                
            profil_data = {
                'domaine_intérêt': profil.domaine_intérêt,
                'objectifs': profil.objectifs,
                'date_mise_à_jour': parsed_update_date
            }

        response = jsonify({'user': user_data, 'profil': profil_data})
        response.headers['Content-Type'] = 'application/json'
        return response, 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/api/user/update', methods=['PUT'])
@login_required_route
def update_user_info():
    try:
        data = request.json

        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400

        if 'email' in data:
            new_email = data['email'].strip()

            try:
                # ✅ Validation complète : syntaxe + TLD + structure
                valid = validate_email(new_email)
                new_email = valid.email  # nettoyée et normalisée
            except EmailNotValidError as e:
                return jsonify({'error': str(e)}), 400

            existing_user = Utilisateurs.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id_user != current_user.id_user:
                return jsonify({'error': 'Cet email est déjà utilisé'}), 400

            current_user.email = new_email

        if 'nom' in data:
            current_user.nom = data['nom']
        if 'prenom' in data:
            current_user.prenom = data['prenom']

        db.session.commit()

        return jsonify({
            'message': 'Informations utilisateur mises à jour avec succès',
            'user': {
                'id_user': current_user.id_user,
                'nom': current_user.nom,
                'prenom': current_user.prenom,
                'email': current_user.email
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@users_bp.route('/api/user/profil/update', methods=['PUT'])
@login_required_route
def update_user_profil():
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
            
        # Vérifier si l'utilisateur a déjà un profil
        profil = Profils_Utilisateurs.query.filter_by(user_id=current_user.id_user).first()
        
        if not profil:
            # Créer un nouveau profil
            profil = Profils_Utilisateurs(
                user_id=current_user.id_user,
                domaine_intérêt=data.get('domaine_intérêt', ''),
                objectifs=data.get('objectifs', ''),
                date_mise_à_jour=datetime.now()
            )
            db.session.add(profil)
        else:
            # Mettre à jour le profil existant
            if 'domaine_intérêt' in data:
                profil.domaine_intérêt = data['domaine_intérêt']
            if 'objectifs' in data:
                profil.objectifs = data['objectifs']
            profil.date_mise_à_jour = datetime.now()
            
        db.session.commit()
        
        # Retourner le profil mis à jour
        return jsonify({
            'message': 'Profil utilisateur mis à jour avec succès',
            'profil': {
                'domaine_intérêt': profil.domaine_intérêt,
                'objectifs': profil.objectifs,
                'date_mise_à_jour': (
                                    profil.date_mise_à_jour.isoformat()
                                    if hasattr(profil.date_mise_à_jour, 'isoformat')
                                    else profil.date_mise_à_jour
                                )
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@users_bp.route('/api/user/password/reset', methods=['PUT'])
@login_required_route
def reset_user_password():
    try:
        data = request.json

        if not data or 'ancien_mdp' not in data or 'nouveau_mdp' not in data:
            return jsonify({'error': 'Données manquantes'}), 400

        ancien = data['ancien_mdp']
        nouveau = data['nouveau_mdp']

        if not bcrypt.check_password_hash(current_user.mot_de_passe, ancien):
            return jsonify({'error': 'Ancien mot de passe incorrect'}), 400

        if len(nouveau) < 8:
            return jsonify({'error': 'Le mot de passe doit contenir au moins 8 caractères'}), 400
        
        hashed = bcrypt.generate_password_hash(nouveau).decode('utf-8')
        current_user.mot_de_passe = hashed
        db.session.commit()

        return jsonify({'message': 'Mot de passe mis à jour avec succès'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@users_bp.route('/api/user/supprimer', methods=['POST'])
@login_required_route
def supprimer_compte_api():
    try:
        # Supprimer d'abord les favoris de l'utilisateur
        Favoris.query.filter_by(user_id=current_user.id_user).delete()
        
        # Supprimer l'historique de consultation de l'utilisateur
        Historique_Consultation.query.filter_by(user_id=current_user.id_user).delete()
        
        # Supprimer le profil de l'utilisateur s'il existe
        Profils_Utilisateurs.query.filter_by(user_id=current_user.id_user).delete()
        
        # Récupérer l'ID utilisateur avant de supprimer
        user_id = current_user.id_user
        
        # Déconnecter l'utilisateur
        logout_user()
        
        # Supprimer l'utilisateur
        Utilisateurs.query.filter_by(id_user=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Compte supprimé avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Get user favorites
@users_bp.route('/api/profil/favoris', methods=['GET'])
@login_required_route
def afficher_favoris():
    try:
        favoris = Favoris.query.filter_by(user_id=current_user.id_user).all()
       
        favoris_list = []
        for favori in favoris:
            cours = Cours.query.get(favori.cours_id)
            if cours:
                # Vérification du type de date_ajout pour éviter l'erreur
                date_format = None
                if favori.date_ajout:
                    # Si c'est déjà une chaîne, l'utiliser directement
                    if isinstance(favori.date_ajout, str):
                        date_format = favori.date_ajout
                    # Si c'est un objet datetime, le formater
                    else:
                        date_format = favori.date_ajout.strftime("%Y-%m-%d %H:%M:%S")
                
                favoris_list.append({
                    "id_favoris": favori.id_favoris,
                    "cours_id": cours.id_cours,
                    "nom": cours.nom,
                    "domaine": cours.domaine,
                    "type_ressource": cours.type_ressource,
                    "niveau": cours.niveau,
                    "langue": cours.langue,
                    "date_ajout": date_format
                })
        return jsonify(favoris_list), 200
    
    except Exception as e:
        # Ajouter une journalisation pour le débogage
        print(f"Erreur dans afficher_favoris: {str(e)}")
        return jsonify({"error": str(e)}), 500
# Get user history


@users_bp.route('/api/profil/historique', methods=['GET'])
@login_required_route
def afficher_historique():
    # Récupérer l'historique avec une jointure sur la table Cours
    historique = db.session.query(
        Historique_Consultation,
        Cours.nombre_vues,
        Cours.langue,
        Cours.type_ressource
    ).join(
        Cours, Historique_Consultation.cours_id == Cours.id_cours
    ).filter(
        Historique_Consultation.user_id == current_user.id_user
    ).order_by(
        Historique_Consultation.date_consultation.desc()
    ).all()

    historique_list = []
    for item in historique:
        # item est maintenant un tuple (Historique_Consultation, nombre_vues, langue, type_ressource)
        historique_item = item[0]
        cours = Cours.query.get(historique_item.cours_id)  # Accès via l'ID
        
        if cours:
            historique_list.append({
                "id_historique": historique_item.id_historique,
                "cours_id": cours.id_cours,
                "nom": cours.nom,
                "domaine": cours.domaine,
                "type_ressource": cours.type_ressource,
                "langue": cours.langue,
                "niveau": cours.niveau,
                "nombre_vues": cours.nombre_vues,
                "date_consultation": historique_item.date_consultation.strftime("%Y-%m-%d") if historique_item.date_consultation else None,
                "heure_consultation": historique_item.date_consultation.strftime("%H:%M:%S") if historique_item.date_consultation else None,
                "objectifs": cours.objectifs if hasattr(cours, 'objectifs') else None,
                "durée": cours.durée if hasattr(cours, 'durée') else None
            })

    return jsonify(historique_list), 200

# Clear user history
@users_bp.route('/api/profil/historique/clear', methods=['POST'])
@login_required_route
def effacer_historique():
    try:
        Historique_Consultation.query.filter_by(user_id=current_user.id_user).delete()
        db.session.commit()
        return jsonify({"message": "Historique effacé avec succès"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
