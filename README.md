# 📚 DocStorm – Plateforme Web de Recommandation de Ressources E-learning

Bienvenue dans le dépôt GitHub de **DocStorm**, un projet de fin d'année réalisé par des étudiants de la filière 2ITE (1ère année) à l'ENSA d'El Jadida. DocStorm est une application web de e-learning qui centralise et recommande des ressources pédagogiques libres en fonction des préférences de l'utilisateur.

## 🎯 Objectif du projet

DocStorm a pour mission de rendre l'accès aux ressources éducatives plus **équitable**, **personnalisé** et **gratuit**. Grâce à un moteur de recommandation intelligent, l'application guide chaque apprenant vers les contenus les plus adaptés à son profil, son niveau et ses objectifs d’apprentissage.

---

## 🧠 Fonctionnalités principales

### 👨‍🎓 Pour les apprenants
- Inscription, connexion sécurisée, et gestion du profil.
- Filtrage avancé des ressources : domaine, niveau, langue, type, etc.
- Suggestions personnalisées basées sur :
  - Préférences explicites (profil)
  - Historique de navigation
  - Notes attribuées
  - Favoris
- Système d’avis et commentaires.
- Suivi des cours consultés (historique).

### 👩‍🏫 Pour les enseignants
- Gestion des cours (ajout, modification, suppression).
- Tableau de bord analytique.
- Attribution de rôles.

---

## 🛠️ Stack technologique

### Backend :
- **Python** + **Flask**
- **SQLAlchemy** (ORM)
- **SQLite** (développement) / PostgreSQL (prévu en production)
- Authentification sécurisée (Flask-Login, Flask-Bcrypt)

### Frontend :
- **React.js** avec **React Router DOM**
- **Bootstrap** pour le style
- **Axios** pour les appels API

---

## 🧩 Architecture

- Modèle **MVC**
- API RESTful pour la communication client-serveur
- Stockage structuré autour de 6 tables : `Utilisateurs`, `Cours`, `Profils_Utilisateurs`, `Avis`, `Favoris`, `Historique_Consultation`

---

## 🤖 Système de recommandation

Le moteur de recommandation repose sur :
- Les préférences déclarées de l’utilisateur.
- L’analyse comportementale (consultations, favoris, avis).
- Un score de pertinence calculé dynamiquement :
- Un filtrage collaboratif de contenu non encore consulté.

---

## 📈 Perspectives d’amélioration

- Génération de parcours de certification.
- Meilleure granularité des ressources (tags, prérequis...).
- Suivi de progression personnalisé avec tableau de bord.
- Intégration à des centres de certification comme celui de l’ENSAJ.

---

## 👥 Équipe projet

- SAOUD Amina  
- REBBAH Zakaria  
- SELLAB Souhaib  
- SAADALI Achraf  

Encadré par : **Prof. Ikhlasse HAMZAOUI**  
Université Chouaib Doukkali – ENSA El Jadida

---

## 📄 Licence

Ce projet est académique. L’usage et la diffusion sont libres à des fins pédagogiques. Pour une utilisation commerciale, merci de contacter les auteurs.

