from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user, logout_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField
from wtforms.validators import DataRequired, InputRequired, Email, Length, EqualTo,ValidationError
from datetime import datetime
from flask_bcrypt import bcrypt, Bcrypt
from security import *


from Models import db, Cours, Favoris, Historique_Consultation, Profils_Utilisateurs, Utilisateurs

users_bp = Blueprint('users', __name__)

class UpdateProfilForm(FlaskForm):
    domaine_intérêt = SelectField("Domaine d'intérêt", choices=[
        ('Informatique', 'Informatique'),
        ('Mathématiques', 'Mathématiques'),
        ('Physique', 'Physique'),
        ('Langues', 'Langues')
    ], validators=[DataRequired()])

    objectifs = SelectField("Objectifs", choices=[
        ('Révision', 'Révision'),
        ('Préparation examen', 'Préparation examen'),
        ('Apprentissage', 'Apprentissage'),
        ('Approfondissement', 'Approfondissement')
    ], validators=[DataRequired()])

    submit = SubmitField("Mettre à jour")

@users_bp.route('/profil')
@login_required_route
def profil():
    form = DeleteAccountForm()
    profil = Profils_Utilisateurs.query.filter_by(user_id=current_user.id_user).first()
    return render_template('profil.html', user=current_user, profil=profil, form=form)

class ModifierProfilForm(FlaskForm):
    nom = StringField("Nom", validators=[DataRequired()])
    prenom = StringField("Prénom", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    submit = SubmitField("Enregistrer")

@users_bp.route('/profil/modifier', methods=['GET', 'POST'])
@login_required_route
def modifier_profil():
    form = ModifierProfilForm(obj=current_user)
    if form.validate_on_submit():
        current_user.nom = form.nom.data
        current_user.prenom = form.prenom.data
        current_user.email = form.email.data
        db.session.commit()
        flash("Profil mis à jour avec succès", "success")
        return redirect(url_for('users.profil'))
    return render_template('modifier_profil.html', form=form, user=current_user)

@users_bp.route('/profil/update', methods=['GET', 'POST'])
@login_required_route
def update_profil():
    form = UpdateProfilForm()
    profil = Profils_Utilisateurs.query.filter_by(user_id=current_user.id_user).first()

    if form.validate_on_submit():
        domaine_intérêt = form.domaine_intérêt.data
        objectifs = form.objectifs.data

        if not profil:
            profil = Profils_Utilisateurs(
                user_id=current_user.id_user,
                domaine_intérêt=domaine_intérêt,
                objectifs=objectifs,
                date_mise_à_jour=datetime.now()
            )
            db.session.add(profil)
        else:
            profil.domaine_intérêt = domaine_intérêt
            profil.objectifs = objectifs
            profil.date_mise_à_jour = datetime.now()

        db.session.commit()
        flash("Profil mis à jour avec succès !", "success")
        return redirect(url_for('courses.dashboard'))
    if profil and request.method == 'GET':
        form.domaine_intérêt.data = profil.domaine_intérêt
        form.objectifs.data = profil.objectifs

    return render_template('update_profil.html', user=current_user, form=form)



class DeleteAccountForm(FlaskForm):
    submit = SubmitField("Supprimer mon compte")


@users_bp.route('/profil/delete', methods=['POST'])
@login_required_route
def supprimer_compte():
    form = DeleteAccountForm()
    if form.validate_on_submit():  # Vérifie le token CSRF
        try:
            db.session.delete(current_user)
            db.session.commit()
            logout_user()
            return redirect(url_for('home'))
        except Exception as e:
            db.session.rollback()
    
    return redirect(url_for('users.profil'))





class ChangerMotDePasseForm(FlaskForm):
    ancien_mot_de_passe = PasswordField("Ancien mot de passe", validators=[InputRequired()])
    nouveau_mot_de_passe = PasswordField("Nouveau mot de passe", validators=[
        InputRequired(), Length(min=8)
    ])
    confirmation_mot_de_passe = PasswordField("Confirmer le mot de passe", validators=[
        InputRequired(), EqualTo('nouveau_mot_de_passe', message="Les mots de passe doivent correspondre.")
    ])
    submit = SubmitField("Changer le mot de passe")

    def validate_ancien_mdp(self, ancien_mot_de_passe):
        if not bcrypt.check_password_hash(current_user.mot_de_passe, ancien_mot_de_passe.data):
            raise ValidationError("L'ancien mot de passe est incorrect.")


@users_bp.route('/profil/changer_mot_de_passe/reset', methods=['GET', 'POST'])
@login_required_route
def changer_mot_de_passe():
    form = ChangerMotDePasseForm()
    if form.validate_on_submit():
            current_user.mot_de_passe = Bcrypt.generate_password_hash(form.nouveau_mot_de_passe.data)
            db.session.commit()
            flash("Mot de passe mis à jour", "success")
            return redirect(url_for('courses.dashboard'))  # ← Attention au blueprint ici : à adapter selon ton projet
    return render_template('changer_mot_de_passe.html', form=form)
#######
#####
@users_bp.route('/profil/favoris')
@login_required_route
def afficher_favoris():
    utilisateur = current_user
    favoris = utilisateur.favoris
    return render_template('favoris.html', utilisateur=utilisateur, favoris=favoris, cours=Cours)

'''@users_bp.route('/supprimer_favori/<int:favori_id>', methods=['POST'])
@login_required_route
def supprimer_favori(favori_id):
    favori = Favoris.query.filter_by(id_favoris=favori_id).first()
    if favori:
        db.session.delete(favori)
        db.session.commit()
        flash("Favori supprimé avec succès.", "success")
    else:
        flash("Erreur : Favori introuvable.", "danger")
    return redirect(url_for('users.afficher_favoris'))'''

@users_bp.route('/profil/historique')
@login_required_route
def afficher_historique():
    historique = Historique_Consultation.query.filter_by(user_id=current_user.id_user).all()
    return render_template('historique.html', historique=historique, cours=Cours)
