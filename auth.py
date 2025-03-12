from flask import Flask, render_template, url_for, redirect, session, request
from flask_sqlalchemy import SQLAlchemy 
from flask_login import UserMixin, LoginManager, login_required, logout_user, current_user, login_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError, Email
from flask_bcrypt import Bcrypt
from datetime import datetime


app= Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recommandation.db'
app.config['SECRET_KEY'] = 'thisisasecretkey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db= SQLAlchemy(app)
bcrypt = Bcrypt(app)


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    return Utilisateurs.query.get(int(user_id))


class Utilisateurs(db.Model, UserMixin):
    __tablename__ = "Utilisateurs"  # Assure-toi que le nom correspond exactement à la table SQLite
    
    id_user = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nom = db.Column(db.Text, nullable=False)
    prenom = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    mot_de_passe = db.Column(db.Text, nullable=False)  # Hash du mot de passe
    date_inscription = db.Column(db.Text, nullable=True, default=datetime.now)  # SQLite ne gère pas bien les timestamps
    rôle = db.Column(db.Text, nullable=False, default="user")
    
    def get_id(self):
        return str(self.id_user)
    
    @property
    def id(self):
        return self.id_user


class RegisterForm(FlaskForm):
    nom = StringField(validators=[
                         InputRequired(), Length(min=2, max=50)], render_kw={"placeholder": "Nom"})
    prenom = StringField(validators=[
                         InputRequired(), Length(min=2, max=50)], render_kw={"placeholder": "Prénom"})
    email = StringField(validators=[
                         InputRequired(), Email(), Length(min=5, max=50)], render_kw={"placeholder": "Email"})
    password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Mot de passe"})
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


@app.route('/')
def home():
    return render_template('home.html')

@app.route('/connexion', methods=['GET', 'POST'])
def login():
    form = loginForm()
    if form.validate_on_submit():
        user= Utilisateurs.query.filter_by(email=form.email.data).first()
        if user:
            if bcrypt.check_password_hash(user.mot_de_passe, form.password.data):
                login_user(user)
                return redirect(url_for('dashboard'))
    return render_template('connexion.html', form=form)


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    return render_template('dashboard.html')


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/inscription', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = Utilisateurs(nom=form.nom.data, prenom=form.prenom.data, mot_de_passe=hashed_password, email=form.email.data, date_inscription=datetime.now(), rôle="user")
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('inscription.html', form=form)


@app.route('/profil')
@login_required
def profil():
    return render_template('profil.html', user=current_user)

@app.route('/profil/modifier', methods=['GET', 'POST'])
@login_required
def modifier_profil():
    if request.method == 'POST':
        nom = request.form.get('nom')
        prenom = request.form.get('prenom')
        email = request.form.get('email')
        if not nom or not prenom or not email:
            return "Tous les champs sont obligatoires", 400
        current_user.nom = nom
        current_user.prenom = prenom
        current_user.email = email
        db.session.commit()
        return redirect(url_for('profil'))
    return render_template('modifier_profil.html', user=current_user)

@app.route('/profil/status')
@login_required
def profil_status():
    return jsonify({
        'nom': current_user.nom,
        'prenom': current_user.prenom,
        'email': current_user.email,
        'date_inscription': current_user.date_inscription,
        'rôle': current_user.rôle
    })

if __name__=='__main__':
    app.run(debug=True)
