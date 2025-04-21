import os
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, IntegerField, SubmitField, TextAreaField, FileField
from wtforms.validators import DataRequired, Optional, NumberRange
from sqlalchemy import func, desc

from Models import db,Cours, Favoris,Utilisateurs, Historique_Consultation, Profils_Utilisateurs, Avis,app,datetime,timezone
from security import *

#from recommendations import hybrid_recommendations

courses_bp = Blueprint('courses', __name__)

###########
class SearchForm(FlaskForm):
    search = StringField('Recherche', validators=[Optional()])
    domaine = SelectField('Domaine', choices=[
        ("", "Domaine"),
        ("Informatique", "Informatique"),
        ("Mathématiques", "Mathématiques"),
        ("Physique", "Physique"),
        ("Chimie", "Chimie"),
        ("Langues", "Langues")
    ], validators=[Optional()])
    
    type_ressource = SelectField('Type', choices=[
        ("", "Type"),
        ("Tutoriel", "Tutoriel"),
        ("Cours", "Cours"),
        ("Livre", "Livre"),
        ("TD", "TD")
    ], validators=[Optional()])
    
    niveau = SelectField('Niveau', choices=[
        ("", "Niveau"),
        ("Débutant", "Débutant"),
        ("Intermédiaire", "Intermédiaire"),
        ("Avancé", "Avancé")
    ], validators=[Optional()])

    submit = SubmitField('Rechercher')

class CoursForm(FlaskForm):
    nom = StringField("Nom du cours", validators=[DataRequired()])
    type_ressource = SelectField("Type de ressource", 
                                 choices=[('Tutoriel', 'Tutoriel'), 
                                          ('Cours', 'Cours'), 
                                          ('Livre', 'Livre'), 
                                          ('TD', 'TD')], 
                                 validators=[DataRequired()])
    domaine = SelectField("Domaine", 
                          choices=[('Informatique', 'Informatique'), 
                                   ('Mathématiques', 'Mathématiques'),
                                   ('Physique', 'Physique'), 
                                   ('Chimie', 'Chimie'), 
                                   ('Langues', 'Langues')],
                          validators=[DataRequired()])
    langue = SelectField("Langue", 
                         choices=[('Français', 'Français'),
                                  ('Anglais', 'Anglais'),
                                  ('Arabe', 'Arabe')],
                         validators=[DataRequired()])
    niveau = SelectField("Niveau", 
                         choices=[('Débutant', 'Débutant'), 
                                  ('Intermédiaire', 'Intermédiaire'),
                                  ('Avancé', 'Avancé')],
                         validators=[DataRequired()])
    objectifs = SelectField("Objectifs", 
                            choices=[('Révision', 'Révision'), 
                                     ('Préparation examen', 'Préparation examen'),
                                     ('Apprentissage', 'Apprentissage'), 
                                     ('Approfondissement', 'Approfondissement')],
                            validators=[DataRequired()])
    durée = IntegerField("Durée (en heures)", validators=[Optional()])

    fichier_cours = FileField("Télécharger le fichier", validators=[Optional()])



 # Limite de taille du fichier (16 Mo max)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class AvisForm(FlaskForm):
    note = IntegerField("Note (1 à 5)", validators=[DataRequired(), NumberRange(min=1, max=5)])
    commentaire = TextAreaField("Commentaire")
    submit = SubmitField("Envoyer l'avis")

UPLOAD_FOLDER = 'static/'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'pptx', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 



