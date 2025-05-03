from datetime import datetime,timezone
from flask_login import UserMixin
from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
##########



app= Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recommandation.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'souhaib.sellab@gmail.com'
app.config['MAIL_PASSWORD'] = 'cchl ztpn umxl rnjb'
app.config['MAIL_DEFAULT_SENDER'] = 'souhaib.sellab@gmail.com'

# URL du frontend React
app.config['FRONTEND_URL'] = 'http://localhost:3000'  # Ajustez selon votre configuration

app.config['SECRET_KEY'] = 'une_clé_secrète_à_remplacer'

# Initialisation des extensions
mail = Mail(app)

db = SQLAlchemy()
bcrypt = Bcrypt()


db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return Utilisateurs.query.get(str(user_id))


#########
class Utilisateurs(db.Model, UserMixin):
    __tablename__ = "Utilisateurs"  # Assure-toi que le nom correspond exactement à la table SQLite
    
    id_user = db.Column(db.Text, primary_key=True)
    nom = db.Column(db.Text, nullable=False)
    prenom = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    mot_de_passe = db.Column(db.Text, nullable=False)  # Hash du mot de passe
    date_inscription = db.Column(db.DateTime, nullable=True, default=datetime.now)  # SQLite ne gère pas bien les timestamps
    rôle = db.Column(db.Text, nullable=False, default="user")


    profils = db.relationship("Profils_Utilisateurs", back_populates="utilisateur", cascade="all, delete")
    favoris = db.relationship("Favoris", back_populates="utilisateur", cascade="all, delete")
    avis = db.relationship("Avis", back_populates="utilisateur", cascade="all, delete")
    historique = db.relationship('Historique_Consultation', back_populates="utilisateur", cascade="all, delete")

    def get_id(self):
        return str(self.id_user)
    
    @property
    def id(self):
        return self.id_user


###############

class Profils_Utilisateurs(db.Model):
    __tablename__ = "Profils_Utilisateurs"  # Assure-toi que le nom correspond exactement à la table SQLite
    id_profil = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id  = db.Column(db.Text,db.ForeignKey('Utilisateurs.id_user', ondelete="CASCADE"), primary_key=True)
    domaine_intérêt = db.Column(db.Text, nullable=False)
    objectifs = db.Column(db.Text)
    date_mise_à_jour = db.Column(db.Text, default=datetime.now)

    # Ajout des contraintes de vérification (CHECK)
    __table_args__ = (
        db.CheckConstraint("domaine_intérêt IN ('Informatique', 'Mathématiques', 'Physique', 'Langues')", name="check_domaine"),
        db.CheckConstraint("objectifs IN ('Révision', 'Préparation examen', 'Apprentissage', 'Approfondissement')", name="check_objectifs"),
    )

    # Relation avec la table Utilisateurs
    utilisateur = db.relationship("Utilisateurs", back_populates="profils", passive_deletes=True)


##################

class Cours(db.Model):
    __tablename__ = 'Cours'
    
    id_cours = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nom = db.Column(db.Text, nullable=False)
    type_ressource = db.Column(db.Text, nullable=False)
    domaine = db.Column(db.Text, nullable=False)
    langue = db.Column(db.Text, nullable=False)
    niveau = db.Column(db.Text, nullable=False)
    objectifs = db.Column(db.Text, nullable=False)
    durée = db.Column(db.Integer)
    chemin_source = db.Column(db.Text, nullable=False)
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
    historique = db.relationship("Historique_Consultation", back_populates="cours", cascade="all, delete")

    def __repr__(self):
        return f"<Cours {self.domaine} - {self.niveau} ({self.chemin_source})>"


##################

class Favoris(db.Model):
    __tablename__ = "Favoris"

    id_favoris = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Text, db.ForeignKey("Utilisateurs.id_user", ondelete="CASCADE"), primary_key=True)
    cours_id = db.Column(db.Integer, db.ForeignKey("Cours.id_cours", ondelete="CASCADE"), primary_key=True)
    date_ajout = db.Column(db.Text, default=db.func.current_timestamp())

    
    utilisateur = db.relationship("Utilisateurs", back_populates="favoris", passive_deletes=True)
    cours = db.relationship("Cours", back_populates="favoris", passive_deletes=True)

##################
class Historique_Consultation(db.Model):
    __tablename__ = "Historique_Consultation"

    id_historique = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('Utilisateurs.id_user'), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey('Cours.id_cours'), nullable=False)
    date_consultation = db.Column(db.Date, default=datetime.now(timezone.utc).date())  # Utilisation du fuseau horaire UTC
    heure_consultation = db.Column(db.Time, default=datetime.now(timezone.utc).time())  # Heure sans microsecondes

    utilisateur = db.relationship("Utilisateurs", back_populates="historique", passive_deletes=True)
    cours = db.relationship("Cours", back_populates="historique", passive_deletes=True)

    def __init__(self, user_id, cours_id, date_consultation=None, heure_consultation=None):
        self.user_id = user_id
        self.cours_id = cours_id
        if date_consultation is None:
            date_consultation = datetime.now(timezone.utc).date()  # Date d'aujourd'hui en UTC si non spécifiée
        self.date_consultation = date_consultation
        if heure_consultation is None:
            heure_consultation = datetime.now(timezone.utc).time()  # Crée un objet time sans microsecondes
        self.heure_consultation = heure_consultation
#############

##################

class Avis(db.Model):
    __tablename__ = "Avis"

    id_avis = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Text, db.ForeignKey("Utilisateurs.id_user", ondelete="CASCADE"), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey("Cours.id_cours", ondelete="CASCADE"), nullable=False)
    note = db.Column(db.Integer, db.CheckConstraint("note BETWEEN 1 AND 5"), nullable=False)
    commentaire = db.Column(db.Text)
    date = db.Column(db.Text, default=db.func.current_timestamp())

    # Relations avec les autres tables
    utilisateur = db.relationship("Utilisateurs", back_populates="avis", passive_deletes=True)
    cours = db.relationship("Cours", back_populates="avis", passive_deletes=True)

##################
