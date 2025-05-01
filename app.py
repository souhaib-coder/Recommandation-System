from flask import render_template

from auth import auth_bp
from users import users_bp
from courses import courses_bp
from security import security_bp
from flask_cors import CORS
from Models import app


CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})


app.register_blueprint(auth_bp, url_prefix="")
app.register_blueprint(users_bp, url_prefix="")
app.register_blueprint(courses_bp, url_prefix="")
app.register_blueprint(security_bp, url_prefix="")

@app.route('/')
def home():
    return {'message': 'Bienvenue sur l’API de la plateforme'}

if __name__=='__main__':
    app.run(debug=True)    