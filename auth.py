from flask import Blueprint, make_response, render_template, redirect, url_for, flash, request, jsonify
from flask_mail import Message
from flask_wtf import FlaskForm
from itsdangerous import URLSafeTimedSerializer
from wtforms import StringField, PasswordField, SubmitField, SelectField
from wtforms.validators import InputRequired, Email, Length, EqualTo, ValidationError
from flask_login import login_user, logout_user, login_required
from datetime import datetime
import random
from security import *


from Models import bcrypt

from Models import db, login_manager, Utilisateurs, Profils_Utilisateurs,mail

auth_bp = Blueprint('auth', __name__)

class RegisterForm(FlaskForm):
    nom = StringField(validators=[
        InputRequired(), Length(min=2, max=50)], render_kw={"placeholder": "Nom"})
    prenom = StringField(validators=[
        InputRequired(), Length(min=2, max=50)], render_kw={"placeholder": "Prénom"})
    email = StringField(validators=[
        InputRequired(), Email(), Length(min=5, max=50)], render_kw={"placeholder": "Email"})
    password = PasswordField(validators=[
        InputRequired(), Length(min=8, max=20),
        EqualTo("confirmation_password", message="Les mots de passe ne correspondent pas.")
    ], render_kw={"placeholder": "Mot de passe"})
    confirmation_password = PasswordField(validators=[InputRequired()], render_kw={"placeholder": "Confirmermotdepasse"})
    
    domaine_intérêt = SelectField(
        'Domaine d\'intérêt',
        choices=[('', 'Choisissez un domaine...'),  # Option vide pour forcer un choix
                 ('Informatique', 'Informatique'),
                 ('Mathématiques', 'Mathématiques'),
                 ('Physique', 'Physique'),
                 ('Langues', 'Langues')],
        validators=[InputRequired(message="Le domaine d'intérêt est obligatoire")]
    )
    
    objectifs = SelectField(
        'Objectifs',
        choices=[('', 'Choisissez un objectif...'),  # Option vide pour forcer un choix
                 ('Révision', 'Révision'),
                 ('Préparation examen', 'Préparation examen'),
                 ('Apprentissage', 'Apprentissage'),
                 ('Approfondissement', 'Approfondissement')],
        validators=[InputRequired(message="L'objectif est obligatoire")]
    )

    class Meta:
        csrf = False

    submit = SubmitField("S'inscrire")

    def validate_email(self, email):
        existing_user = Utilisateurs.query.filter_by(email=email.data).first()
        if existing_user:
            raise ValidationError("Cet email est déjà utilisé. Veuillez en choisir un autre.")



