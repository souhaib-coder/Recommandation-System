from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField
from wtforms.validators import InputRequired, Email, Length, EqualTo, ValidationError
from flask_login import login_user, logout_user, login_required
from datetime import datetime
import random
from security import *


from Models import bcrypt

from Models import db, login_manager, Utilisateurs, Profils_Utilisateurs

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
    class Meta:
        csrf = False

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
    data= request.json
    form = loginForm(data=data)
    if form.validate():
        user = Utilisateurs.query.filter_by(email=form.email.data).first()
        if user:
            if bcrypt.check_password_hash(user.mot_de_passe, form.password.data):
                login_user(user)
                return jsonify({'success': True, 'message': 'Connexion réussie', "admin": current_user.rôle == 'admin'})
        return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401
    return jsonify({'success': False, 'message': form.errors}), 400



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
            return jsonify({'success': False, 'message': 'Email déjà utilisé'}), 400
        
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

        return jsonify({'success': True, 'message': 'Inscription réussie'})
    return jsonify({'success': False, 'message': form.errors}), 400