@courses_bp.route('/api/cours', methods=['GET'])
@login_required
def search_cours():
    user_id = current_user.id_user

    # Récupérer les paramètres de la requête
    search = request.args.get('search', '')
    domaine = request.args.get('domaine', '')
    type_ressource = request.args.get('type_ressource', '')
    niveau = request.args.get('niveau', '')

    query = db.session.query(Cours)
    cours_list = []

    # Appliquer les filtres si des paramètres sont présents
    if search or domaine or type_ressource or niveau:
        if search:
            query = query.filter(Cours.nom.ilike(f"%{search}%"))
        if domaine:
            query = query.filter(Cours.domaine == domaine)
        if type_ressource:
            query = query.filter(Cours.type_ressource == type_ressource)
        if niveau:
            query = query.filter(Cours.niveau == niveau)
        cours_list = query.all()
    else:
        # Si aucun filtre, renvoyer les recommandations
        cours_list = cours_recommandes(user_id)
        return jsonify(cours_list)

    return jsonify([{
            "id_cours": cours.id_cours,
            "nom": cours.nom,
            "domaine": cours.domaine,
            "type_ressource": cours.type_ressource,
            "niveau": cours.niveau,
            "langue": cours.langue,
            "objectifs": cours.objectifs,
            "chemin_source": cours.chemin_source,
            "nombre_vues": cours.nombre_vues,
        } for cours in cours_list]), 200

#######
@courses_bp.route('/api/cours/details/<int:id_cours>', methods=['GET', 'POST'])
@login_required
def details_cours(id_cours):
    cours = Cours.query.get_or_404(id_cours)
    form=ajouter_avis(id_cours)
    # Incrémentation du nombre de vues
    db.session.commit()
    enregistrer_consultation(id_user=current_user.id_user, id_cours=id_cours, titre_cours=cours.nom)
    # Récupérer les avis du cours
    avis = Avis.query.filter_by(cours_id=id_cours).all()

    favoris_cours_ids = [favori.cours.id_cours for favori in current_user.favoris]  # cette ligne crée une liste favoris_cours_ids qui contient les identifiants des cours favoris de l'utilisateur.
    est_favori = cours.id_cours in favoris_cours_ids

    form_schema = {
        'note': {
            'label': form.note.label.text,
            'type': 'select',
            'choices': form.note.choices
        },
        'commentaire': {
            'label': form.commentaire.label.text,
            'type': 'textarea'
        }
    }

    return jsonify({
        "cours": {
            "id": cours.id_cours,
            "nom": cours.nom,
            "domaine": cours.domaine,
            "type_ressource": cours.type_ressource,
            "niveau": cours.niveau,
            "langue": cours.langue,
            "objectifs": cours.objectifs,
            "chemin_source": cours.chemin_source,
            "nombre_vues": cours.nombre_vues,
            "est_favori": est_favori
        },
        "avis": [
            {
                "id": a.id,
                "utilisateur": a.utilisateur.username,
                "note": a.note,
                "commentaire": a.commentaire,
                "date": a.date.strftime("%Y-%m-%d")
            } for a in avis
        ],
        "form_schema": form_schema,
        "admin": current_user.rôle == "admin"
    }), 200


##########admin ajoute cours


@courses_bp.route("/api/admin/cours/ajouter", methods=["GET", "POST"])
@login_required
@admin_required
def ajouter_cours():

    form = CoursForm()

    if form.validate_on_submit():
        if not form.fichier_cours.data:
            return jsonify({"error": "Le fichier est obligatoire pour un nouveau cours."}), 400

        # Récupérer les données du formulaire
        nom = form.nom.data
        type_ressource = form.type_ressource.data
        domaine = form.domaine.data
        langue = form.langue.data
        niveau = form.niveau.data
        objectifs = form.objectifs.data
        durée = form.durée.data
        chemin_source = form.fichier_cours.data

        # Vérifier si le fichier a une extension autorisée
        if chemin_source and allowed_file(chemin_source.filename):
            filename = secure_filename(chemin_source.filename)

            # Créer la structure de répertoire dynamique
            folder_path = os.path.join(app.config['UPLOAD_FOLDER'],'cours', domaine, langue, niveau, type_ressource)
            if not os.path.exists(folder_path):
                os.makedirs(folder_path)

            # Sauvegarder le fichier dans le répertoire
            filepath = os.path.join(folder_path, filename)
            chemin_source.save(filepath)  #enregistre le fichier uploadé dans ce chemin
        else:
            return jsonify({"error": "Fichier non autorisé."}), 400

        # Ajouter le cours à la base de données
        nouveau_cours = Cours(
            nom=nom,
            type_ressource=type_ressource,
            domaine=domaine,
            langue=langue,
            niveau=niveau,
            objectifs=objectifs,
            durée=durée if durée else None,
            chemin_source = os.path.relpath(filepath, 'static/').replace("\\", "/")  # Stocke un chemin relatif

        )

        db.session.add(nouveau_cours)
        db.session.commit()

        return jsonify({"message": "Cours ajouté avec succès", "id": nouveau_cours.id_cours}), 201

    return jsonify({"errors": form.errors}), 400