class loginForm(FlaskForm):
    email = StringField(validators=[
        InputRequired(), Email(), Length(min=5, max=50)], render_kw={"placeholder": "Email"})
    password = PasswordField(validators=[
        InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Mot de passe"})
    submit = SubmitField("Se connecter")


@login_manager.user_loader
def load_user(user_id):
    return Utilisateurs.query.get(str(user_id))
login_manager.login_view = 'auth.login'

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Utilisateur non authentifié"}), 401


@auth_bp.route('/api/connexion', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Aucune donnée reçue'}), 400

    email = data.get('email')
    password = data.get('password')

    user = Utilisateurs.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.mot_de_passe, password):
        login_user(user)
        response = make_response(jsonify({'message': 'Connexion réussie',"admin": current_user.rôle == "admin"}), 200)
        response.headers['Content-Type'] = 'application/json'
        return response
    return jsonify({'message': 'Identifiants invalides'}), 401


@auth_bp.route('/api/deconnexion', methods=['GET', 'POST'])
@login_required_route
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Déconnexion réussie'})


@auth_bp.route('/api/inscription', methods=['GET', 'POST'])
def register():
    data = request.json
    form = RegisterForm(data=data)

    if form.validate():
        if Utilisateurs.query.filter_by(email=form.email.data).first():
            return jsonify({'message': 'Email déjà utilisé'}), 400
        
        while True:
            new_id = "R" + str(random.randint(100000000, 999999999))
            if not Utilisateurs.query.filter_by(id_user=new_id).first():
                break
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        new_user = Utilisateurs(
            id_user=new_id,
            nom=form.nom.data,
            prenom=form.prenom.data,
            mot_de_passe=hashed_password,
            email=form.email.data,
            date_inscription=datetime.now(),
            rôle="user"
        )
        db.session.add(new_user)
        db.session.commit()

        profil = Profils_Utilisateurs(
            user_id=new_user.id_user,
            domaine_intérêt=form.domaine_intérêt.data,
            objectifs=form.objectifs.data,
            date_mise_à_jour=datetime.now()
        )
        db.session.add(profil)
        db.session.commit()

        return jsonify({'message': 'Inscription réussie'}), 201
    return jsonify({'errors': form.errors}), 400

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
RESET_TOKEN_EXPIRATION = 3600  # 1 heure en secondes
@auth_bp.route('/api/forgot-password', methods=['GET','POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'L\'adresse e-mail est requise'}), 400
        
        user = Utilisateurs.query.filter_by(email=email).first()
        
        if not user:
            # Pour des raisons de sécurité, on ne révèle pas si l'email existe
            return jsonify({'message': 'Si cet e-mail existe, un lien de réinitialisation du mot de passe a été envoyé'}), 200
        
        # Génération du token
        token = serializer.dumps(
            {'id_user': user.id_user, 'exp': (datetime.now() + timedelta(seconds=RESET_TOKEN_EXPIRATION)).timestamp()},
            salt='password-reset'
        )
        
        # Envoi de l'email avec styles inline pour compatibilité
        reset_url = f"{app.config['FRONTEND_URL']}/ResetPassword?token={token}"
        
        # Récupération du nom de l'application depuis la configuration
        app_name = app.config.get('APP_NAME', 'DocStorm')
        support_email = app.config.get('SUPPORT_EMAIL', 'DevStorm3@gmail.com')
        current_year = datetime.now().year
        user_prenom = user.prenom if hasattr(user, 'prenom') else ''
        
        msg = Message(
            subject=f"{app_name} - Réinitialisation de votre mot de passe",
            sender=app.config['MAIL_DEFAULT_SENDER'],
            recipients=[user.email]
        )
        
        # Corps de l'email en format texte (toujours inclure une version texte)
        msg.body = f"""
            Bonjour {user_prenom},

            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte {app_name}.

            Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien ci-dessous :
            {reset_url}

            Ce lien est valable pendant 1 heure à compter de la réception de cet e-mail.

            Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail ou contacter notre support à {support_email} si vous avez des inquiétudes concernant la sécurité de votre compte.

            Cordialement,
            L'équipe {app_name}
            """
        
        # Version HTML avec styles inline pour meilleure compatibilité avec les clients email
        msg.html = f"""<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Réinitialisation de mot de passe</title>
            </head>
            <body style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; background-image: linear-gradient(120deg, #f5f5f5 0%, #ffffff 100%);">
                <div style="max-width: 650px; margin: 25px auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(45, 160, 168, 0.15); overflow: hidden; position: relative;">
                    <!-- Éléments décoratifs -->
                    <!-- En-tête avec forme dynamique -->
                    <div style="background-color: #2da0a8; background-image: linear-gradient(135deg, #2da0a8 0%, #24858c 100%); padding: 40px 20px; text-align: center; color: #ffffff; position: relative; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);">
                        <h2 style="margin: 0; font-weight: 700; font-size: 32px; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">{app_name}</h2>
                        <p style="margin: 10px 0 0; font-weight: 300; letter-spacing: 0.5px;">Réinitialisation de mot de passe</p>
                    </div>
                    
                    <!-- Contenu -->
                    <div style="padding: 40px 30px; position: relative; z-index: 2;">
                        <p style="margin: 15px 0; font-size: 17px; color: #333333; animation: fadeIn 0.8s;">Bonjour <strong style="font-weight: 600; color: #2da0a8; border-bottom: 2px dotted rgba(45, 160, 168, 0.3); padding-bottom: 2px;">{user_prenom}</strong>,</p>
                        
                        <p style="margin: 20px 0; font-size: 17px; color: #333333;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte {app_name}.</p>
                        
                        <p style="margin: 20px 0; font-size: 17px; color: #333333;">Pour réinitialiser votre mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="{reset_url}" style="display: inline-block; background-color: #2da0a8; background-image: linear-gradient(135deg, #2da0a8 0%, #24858c 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 50px; font-weight: 600; letter-spacing: 0.5px; text-align: center; font-size: 16px; box-shadow: 0 5px 15px rgba(45, 160, 168, 0.3); transition: all 0.3s ease; position: relative; overflow: hidden;">
                                <span style="position: relative; z-index: 2;">Réinitialiser mon mot de passe</span>
                            </a>
                        </div>
                        
                        <p style="margin: 20px 0; font-size: 17px; color: #333333;">Ou copiez et collez ce lien dans votre navigateur :</p>
                        
                        <div style="word-break: break-all; background-color: #f7fbfb; padding: 18px; border-radius: 12px; color: #333333; font-size: 15px; border: 1px dashed rgba(45, 160, 168, 0.3); position: relative;">
                            <div style="position: absolute; top: -8px; left: 20px; background-color: #ffffff; padding: 0 10px; color: #2da0a8; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">LIEN SÉCURISÉ</div>
                            <a href="{reset_url}" style="color: #2da0a8; text-decoration: none; font-weight: 500;">{reset_url}</a>
                        </div>
                        
                        <div style="background-color: #eaf6f7; padding: 20px; border-radius: 12px; font-size: 16px; margin: 30px 0; border-left: 4px solid #2da0a8; position: relative;">
                            <p style="margin: 0; padding-right: 40px;"><strong style="color: #2da0a8;">Note importante :</strong> Ce lien est valable pendant <span style="font-weight: 600; color: #2da0a8;">1 heure</span> à compter de la réception de cet e-mail.</p>
                        </div>
                        
                        <p style="margin: 20px 0; font-size: 17px; color: #333333;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail ou contacter notre support à <a href="mailto:{support_email}" style="color: #2da0a8; font-weight: 600; text-decoration: none; border-bottom: 1px solid #2da0a8;">{support_email}</a> si vous avez des inquiétudes concernant la sécurité de votre compte.</p>
                    </div>
                    
                    <!-- Pied de page -->
                    <div style="background-color: #f7fbfb; padding: 30px 20px; text-align: center; font-size: 15px; color: #666666; border-top: 1px solid rgba(45, 160, 168, 0.1); position: relative;">
                        <div style="width: 100%; height: 5px; background-image: linear-gradient(90deg, transparent, #2da0a8, transparent); opacity: 0.2; position: absolute; top: 0; left: 0;"></div>
                        <p style="margin: 5px 0;"><strong style="color: #2da0a8;">Cordialement,</strong></p>
                        <p style="margin: 5px 0;">L'équipe <span style="color: #2da0a8; font-weight: 600;">{app_name}</span></p>
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed rgba(45, 160, 168, 0.2);">
                            <p style="margin: 5px 0; font-size: 13px;">&copy; {current_year} {app_name}. Tous droits réservés.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>"""
        
        mail.send(msg)
        
        return jsonify({'message': 'Si cet e-mail existe, un lien de réinitialisation du mot de passe a été envoyé'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({'error': 'Le token et le nouveau mot de passe sont requis'}), 400
        
        try:
            # Vérification du token
            token_data = serializer.loads(
                token,
                salt='password-reset',
                max_age=RESET_TOKEN_EXPIRATION
            )
            
            # Vérification de l'expiration
            if datetime.now().timestamp() > token_data['exp']:
                return jsonify({'error': 'Le token a expiré'}), 400
            
            user = Utilisateurs.query.get(token_data['id_user'])
            
            if not user:
                return jsonify({'error': 'Utilisateur non trouvé'}), 404
            
            # Mise à jour du mot de passe avec bcrypt
            hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            user.mot_de_passe = hashed_password
            db.session.commit()
            
            return jsonify({'message': 'Le mot de passe a été réinitialisé avec succès'}), 200
        
        except Exception as e:
            return jsonify({'error': 'Token invalide ou expiré'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500