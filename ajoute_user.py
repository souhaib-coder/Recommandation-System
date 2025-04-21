from faker import Faker
from werkzeug.security import generate_password_hash
from Models import Utilisateurs, db, app,bcrypt,datetime
import uuid
import random

fake = Faker('fr_FR')

def ajouter_utilisateurs_test(n=1):
    with app.app_context():
        for i in range(n):
            while True:
                new_id = "R" + str(random.randint(100000000, 999999999))
                if not Utilisateurs.query.filter_by(id_user=new_id).first():
                    break
            hashed_password = bcrypt.generate_password_hash('testtest')
            email = f'user{i}@test.com'
            if Utilisateurs.query.filter_by(email=email).first():
                continue  # skip si email déjà pris, ou génère-en un autre

            new_user = Utilisateurs(
                id_user=new_id,
                nom='user',
                prenom=str(i),
                mot_de_passe=hashed_password,
                email=email,
                date_inscription=datetime.now(),
                rôle="user"
            )
            db.session.add(new_user)
        
        db.session.commit()
        print(f"{n} utilisateurs ajoutés avec succès !")


# Appel de la fonction
ajouter_utilisateurs_test(30)


