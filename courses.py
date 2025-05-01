import os
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, IntegerField, SubmitField, TextAreaField, FileField,URLField
from wtforms.validators import DataRequired, Optional, NumberRange, URL

from Models import db,Cours, Favoris,Utilisateurs, Historique_Consultation, Profils_Utilisateurs, Avis,app
from security import *

from security import admin_required
from sqlalchemy import func, desc, asc, case, extract

import matplotlib.pyplot as plt
import pandas as pd
import io
import base64
from datetime import datetime, timedelta, timezone

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

    type_contenu = SelectField('Type de contenu', choices=[
        ('fichier', 'Fichier'),
        ('lien', 'Lien URL')
    ], validators=[DataRequired()])

    url_cours = URLField('URL du cours', validators=[
        Optional(),  # Le champ est facultatif car il ne s'applique que si type_contenu est 'lien'
        URL(message="L'URL doit être valide et commencer par http:// ou https://")
    ])

    fichier_cours = FileField("Télécharger le fichier", validators=[Optional()])



 # Limite de taille du fichier (16 Mo max)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class AvisForm(FlaskForm):
    note = SelectField("Note (1 à 5)", 
                      choices=[(1, "1"), (2, "2"), (3, "3"), (4, "4"), (5, "5")],
                      validators=[DataRequired()],
                      coerce=int)
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
    timestamp = request.args.get('_t', '') # Paramètre timestamp ajouté pour éviter la mise en cache
    
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
        # Si aucun filtre, renvoyer les recommandations dynamiques
        cours_list = cours_recommandes(user_id)
        
        # S'assurer que les informations de favoris sont ajoutées
        favoris_ids = {f.cours_id for f in Favoris.query.filter_by(user_id=user_id).all()}
        
        # Ajouter l'information est_favori à chaque cours
        for cours in cours_list:
            cours["est_favori"] = cours["id_cours"] in favoris_ids
            
        return jsonify(cours_list), 200
    
    # Pour les résultats de recherche, aussi ajouter l'information des favoris
    favoris_ids = {f.cours_id for f in Favoris.query.filter_by(user_id=user_id).all()}
    
    result = [{
        "id_cours": cours.id_cours,
        "nom": cours.nom,
        "domaine": cours.domaine,
        "type_ressource": cours.type_ressource,
        "niveau": cours.niveau,
        "langue": cours.langue,
        "objectifs": cours.objectifs,
        "chemin_source": cours.chemin_source,
        "nombre_vues": cours.nombre_vues,
        "est_favori": cours.id_cours in favoris_ids
    } for cours in cours_list]
    
    return jsonify(result), 200