#######

######maj
@courses_bp.route('/api/admin/cours/update/<int:id_cours>', methods=['GET', 'POST'])
@login_required
@admin_required
def mettre_a_jour_cours(id_cours):

   

    # Récupérer le cours à modifier à partir de l'ID
    cours_a_modifier = Cours.query.get_or_404(id_cours)

    # Créer un formulaire pré-rempli avec les données actuelles du cours
    form = CoursForm()

    if form.validate_on_submit():
        # Récupérer les nouvelles données du formulaire
        cours_a_modifier.nom = form.nom.data
        cours_a_modifier.type_ressource = form.type_ressource.data
        cours_a_modifier.domaine = form.domaine.data
        cours_a_modifier.langue = form.langue.data
        cours_a_modifier.niveau = form.niveau.data
        cours_a_modifier.objectifs = form.objectifs.data
        cours_a_modifier.durée = form.durée.data

        # Si un nouveau fichier est téléchargé
        if form.fichier_cours.data and allowed_file(form.fichier_cours.data.filename):
            # Supprimer l'ancien fichier
            if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], cours_a_modifier.chemin_source)):
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'] ,cours_a_modifier.chemin_source))

            # Enregistrer le nouveau fichier
            chemin_source = form.fichier_cours.data
            filename = secure_filename(chemin_source.filename)

            # Créer la structure de répertoire dynamique pour le nouveau fichier
            folder_path = os.path.join(app.config['UPLOAD_FOLDER'],'cours', cours_a_modifier.domaine, cours_a_modifier.langue, cours_a_modifier.niveau, cours_a_modifier.type_ressource)
            if not os.path.exists(folder_path):
                os.makedirs(folder_path)

            # Sauvegarder le nouveau fichier dans le répertoire
            filepath = os.path.join(folder_path, filename)
            chemin_source.save(filepath)

            # Mettre à jour le chemin du fichier dans la base de données
            cours_a_modifier.chemin_source = os.path.relpath(filepath, 'static/').replace("\\", "/")
        else:
            # Pas de nouveau fichier mais les infos (domaine/langue/etc.) ont changé → déplacer l'ancien fichier
            ancien_chemin = os.path.join(app.config['UPLOAD_FOLDER'], cours_a_modifier.chemin_source)
            ancien_nom_fichier = os.path.basename(ancien_chemin)

            nouveau_dossier = os.path.join(app.config['UPLOAD_FOLDER'], 'cours', form.domaine.data, form.langue.data, form.niveau.data, form.type_ressource.data)
            if not os.path.exists(nouveau_dossier):
                os.makedirs(nouveau_dossier)

            nouveau_chemin = os.path.join(nouveau_dossier, ancien_nom_fichier)

            # Déplacer le fichier s’il n’est pas déjà à cet endroit
            if ancien_chemin != nouveau_chemin and os.path.exists(ancien_chemin):
                os.rename(ancien_chemin, nouveau_chemin)

            # Mettre à jour le chemin dans la BDD
            cours_a_modifier.chemin_source = os.path.relpath(nouveau_chemin, 'static/').replace("\\", "/")

        # Sauvegarder les modifications dans la base de données
        db.session.commit()

        # Message flash pour indiquer que le cours a été modifié avec succès

        # Rediriger vers la page de gestion des cours ou la liste des cours
        return jsonify({"message": "Cours modifié avec succès."}), 200

    return jsonify({"errors": form.errors}), 400

######ajou fav

