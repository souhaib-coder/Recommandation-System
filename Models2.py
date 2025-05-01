from datetime import datetime,timezone
from flask_mail import Mail
from sqlalchemy import Column, Text, DateTime
from flask import Flask, jsonify, redirect, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rec_sys.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuration Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'souhaib.sellab@gmail.com'
app.config['MAIL_PASSWORD'] = 'cchl ztpn umxl rnjb'
app.config['MAIL_DEFAULT_SENDER'] = 'souhaib.sellab@gmail.com'

# URL du frontend React
app.config['FRONTEND_URL'] = 'http://localhost:3000'  # Ajustez selon votre configuration

# Initialisation des extensions
mail = Mail(app)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.unauthorized_handler
def unauthorized():
    # Pour les routes API uniquement
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Authentification requise'}), 401
    return redirect('/auth')

login_manager.login_view = 'auth.login'


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Utilisateurs, user_id)


class Utilisateurs(db.Model, UserMixin):
    __tablename__ = "Utilisateurs"
    
    id_user = db.Column(db.Text, primary_key=True)
    nom = db.Column(db.Text, nullable=False)
    prenom = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    mot_de_passe = db.Column(db.Text, nullable=False)
    date_inscription = db.Column(db.DateTime, nullable=True, default=datetime.now)
    rôle = db.Column(db.Text, nullable=False, default="user")

    favoris = db.relationship("Favoris", back_populates="utilisateur", cascade="all, delete")
    profils = db.relationship("Profils_Utilisateurs", back_populates="utilisateur", cascade="all, delete")
    avis = db.relationship("Avis", back_populates="utilisateur", cascade="all, delete")
    historiques = db.relationship("Historique", back_populates="utilisateur", cascade="all, delete")

    def get_id(self):
        return str(self.id_user)


class Profils_Utilisateurs(db.Model):
    __tablename__ = "Profils_Utilisateurs"

    id_profil = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Text, db.ForeignKey('Utilisateurs.id_user', ondelete="CASCADE"), nullable=False)
    domaine_intérêt = db.Column(db.Text, nullable=False)
    objectifs = db.Column(db.Text)
    date_mise_à_jour = db.Column(db.Text, default=datetime.now)

    __table_args__ = (
        db.CheckConstraint("domaine_intérêt IN ('Informatique', 'Mathématiques', 'Physique', 'Langues')", name="check_domaine"),
        db.CheckConstraint("objectifs IN ('Révision', 'Préparation examen', 'Apprentissage', 'Approfondissement')", name="check_objectifs"),
    )

    utilisateur = db.relationship("Utilisateurs", back_populates="profils", passive_deletes=True)


class Cours(db.Model):
    __tablename__ = "Cours"

    id_cours = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String, nullable=False)
    type_ressource = db.Column(db.String, nullable=False)
    domaine = db.Column(db.String, nullable=False)
    langue = db.Column(db.String, nullable=False)
    niveau = db.Column(db.String, nullable=False)
    objectifs = db.Column(db.String, nullable=False)
    durée = db.Column(db.Integer)
    chemin_source = db.Column(db.String, nullable=False)
    nombre_vues = db.Column(db.Integer, default=0)

    __table_args__ = (
        db.CheckConstraint("type_ressource IN ('Tutoriel', 'Cours', 'Livre', 'TD')", name="check_type_ressource"),
        db.CheckConstraint("domaine IN ('Informatique', 'Mathématiques', 'Physique', 'Chimie', 'Langues')", name="check_domaine"),
        db.CheckConstraint("langue IN ('Français', 'Anglais', 'Arabe')", name="check_langue"),
        db.CheckConstraint("niveau IN ('Débutant', 'Intermédiaire', 'Avancé')", name="check_niveau"),
        db.CheckConstraint("objectifs IN ('Révision', 'Préparation examen', 'Apprentissage', 'Approfondissement')", name="check_objectifs"),
    )

    favoris = db.relationship("Favoris", back_populates="cours", cascade="all, delete")
    avis = db.relationship("Avis", back_populates="cours", cascade="all, delete")
    historiques = db.relationship("Historique", back_populates="cours", cascade="all, delete")

    def __repr__(self):
        return f"<Cours {self.nom}>"


class Favoris(db.Model):
    __tablename__ = "Favoris"

    id_favoris = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Text, db.ForeignKey("Utilisateurs.id_user", ondelete="CASCADE"), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey("Cours.id_cours", ondelete="CASCADE"), nullable=False)
    date_ajout = db.Column(db.Text, default=db.func.current_timestamp())

    utilisateur = db.relationship("Utilisateurs", back_populates="favoris", passive_deletes=True)
    cours = db.relationship("Cours", back_populates="favoris", passive_deletes=True)


class Historique(db.Model):
    __tablename__ = "Historique"

    id_historique = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.String, db.ForeignKey('Utilisateurs.id_user'), nullable=False)
    id_cours = db.Column(db.Integer, db.ForeignKey('Cours.id_cours'), nullable=False)
    date_consultation = db.Column(db.Date, default=datetime.now(timezone.utc).date())  # Utilisation du fuseau horaire UTC
    heure_consultation = db.Column(db.Time, default=datetime.now(timezone.utc).time())  # Heure sans microsecondes

    utilisateur = db.relationship("Utilisateurs", back_populates="historiques", passive_deletes=True)
    cours = db.relationship("Cours", back_populates="historiques", passive_deletes=True)

    def __init__(self, id_user, id_cours, date_consultation=None, heure_consultation=None):
        self.id_user = id_user
        self.id_cours = id_cours
        if date_consultation is None:
            date_consultation = datetime.now(timezone.utc).date()
        self.date_consultation = date_consultation
        if heure_consultation is None:
            heure_consultation = datetime.now(timezone.utc).time()
        self.heure_consultation = heure_consultation


class Avis(db.Model):
    __tablename__ = "Avis"

    id_avis = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Text, db.ForeignKey("Utilisateurs.id_user"), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey("Cours.id_cours"), nullable=False)
    note = db.Column(db.Integer, nullable=False)
    commentaire = db.Column(db.String, nullable=True)

    utilisateur = db.relationship("Utilisateurs", back_populates="avis", passive_deletes=True)
    cours = db.relationship("Cours", back_populates="avis", passive_deletes=True)

    def __repr__(self):
        return f"<Avis {self.id_avis}, Cours {self.cours.nom}, Note {self.note}>"