##########
@courses_bp.route('/api/admin/cours', methods=['GET'])
@login_required
@admin_required
def AdminCours():

    # Récupérer les paramètres de la requête
    search = request.args.get('search', '')
    domaine = request.args.get('domaine', '')
   
    query = db.session.query(Cours)
    cours_list = []

    # Appliquer les filtres si des paramètres sont présents
    if search or domaine:
        if search:
            query = query.filter(Cours.nom.ilike(f"%{search}%"))
        if domaine:
            query = query.filter(Cours.domaine == domaine)
    cours_list = query.all()
    
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
            "id_cours": cours.id_cours,
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
                "id": a.id_avis,
                "utilisateur": a.utilisateur.nom,
                "note": a.note,
                "commentaire": a.commentaire,
                "date": a.date
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
        # Récupérer les données du formulaire
        nom = form.nom.data
        type_ressource = form.type_ressource.data
        domaine = form.domaine.data
        langue = form.langue.data
        niveau = form.niveau.data
        objectifs = form.objectifs.data
        durée = form.durée.data
        type_contenu = form.type_contenu.data
        
        chemin_source = ""
        
        # Traitement selon le type de contenu (fichier ou lien)
        if type_contenu == 'lien':
            # Vérifier et utiliser l'URL fournie
            url_cours = form.url_cours.data
            
            # Vérification simple de l'URL (peut être améliorée)
            if not url_cours or not (url_cours.startswith('http://') or url_cours.startswith('https://')):
                return jsonify({"error": "URL invalide. Elle doit commencer par http:// ou https://"}), 400
                
            chemin_source = url_cours
            
        else:  # type_contenu == 'fichier'
            # Vérifier qu'un fichier a été fourni
            if not form.fichier_cours.data:
                return jsonify({"error": "Le fichier est obligatoire pour un nouveau cours de type fichier."}), 400
                
            # Vérifier si le fichier a une extension autorisée
            if form.fichier_cours.data and allowed_file(form.fichier_cours.data.filename):
                filename = secure_filename(form.fichier_cours.data.filename)

                # Créer la structure de répertoire dynamique
                folder_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cours', domaine, langue, niveau, type_ressource)
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)

                # Sauvegarder le fichier dans le répertoire
                filepath = os.path.join(folder_path, filename)
                form.fichier_cours.data.save(filepath)
                
                # Stocke un chemin relatif
                chemin_source = os.path.relpath(filepath, 'static/').replace("\\", "/")
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
            chemin_source=chemin_source
        )

        db.session.add(nouveau_cours)
        db.session.commit()

        return jsonify({"message": "Cours ajouté avec succès", "id": nouveau_cours.id_cours}), 201

    return jsonify({"errors": form.errors}), 400


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
        
        # Déterminer le type de contenu actuel (fichier ou lien)
        est_lien = cours_a_modifier.chemin_source.startswith('http://') or cours_a_modifier.chemin_source.startswith('https://')
        
        # Si c'est un lien et qu'une nouvelle URL est fournie
        if est_lien and form.url_cours.data:
            # Vérification simple de l'URL
            url_cours = form.url_cours.data
            if not (url_cours.startswith('http://') or url_cours.startswith('https://')):
                return jsonify({"error": "URL invalide. Elle doit commencer par http:// ou https://"}), 400
                
            cours_a_modifier.chemin_source = url_cours
            
        # Si c'est un fichier et qu'un nouveau fichier est fourni
        elif not est_lien and form.fichier_cours.data:
            # Vérifier si le fichier a une extension autorisée
            if allowed_file(form.fichier_cours.data.filename):
                # Supprimer l'ancien fichier s'il existe
                ancien_chemin_absolu = os.path.join(app.config['UPLOAD_FOLDER'], cours_a_modifier.chemin_source)
                if os.path.exists(ancien_chemin_absolu):
                    os.remove(ancien_chemin_absolu)

                # Enregistrer le nouveau fichier
                chemin_source = form.fichier_cours.data
                filename = secure_filename(chemin_source.filename)

                # Créer la structure de répertoire dynamique pour le nouveau fichier
                folder_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cours', 
                                         cours_a_modifier.domaine, cours_a_modifier.langue, 
                                         cours_a_modifier.niveau, cours_a_modifier.type_ressource)
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)

                # Sauvegarder le nouveau fichier dans le répertoire
                filepath = os.path.join(folder_path, filename)
                chemin_source.save(filepath)

                # Mettre à jour le chemin du fichier dans la base de données
                cours_a_modifier.chemin_source = os.path.relpath(filepath, 'static/').replace("\\", "/")
            else:
                return jsonify({"error": "Fichier non autorisé."}), 400
                
        # Si c'est un fichier mais pas de nouveau fichier fourni, et que les infos ont changé
        elif not est_lien and not form.fichier_cours.data:
            # On vérifie si on doit déplacer le fichier à cause des changements de domaine/langue/etc.
            ancien_chemin = os.path.join(app.config['UPLOAD_FOLDER'], cours_a_modifier.chemin_source)
            if os.path.exists(ancien_chemin):
                ancien_nom_fichier = os.path.basename(ancien_chemin)
                
                nouveau_dossier = os.path.join(app.config['UPLOAD_FOLDER'], 'cours', 
                                             form.domaine.data, form.langue.data, 
                                             form.niveau.data, form.type_ressource.data)
                if not os.path.exists(nouveau_dossier):
                    os.makedirs(nouveau_dossier)

                nouveau_chemin = os.path.join(nouveau_dossier, ancien_nom_fichier)

                # Déplacer le fichier s'il n'est pas déjà à cet endroit
                if ancien_chemin != nouveau_chemin:
                    os.rename(ancien_chemin, nouveau_chemin)

                # Mettre à jour le chemin dans la BDD
                cours_a_modifier.chemin_source = os.path.relpath(nouveau_chemin, 'static/').replace("\\", "/")

        # Sauvegarder les modifications dans la base de données
        db.session.commit()

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
    cours = Cours.query.get_or_404(id_cours)
    user_id = current_user.id_user
    message = ""
    
    # Pour les appels API directs
    if request.path.startswith('/api/cours/avis/'):
        if request.method == 'POST':
            if request.is_json:
                # Récupérer les données JSON
                data = request.get_json()
                note = data.get('note')
                commentaire = data.get('commentaire', '').strip()
                
                # Vérifications basiques
                if not note or not isinstance(note, int) or note < 1 or note > 5:
                    return jsonify({"error": "Note invalide. Doit être un nombre entre 1 et 5."}), 400
                
                # Vérifier si un avis existe déjà
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
            # Si ce n'est pas du JSON, essayer de traiter comme form-data
            else:
                if form.validate_on_submit():
                    note = form.note.data
                    commentaire = form.commentaire.data.strip()
                    
                    # Même logique que ci-dessus pour le traitement
                    # ...
                return jsonify({"errors": form.errors}), 400
        
        # Si GET request à l'endpoint API, retourner la structure du formulaire
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
        return jsonify({"form": form_schema}), 200
    
    # Si la fonction est appelée depuis une autre fonction (pas directement comme route)
    return form

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
   
    # Obtenir les IDs des cours déjà vus, favoris ou notés
    historique_ids = [h.cours_id for h in Historique_Consultation.query.filter_by(user_id=user_id).all()]
    favoris_ids = [f.cours_id for f in Favoris.query.filter_by(user_id=user_id).all()]
    avis_user = Avis.query.filter_by(user_id=user_id).all()
    avis_ids = [a.cours_id for a in avis_user]
    
    # Obtenir les préférences du profil utilisateur
    profil = Profils_Utilisateurs.query.filter_by(user_id=user_id).first()
    domaine_pref = profil.domaine_intérêt if profil else None
    objectif_pref = profil.objectifs if profil else None
    
    # Déterminer les cours à exclure des recommandations
    # MODIFICATION: Ne pas exclure les cours favoris des recommandations
    # pour que l'utilisateur puisse continuer à les voir même s'ils sont favoris
    cours_exclus = set(historique_ids + avis_ids)  # On retire favoris_ids de cette liste
    
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
        
    result = query.group_by(Cours.id_cours).order_by(desc('score')).limit(50).all()
    
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


