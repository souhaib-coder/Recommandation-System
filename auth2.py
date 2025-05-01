from flask import Flask, make_response, render_template, url_for, redirect, session, request, Blueprint, jsonify
from flask_sqlalchemy import SQLAlchemy 
from flask_login import UserMixin, LoginManager, login_required, logout_user, current_user, login_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, IntegerField, FileField
from wtforms.validators import InputRequired, Length, ValidationError, Email, EqualTo, DataRequired, Optional
from flask_bcrypt import Bcrypt
from datetime import datetime
import uuid
from flask_wtf.csrf import CSRFProtect
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
import os
from Models import db, bcrypt, Utilisateurs, Profils_Utilisateurs,mail
from security import *
from werkzeug.security import generate_password_hash


auth_bp = Blueprint('auth', __name__)

csrf = CSRFProtect()

# Configuration du formulaire
class RegisterForm(FlaskForm):

    class Meta:
        csrf = False 

    nom = StringField(validators=[
                         InputRequired(), Length(min=2, max=50)], render_kw={"placeholder": "Nom"})
    prenom = StringField(validators=[
                         InputRequired(), Length(min=2, max=50)], render_kw={"placeholder": "Prénom"})
    email = StringField(validators=[
                         InputRequired(), Email(), Length(min=5, max=50)], render_kw={"placeholder": "Email"})
    password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20), 
                             EqualTo("confirmation_password", message="Les mots de passe ne correspondent pas.")], render_kw={"placeholder": "Mot de passe"})
    
    confirmation_password = PasswordField( validators=[InputRequired()], render_kw={"placeholder": "Confirmer mot de passe"})
    domaine_intérêt = SelectField(
        'Domaine d\'intérêt',
        choices=[('', 'Choisissez un domaine...'),
                 ('Informatique', 'Informatique'),
                 ('Mathématiques', 'Mathématiques'),
                 ('Physique', 'Physique'),
                 ('Langues', 'Langues')],
        validators=[InputRequired(message="Le domaine d'intérêt est obligatoire")]
    )
    
    objectifs = SelectField(
        'Objectifs',
        choices=[('', 'Choisissez un objectif...'),
                 ('Révision', 'Révision'),
                 ('Préparation examen', 'Préparation examen'),
                 ('Apprentissage', 'Apprentissage'),
                 ('Approfondissement', 'Approfondissement')],
        validators=[InputRequired(message="L'objectif est obligatoire")]
    )
    
    submit = SubmitField("S'inscrire")

    def validate_email(self, email):
        existing_user = Utilisateurs.query.filter_by(email=email.data).first()
        if existing_user:
            raise ValidationError('Cet email est déjà utilisé. Veuillez en choisir un autre.')


class loginForm(FlaskForm):
    email = StringField(validators=[
                         InputRequired(), Email(), Length(min=5, max=50)], render_kw={"placeholder": "Email"})
    password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Mot de passe"})
    submit = SubmitField("Se connecter")


@auth_bp.route('/dashboard', methods=['GET', 'POST'])
@login_required_route
def dashboard():
    return render_template('dashboard.html')

@auth_bp.route('/logout', methods=['POST'])
@login_required_route
def logout():
    logout_user()
    return jsonify({'message': 'Déconnexion réussie', 'success': True}), 200

@auth_bp.route('/login', methods=['POST'])


@auth_bp.route('/inscription', methods=['POST'])
def register():
    data = request.get_json()
    form = RegisterForm(data=data)
    
    # Remplit manuellement les champs du formulaire
    form.process(data=data)

    if form.validate():
        if Utilisateurs.query.filter_by(email=form.email.data).first():
            return jsonify({'message': 'Email déjà utilisé'}), 400

        while True:
            new_id = "U" + str(uuid.uuid4().hex)[:8]
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

    else:
        # Renvoie les erreurs du formulaire (ex : champ manquant, email invalide, etc.)
        return jsonify({'errors': form.errors}), 400

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
RESET_TOKEN_EXPIRATION = 3600  # 1 heure en secondes
@auth_bp.route('/forgot-password', methods=['POST'])
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
        reset_url = f"{app.config['FRONTEND_URL']}/reset-password?token={token}"
        
        # Récupération du nom de l'application depuis la configuration
        app_name = app.config.get('APP_NAME', 'DocStorm')
        support_email = app.config.get('SUPPORT_EMAIL', 'support@example.com')
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
<body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- En-tête -->
        <div style="background-color: #2da0a8; padding: 30px 20px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-weight: 700; font-size: 28px; letter-spacing: 0.5px;">{app_name}</h2>
        </div>
        
        <!-- Contenu -->
        <div style="padding: 30px;">
            <p style="margin: 15px 0; font-size: 15px; color: #333333;">Bonjour <strong style="font-weight: 600; color: #5c6bc0;">{user_prenom}</strong>,</p>
            
            <p style="margin: 15px 0; font-size: 15px; color: #333333;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte {app_name}.</p>
            
            <p style="margin: 15px 0; font-size: 15px; color: #333333;">Pour réinitialiser votre mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
                <a href="{reset_url}" style="display: inline-block; background-color: #2da0a8; color: #ffffff; text-decoration: none; padding: 12px 25px; margin: 25px 0; border-radius: 8px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; text-align: center; font-size: 14px;">Réinitialiser mon mot de passe</a>
            </div>
            
            <p style="margin: 15px 0; font-size: 15px; color: #333333;">Ou copiez et collez ce lien dans votre navigateur :</p>
            
            <div style="word-break: break-all; background-color: #eeeeee; padding: 15px; border-radius: 8px; color: #333333; font-size: 14px;">
                <a href="{reset_url}" style="color: #2da0a8; text-decoration: none; font-weight: 500;">{reset_url}</a>
            </div>
            
            <div style="background-color: #c9d6ff; padding: 15px; border-radius: 8px; font-size: 14px; margin: 20px 0;">
                <strong>Note importante :</strong> Ce lien est valable pendant 1 heure à compter de la réception de cet e-mail.
            </div>
            
            <p style="margin: 15px 0; font-size: 15px; color: #333333;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail ou contacter notre support à <a href="mailto:{support_email}" style="color: #2da0a8;">{support_email}</a> si vous avez des inquiétudes concernant la sécurité de votre compte.</p>
        </div>
        
        <!-- Pied de page -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #999999; border-top: 1px solid #e2e2e2;">
            <p style="margin: 5px 0;"><strong>Cordialement,</strong></p>
            <p style="margin: 5px 0;">L'équipe {app_name}</p>
            <p style="margin-top: 10px; font-size: 12px;">&copy; {current_year} {app_name}. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>"""
        
        mail.send(msg)
        
        return jsonify({'message': 'Si cet e-mail existe, un lien de réinitialisation du mot de passe a été envoyé'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
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