@courses_bp.route('/api/profil/favoris/ajouter/<int:id_cours>', methods=['POST'])
@login_required
def ajouter_favoris(id_cours):
    user_id = current_user.id_user  # Récupérer l'ID de l'utilisateur connecté

    # Vérifier si le cours est déjà en favoris
    favori_existant = Favoris.query.filter_by(cours_id=id_cours, user_id=user_id).first()
    
    if favori_existant:
        # Si le cours est déjà dans les favoris, on le retire
        db.session.delete(favori_existant)
        db.session.commit()
        return jsonify({"message": "Le cours a été retiré de vos favoris.", "favori": False}), 200

    else:
        new_fav = Favoris(cours_id=id_cours, user_id=user_id)
        db.session.add(new_fav)
        db.session.commit()
        return jsonify({"message": "Favoris ajouté avec succès !", "favori": True}), 201
#######
###supp


@courses_bp.route('/api/admin/cours/delete/<int:id_cours>', methods=['POST'])
@login_required
@admin_required
def supprimer_cours(id_cours):
    # Vérifier si l'utilisateur est un administrateur
    # Récupérer le cours à supprimer à partir de l'ID
    cours_a_supprimer = Cours.query.get_or_404(id_cours)

    chemin_complet_fichier = os.path.join(app.config['UPLOAD_FOLDER'],cours_a_supprimer.chemin_source).replace("\\", "/")

    # Supprimer le fichier associé au cours
    if os.path.exists(chemin_complet_fichier):
        os.remove(chemin_complet_fichier)
        

    # Supprimer le cours de la base de données
    db.session.delete(cours_a_supprimer)
    db.session.commit()

    # Message flash pour indiquer que le cours a été supprimé
    
    # Rediriger vers la page d'administration ou la liste des cours
    return jsonify({"message": "Cours supprimé avec succès."}), 200
#############note

####



@courses_bp.route('/api/cours/avis/<int:id_cours>', methods=['GET', 'POST'])
@login_required
def ajouter_avis(id_cours):
    form = AvisForm()

    if request.is_json:
        form_data = request.get_json()
        form = AvisForm(data=form_data)
    
    cours = Cours.query.get_or_404(id_cours)
    user_id = current_user.id_user

    if form.validate_on_submit():
        note = form.note.data
        commentaire = form.commentaire.data.strip()

        avis_existant = Avis.query.filter_by(user_id=user_id, cours_id=id_cours).first()

        if avis_existant:

            if avis_existant.note != note:
                avis_existant.note = note
                message += "Votre note a été mise à jour. "

            if commentaire:
                nouvel_avis = Avis(
                user_id=user_id,
                cours_id=id_cours,
                note=avis_existant.note,
                commentaire=commentaire
                )
                db.session.add(nouvel_avis)
                message += "Commentaire ajouté."

        else:
            nouvel_avis = Avis(
                user_id=user_id,
                cours_id=id_cours,
                note=note,
                commentaire=commentaire if commentaire else None
            )
            db.session.add(nouvel_avis)
            message = "Votre avis a été enregistré avec succès."
        db.session.commit()
        return jsonify({"message": message}), 201
    return jsonify({"errors": form.errors}), 400

def enregistrer_consultation(id_user, id_cours, titre_cours):
    # Vérifier si la consultation existe déjà
    '''consultation_existante = Historique_Consultation.query.filter_by(user_id=id_user, cours_id=id_cours).first()
    
    if not consultation_existante:
        Cours.nombre_vues += 1
        nouvelle_consultation = Historique_Consultation(
            user_id=id_user,
            cours_id=id_cours
        )
        db.session.add(nouvelle_consultation)
        db.session.commit()
    
    print(f"Consultation ajoutée pour user {id_user} sur le cours {id_cours}")  # Debugging'''
    cours = Cours.query.get(id_cours)
    aujourd_hui = datetime.now(timezone.utc).date()  # Date d'aujourd'hui au format YYYY-MM-DD en UTC
    historique = Historique_Consultation.query.filter_by(user_id=current_user.id_user, cours_id=id_cours, date_consultation=aujourd_hui).first()

    if not historique:
        # L'utilisateur n'a pas encore vu ce cours aujourd'hui, donc on incrémente le nombre de vues
        cours.nombre_vues += 1
        db.session.commit()

        # Ajouter une nouvelle entrée dans l'historique avec l'heure de la consultation
        nouvel_historique = Historique_Consultation(
                        user_id=current_user.id_user,
                        cours_id=id_cours
                            )

        db.session.add(nouvel_historique)
        db.session.commit()
    else:
        # Si l'historique existe déjà, mettre à jour l'heure de consultation
        historique.heure_consultation = datetime.now(timezone.utc).time()  # Cela crée un objet time
        db.session.commit()