######################################################ADMIN


# Routes pour le tableau de bord administrateur

@courses_bp.route('/api/admin/stats', methods=['GET'])
@login_required
@admin_required
def admin_stats():
    """Récupère les statistiques générales pour le dashboard administrateur"""
    
    # Calculer le nombre total d'utilisateurs
    total_users = Utilisateurs.query.count()
    
    # Calculer le nombre total de cours
    total_courses = Cours.query.count()
    
    # Calculer le nombre de vues aujourd'hui
    aujourd_hui = datetime.now(timezone.utc).date()
    views_today = Historique_Consultation.query.filter(
        func.date(Historique_Consultation.date_consultation) == aujourd_hui
    ).count()
    
    # Calculer le nombre de nouveaux utilisateurs dans les 7 derniers jours
    semaine_derniere = aujourd_hui - timedelta(days=7)
    new_users_last_week = Utilisateurs.query.filter(
        func.date(Utilisateurs.date_inscription) >= semaine_derniere
    ).count()
    
    # Distribution par type de ressource
    resource_types = db.session.query(
        Cours.type_ressource.label('name'),
        func.count(Cours.id_cours).label('value')
    ).group_by(Cours.type_ressource).all()
    
    resource_type_distribution = [{'name': rt.name, 'value': rt.value} for rt in resource_types]
    
    # Distribution par domaine
    domains = db.session.query(
        Cours.domaine.label('name'),
        func.count(Cours.id_cours).label('value')
    ).group_by(Cours.domaine).all()
    
    domain_distribution = [{'name': d.name, 'value': d.value} for d in domains]
    
    return jsonify({
        'totalUsers': total_users,
        'totalCourses': total_courses,
        'viewsToday': views_today,
        'newUsersLastWeek': new_users_last_week,
        'resourceTypeDistribution': resource_type_distribution,
        'domainDistribution': domain_distribution
    }), 200


