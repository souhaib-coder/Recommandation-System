import os
import random
from Models import app, db,Cours


'''
def importer_cours():
    dossier_cours = os.path.join(app.root_path, "static", "cours")  # Chemin vers le dossier des cours
    
    # Vérifier si le dossier existe
    if not os.path.exists(dossier_cours):
        print("⚠️ Le dossier des cours n'existe pas.")
        return
    
    # Options valides pour les champs CHECK
    types_ressources = {"Tutoriel", "Cours", "Livre", "TD"}
    domaines_valides = {"Informatique", "Mathématiques", "Physique", "Chimie", "Langues"}
    langues_valides = {"Français", "Anglais", "Arabe"}
    niveaux_valides = {"Débutant", "Intermédiaire", "Avancé"}
    objectifs_valides = ["Révision", "Préparation examen", "Apprentissage", "Approfondissement"]

    # Parcourir tous les fichiers dans static/cours/
    for root, dirs, files in os.walk(dossier_cours):
        for file in files:
            chemin_rel = os.path.relpath(os.path.join(root, file), app.root_path)  # Chemin relatif pour Flask
            nom_cours = os.path.splitext(file)[0]  # Récupère le nom du fichier sans l'extension

            # Déterminer domaine, langue et niveau à partir du dossier
            sous_dossiers = os.path.relpath(root, dossier_cours).split(os.sep)

            domaine = sous_dossiers[0] if sous_dossiers and sous_dossiers[0] in domaines_valides else "Général"
            langue = sous_dossiers[1] if len(sous_dossiers) > 1 and sous_dossiers[1] in langues_valides else "Français"
            niveau = sous_dossiers[2] if len(sous_dossiers) > 2 and sous_dossiers[2] in niveaux_valides else "Tous niveaux"

            # Type de ressource basé sur le sous-dossier spécifique
            type_ressource = None
            if len(sous_dossiers) > 3 and sous_dossiers[3] in types_ressources:
                type_ressource = sous_dossiers[3]

            if type_ressource is None:
                print(f"⚠️ Type de ressource inconnu pour {file}, ignoré.")
                continue  # Ignore ce fichier s'il ne correspond pas à un type connu

            # Sélection aléatoire de l'objectif
            objectif = random.choice(objectifs_valides)

            # Vérifier si le fichier est déjà dans la base
            if not Cours.query.filter_by(chemin_source=chemin_rel).first():
                nouveau_cours = Cours(
                    nom=nom_cours,
                    type_ressource=type_ressource,
                    domaine=domaine,
                    langue=langue,
                    niveau=niveau,
                    objectifs=objectif,
                    durée=None,  # Pas d'info sur la durée
                    chemin_source=chemin_rel,
                    nombre_vues=0
                )
                db.session.add(nouveau_cours)
                print(f"✅ Cours ajouté : {file} ({domaine} - {langue} - {niveau} - {type_ressource})")

    # Enregistrer dans la base
    db.session.commit()
    print("📌 Importation terminée !")

if __name__ == "__main__":
    with app.app_context():
        importer_cours()'''


import os
import random
from auth import app, db
from courses import Cours

def importer_cours():
    dossier_cours = os.path.join(app.root_path, "static", "cours")  # Chemin absolu vers /static/cours

    if not os.path.exists(dossier_cours):
        print("⚠️ Le dossier des cours n'existe pas.")
        return

    # Valeurs autorisées
    types_ressources = {"Tutoriel", "Cours", "Livre", "TD"}
    domaines_valides = {"Informatique", "Mathématiques", "Physique", "Chimie", "Langues"}
    langues_valides = {"Français", "Anglais", "Arabe"}
    niveaux_valides = {"Débutant", "Intermédiaire", "Avancé"}
    objectifs_valides = ["Révision", "Préparation examen", "Apprentissage", "Approfondissement"]

    for root, dirs, files in os.walk(dossier_cours):
        for file in files:
            chemin_absolu = os.path.join(root, file)

            # ⬇️ Chemin relatif depuis static/ (donc on garde "cours/...")
            chemin_relatif_static = os.path.relpath(chemin_absolu, os.path.join(app.root_path, "static")).replace(os.sep, "/")

            nom_cours = os.path.splitext(file)[0]

            # Extraction des infos à partir du chemin
            sous_dossiers = os.path.relpath(root, dossier_cours).split(os.sep)
            domaine = sous_dossiers[0] if sous_dossiers and sous_dossiers[0] in domaines_valides else "Général"
            langue = sous_dossiers[1] if len(sous_dossiers) > 1 and sous_dossiers[1] in langues_valides else "Français"
            niveau = sous_dossiers[2] if len(sous_dossiers) > 2 and sous_dossiers[2] in niveaux_valides else "Tous niveaux"
            type_ressource = sous_dossiers[3] if len(sous_dossiers) > 3 and sous_dossiers[3] in types_ressources else None

            if type_ressource is None:
                print(f"⚠️ Type de ressource inconnu pour {file}, ignoré.")
                continue

            objectif = random.choice(objectifs_valides)

            # Vérifie s’il est déjà dans la base
            cours_existant = Cours.query.filter_by(chemin_source=chemin_relatif_static).first()

            if cours_existant:
                cours_existant.nom = nom_cours
                cours_existant.domaine = domaine
                cours_existant.langue = langue
                cours_existant.niveau = niveau
                cours_existant.type_ressource = type_ressource
                cours_existant.objectifs = objectif
                print(f"🔄 Mis à jour : {chemin_relatif_static}")
            else:
                nouveau_cours = Cours(
                    nom=nom_cours,
                    type_ressource=type_ressource,
                    domaine=domaine,
                    langue=langue,
                    niveau=niveau,
                    objectifs=objectif,
                    durée=None,
                    chemin_source=chemin_relatif_static,  # ← ex: cours/Langues/Français/Avancé/Livre/fichier.pdf
                    nombre_vues=0
                )
                db.session.add(nouveau_cours)
                print(f"✅ Cours ajouté : {chemin_relatif_static}")

    db.session.commit()
    print("📌 Importation terminée.")

if __name__ == "__main__":
    with app.app_context():
        importer_cours()
