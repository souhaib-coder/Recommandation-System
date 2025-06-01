import sqlite3

conn = sqlite3.connect('recommandation.db')
c = conn.cursor()

# Activer les clés étrangères
c.execute("PRAGMA foreign_keys = ON")

# Table Utilisateurs
c.execute('''
    CREATE TABLE IF NOT EXISTS Utilisateurs (
        id_user TEXT PRIMARY KEY,
        Nom TEXT NOT NULL,
        Prenom TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mot_de_passe TEXT NOT NULL,
        date_inscription TEXT DEFAULT CURRENT_TIMESTAMP,
        rôle TEXT CHECK (rôle IN ('admin', 'user')) NOT NULL
    )
''')

# Table Cours
c.execute('''
    CREATE TABLE IF NOT EXISTS Cours (
    id_cours INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    type_ressource TEXT NOT NULL CHECK (type_ressource IN ('Tutoriel', 'Cours', 'Livre', 'TD')),
    domaine TEXT NOT NULL CHECK (domaine IN ('Informatique', 'Mathématiques', 'Physique', 'Chimie', 'Langues')),
    langue TEXT NOT NULL CHECK (langue IN ('Français', 'Anglais', 'Arabe')),
    niveau TEXT NOT NULL CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé')),
    objectifs TEXT NOT NULL CHECK (objectifs IN ('Révision', 'Préparation examen', 'Apprentissage','Approfondissement')),
    durée INTEGER,
    chemin_source TEXT NOT NULL,
    nombre_vues INTEGER DEFAULT 0 CHECK (nombre_vues >= 0)
    )
''')

# Table Profils_Utilisateurs
c.execute('''
    CREATE TABLE IF NOT EXISTS Profils_Utilisateurs (
        id_profil INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        domaine_intérêt TEXT NOT NULL CHECK (domaine_intérêt IN ('Informatique', 'Mathématiques', 'Physique', 'Langues')),
        objectifs TEXT CHECK (objectifs IN ('Révision', 'Préparation examen', 'Apprentissage','Approfondissement')),
        date_mise_à_jour TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Utilisateurs(id_user) ON DELETE CASCADE
    )
''')


# Table Avis
c.execute('''
    CREATE TABLE IF NOT EXISTS Avis (
        id_avis INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cours_id INTEGER NOT NULL,
        note INTEGER CHECK (note BETWEEN 1 AND 5),
        commentaire TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Utilisateurs(id_user) ON DELETE CASCADE,
        FOREIGN KEY (cours_id) REFERENCES Cours(id_cours) ON DELETE CASCADE
    )
''')

# Table Favoris
c.execute('''
    CREATE TABLE IF NOT EXISTS Favoris (
        id_favoris INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cours_id INTEGER NOT NULL,
        date_ajout TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Utilisateurs(id_user) ON DELETE CASCADE,
        FOREIGN KEY (cours_id) REFERENCES Cours(id_cours) ON DELETE CASCADE
    )
''')

conn.commit()
conn.close()