@courses_bp.route('/api/admin/top-courses', methods=['GET'])
@login_required
@admin_required
def top_courses():
    """Récupère les 10 cours les plus consultés avec statistiques détaillées"""
    
    # Import distinct si nécessaire
    from sqlalchemy import distinct
    
    top_courses = db.session.query(
        Cours,
        func.coalesce(func.avg(Avis.note), 0).label('moyenne_note'),
        func.count(distinct(Favoris.id_favoris)).label('nombre_favoris')
    ).outerjoin(
        Avis, Cours.id_cours == Avis.cours_id
    ).outerjoin(
        Favoris, Cours.id_cours == Favoris.cours_id
    ).group_by(
        Cours.id_cours
    ).order_by(
        desc(Cours.nombre_vues)
    ).limit(10).all()
    
    result = [{
        'id_cours': course.id_cours,
        'nom': course.nom,
        'domaine': course.domaine,
        'type_ressource': course.type_ressource,
        'niveau': course.niveau,
        'nombre_vues': course.nombre_vues,
        'moyenne_note': float(moyenne_note),
        'nombre_favoris': nombre_favoris
    } for course, moyenne_note, nombre_favoris in top_courses]
    
    return jsonify(result), 200


@courses_bp.route('/api/admin/courses-activity', methods=['GET'])
@login_required
@admin_required
def courses_activity():
    """Récupère l'activité des cours (consultations et favoris) sur une période donnée"""
    
    time_frame = request.args.get('timeFrame', 'week')
    today = datetime.now(timezone.utc).date()
    
    if time_frame == 'week':
        days = 7
        format_str = '%Y-%m-%d'  # Format quotidien
    elif time_frame == 'month':
        days = 30
        format_str = '%Y-%m-%d'  # Format quotidien
    else:  # year
        days = 365
        format_str = '%Y-%m'  # Format mensuel
    
    start_date = today - timedelta(days=days)
    
    # Vérifier si l'attribut date_ajout existe dans la classe Favoris
    has_date_ajout = hasattr(Favoris, 'date_ajout')
    
    if time_frame in ['week', 'month']:
        # Activité quotidienne
        consultations = db.session.query(
            func.date(Historique_Consultation.date_consultation).label('date'),
            func.count().label('count')
        ).filter(
            func.date(Historique_Consultation.date_consultation) >= start_date
        ).group_by(
            func.date(Historique_Consultation.date_consultation)
        ).all()
        
        if has_date_ajout:
            favoris = db.session.query(
                func.date(Favoris.date_ajout).label('date'),
                func.count().label('count')
            ).filter(
                func.date(Favoris.date_ajout) >= start_date
            ).group_by(
                func.date(Favoris.date_ajout)
            ).all()
        else:
            # Utiliser une valeur par défaut si date_ajout n'existe pas
            favoris = []
        
    else:
        # Activité mensuelle
        consultations = db.session.query(
            func.strftime('%Y-%m', Historique_Consultation.date_consultation).label('date'),
            func.count().label('count')
        ).filter(
            func.date(Historique_Consultation.date_consultation) >= start_date
        ).group_by(
            func.strftime('%Y-%m', Historique_Consultation.date_consultation)
        ).all()
        
        if has_date_ajout:
            favoris = db.session.query(
                func.strftime('%Y-%m', Favoris.date_ajout).label('date'),
                func.count().label('count')
            ).filter(
                func.date(Favoris.date_ajout) >= start_date
            ).group_by(
                func.strftime('%Y-%m', Favoris.date_ajout)
            ).all()
        else:
            favoris = []
    
    # Créer une liste de dates pour l'intervalle
    date_list = []
    current_date = start_date
    
    while current_date <= today:
        if time_frame in ['week', 'month']:
            date_list.append(current_date.strftime(format_str))
            current_date += timedelta(days=1)
        else:
            date_list.append(current_date.strftime(format_str))
            # Avancer d'un mois
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
    
    # Convertir les résultats de requête en dictionnaires pour faciliter la recherche
    consultations_dict = {str(c.date): c.count for c in consultations}
    favoris_dict = {str(f.date): f.count for f in favoris} if favoris else {}
    
    # Créer la structure de données finale
    activity_data = []
    for date_str in date_list:
        activity_data.append({
            'date': date_str,
            'consultations': consultations_dict.get(date_str, 0),
            'favoris': favoris_dict.get(date_str, 0)
        })
    
    return jsonify(activity_data), 200