######popularrite
def cours_recommandes(user_id):
    utilisateur = Utilisateurs.query.get(user_id)
    if not utilisateur:
        return []
    
    historique_ids = [h.cours_id for h in Historique_Consultation.query.filter_by(user_id=user_id).all()]
    favoris_ids = [f.cours_id for f in Favoris.query.filter_by(user_id=user_id).all()]
    avis_user = Avis.query.filter_by(user_id=user_id).all()
    avis_ids = [a.cours_id for a in avis_user]

    profil = Profils_Utilisateurs.query.filter_by(user_id=user_id).first()
    domaine_pref = profil.domaine_intérêt if profil else None
    objectif_pref = profil.objectifs if profil else None

    cours_exclus = set(historique_ids + favoris_ids + avis_ids)

    query = db.session.query(
        Cours,
        func.coalesce(func.avg(Avis.note), 0).label("moyenne_note"),
        (
            0.3 * Cours.nombre_vues +
            0.3 * func.coalesce(func.avg(Avis.note), 0) * 20 +
            0.2 * func.count(Favoris.id_favoris) +
            0.2 * func.count(Historique_Consultation.id_historique)
        ).label("score")
    ).outerjoin(Avis, Cours.id_cours == Avis.cours_id
    ).outerjoin(Favoris, Cours.id_cours == Favoris.cours_id
    ).outerjoin(Historique_Consultation, Cours.id_cours == Historique_Consultation.cours_id)

    if domaine_pref:
        query = query.filter(Cours.domaine == domaine_pref)
    if objectif_pref:
        query = query.filter(Cours.objectifs == objectif_pref)
    if cours_exclus:
        query = query.filter(~Cours.id_cours.in_(cours_exclus))

    result = query.group_by(Cours.id_cours).order_by(desc('score')).limit(30).all()

    # Retourner une liste de tuples (cours, moyenne_note, score)
    return [{
        "id_cours": cours.id_cours,
        "nom": cours.nom,
        "domaine": cours.domaine,
        "type_ressource": cours.type_ressource,
        "niveau": cours.niveau,
        "langue": cours.langue,
        "objectifs": cours.objectifs,
        "chemin_source": cours.chemin_source,
        "nombre_vues": cours.nombre_vues,
        "moyenne_note": float(moyenne_note),
        "score": float(score)
    } for cours, moyenne_note, score in result]



@courses_bp.route('/api/dashboard', methods=['GET'])
@login_required
def dashboard():


    user_id = current_user.id_user

    # --- 1. Récupération des cours favoris ---
    favoris = Favoris.query.filter_by(user_id=user_id).all()
    favoris_cours = [{
        "id_cours": fav.cours.id_cours,
        "nom": fav.cours.nom,
        "domaine": fav.cours.domaine,
        "type_ressource": fav.cours.type_ressource,
        "niveau": fav.cours.niveau,
        "langue": fav.cours.langue,
        "objectifs": fav.cours.objectifs,
        "chemin_source": fav.cours.chemin_source,
        "nombre_vues": fav.cours.nombre_vues
    } for fav in favoris]

    # --- 2. Recommandations personnalisées ---
    

    # --- 3. Vérifier si l'utilisateur est un admin ---

    # --- 4. Retour final ---
    return jsonify({
        "admin": current_user.rôle == 'admin',
        "favoris": favoris_cours,
    }), 200

##########


'''resultats = []
    for cours, moyenne_note, score in cours_reco:
        resultats.append({
            "id_cours": cours.id_cours,
            "nom": cours.nom,
            "niveau": cours.niveau,
            "type_ressource": cours.type_ressource,
            "moyenne_note": moyenne_note,
            "score": score
        })'''