@courses_bp.route('/api/admin/users-activity', methods=['GET'])
@login_required
@admin_required
def users_activity():
    """Récupère l'activité des utilisateurs sur une période donnée"""
    
    # Import distinct si nécessaire
    from sqlalchemy import distinct
    
    time_frame = request.args.get('timeFrame', 'week')
    today = datetime.now(timezone.utc).date()
    
    if time_frame == 'week':
        days = 7
        format_str = '%Y-%m-%d'  # Format quotidien
    elif time_frame == 'month':
        days = 30
        format_str = '%Y-%m-%d'  # Format quotidien
    else:  # year
        days = 365
        format_str = '%Y-%m'  # Format mensuel
    
    start_date = today - timedelta(days=days)
    
    # Vérifier si l'attribut date_inscription existe dans la classe Utilisateurs
    has_date_inscription = hasattr(Utilisateurs, 'date_inscription')
    
    if time_frame in ['week', 'month']:
        # Nouveaux utilisateurs par jour
        if has_date_inscription:
            nouveaux_utilisateurs = db.session.query(
                func.date(Utilisateurs.date_inscription).label('date'),
                func.count().label('count')
            ).filter(
                func.date(Utilisateurs.date_inscription) >= start_date
            ).group_by(
                func.date(Utilisateurs.date_inscription)
            ).all()
        else:
            nouveaux_utilisateurs = []
        
        # Utilisateurs actifs par jour (ceux qui ont consulté au moins un cours)
        utilisateurs_actifs = db.session.query(
            func.date(Historique_Consultation.date_consultation).label('date'),
            func.count(distinct(Historique_Consultation.user_id)).label('count')
        ).filter(
            func.date(Historique_Consultation.date_consultation) >= start_date
        ).group_by(
            func.date(Historique_Consultation.date_consultation)
        ).all()
        
    else:
        # Nouveaux utilisateurs par mois
        if has_date_inscription:
            nouveaux_utilisateurs = db.session.query(
                func.strftime('%Y-%m', Utilisateurs.date_inscription).label('date'),
                func.count().label('count')
            ).filter(
                func.date(Utilisateurs.date_inscription) >= start_date
            ).group_by(
                func.strftime('%Y-%m', Utilisateurs.date_inscription)
            ).all()
        else:
            nouveaux_utilisateurs = []
        
        # Utilisateurs actifs par mois
        utilisateurs_actifs = db.session.query(
            func.strftime('%Y-%m', Historique_Consultation.date_consultation).label('date'),
            func.count(distinct(Historique_Consultation.user_id)).label('count')
        ).filter(
            func.date(Historique_Consultation.date_consultation) >= start_date
        ).group_by(
            func.strftime('%Y-%m', Historique_Consultation.date_consultation)
        ).all()
    
    # Créer une liste de dates pour l'intervalle
    date_list = []
    current_date = start_date
    
    while current_date <= today:
        if time_frame in ['week', 'month']:
            date_list.append(current_date.strftime(format_str))
            current_date += timedelta(days=1)
        else:
            date_list.append(current_date.strftime(format_str))
            # Avancer d'un mois
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
    
    # Convertir les résultats de requête en dictionnaires pour faciliter la recherche
    nouveaux_dict = {str(nu.date): nu.count for nu in nouveaux_utilisateurs} if nouveaux_utilisateurs else {}
    actifs_dict = {str(ua.date): ua.count for ua in utilisateurs_actifs}
    
    # Créer la structure de données finale
    activity_data = []
    for date_str in date_list:
        activity_data.append({
            'date': date_str,
            'nouveauxUtilisateurs': nouveaux_dict.get(date_str, 0),
            'utilisateursActifs': actifs_dict.get(date_str, 0)
        })
    
    return jsonify(activity_data), 200