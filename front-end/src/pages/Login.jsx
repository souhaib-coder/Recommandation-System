// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { login, register } from "../api/api"; // Importation des fonctions API au lieu d'axios
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Modifier à false pour afficher la connexion par défaut
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmation_password: "",
    domaine_intérêt: "",
    objectifs: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur spécifique quand l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation du mot de passe
    if (formData.password !== formData.confirmation_password) {
      newErrors.confirmation_password = "Les mots de passe ne correspondent pas";
    }
    
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    // Validation de l'email avec regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Utilisation de la fonction register de l'API au lieu d'axios directement
      const res = await register(formData);
      setMessage(res.message || "Inscription réussie !");
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        confirmation_password: "",
        domaine_intérêt: "",
        objectifs: "",
      });
      
      // Rediriger vers la page de connexion après une inscription réussie
      setTimeout(() => {
        setIsSignUp(false); // Basculer vers le formulaire de connexion
        setMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setMessage(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      // Utilisation de la fonction login de l'API au lieu d'axios directement
      const data = await login(loginData);
      if (data.success) {
        if (data.admin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    if (message) {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Effacer les messages après un certain temps
  useEffect(() => {
    clearMessage();
  }, [message]);

  return (
    <div className="auth-page">
      <div className={`auth-container ${isSignUp ? "active" : ""}`} id="container">
        {/* SIGN UP SIDE */}
        <div className="auth-form-container auth-sign-up">
          <form onSubmit={handleRegister}>
            <h1 className="auth-visible-title">Créer un compte</h1>
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleSignUpChange}
              required
            />
            {errors.nom && <span className="auth-error-message">{errors.nom}</span>}
            
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={formData.prenom}
              onChange={handleSignUpChange}
              required
            />
            {errors.prenom && <span className="auth-error-message">{errors.prenom}</span>}
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleSignUpChange}
              required
            />
            {errors.email && <span className="auth-error-message">{errors.email}</span>}
            
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleSignUpChange}
              required
            />
            {errors.password && <span className="auth-error-message">{errors.password}</span>}
            
            <input
              type="password"
              name="confirmation_password"
              placeholder="Confirmer mot de passe"
              value={formData.confirmation_password}
              onChange={handleSignUpChange}
              required
            />
            {errors.confirmation_password && (
              <span className="auth-error-message">{errors.confirmation_password}</span>
            )}

            {/* CHAMPS SELECT avec style amélioré */}
            <div className="auth-select-container">
              <select
                name="domaine_intérêt"
                value={formData.domaine_intérêt}
                onChange={handleSignUpChange}
                required
                className="auth-custom-select"
              >
                <option value="">Choisissez un domaine</option>
                <option value="Informatique">Informatique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physique">Physique</option>
                <option value="Langues">Langues</option>
              </select>
            </div>
            {errors.domaine_intérêt && (
              <span className="auth-error-message">{errors.domaine_intérêt}</span>
            )}

            <div className="auth-select-container">
              <select
                name="objectifs"
                value={formData.objectifs}
                onChange={handleSignUpChange}
                required
                className="auth-custom-select"
              >
                <option value="">Choisissez un objectif</option>
                <option value="Révision">Révision</option>
                <option value="Préparation examen">Préparation examen</option>
                <option value="Apprentissage">Apprentissage</option>
                <option value="Approfondissement">Approfondissement</option>
              </select>
            </div>
            {errors.objectifs && <span className="auth-error-message">{errors.objectifs}</span>}

            <button type="submit" disabled={loading}>
              {loading ? "Chargement..." : "S'inscrire"}
            </button>
          </form>
        </div>

        {/* SIGN IN SIDE */}
        <div className="auth-form-container auth-sign-in">
          <form onSubmit={handleLogin}>
            <h1 className="auth-visible-title">Se connecter</h1>
            <p>Que l'apprentissage commence</p>          
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <a href="/forgot-password">Mot de passe oublié ?</a>
            <button type="submit" disabled={loading}>
              {loading ? "Chargement..." : "Connexion"}
            </button>
          </form>
        </div>

        {/* TOGGLE PANELS */}
        <div className="auth-toggle-container">
          <div className="auth-toggle">
            {/* Panel gauche (visible quand on est sur l'inscription) */}
            <div className="auth-toggle-panel auth-toggle-left">
              <h1><b>Bon retour !</b></h1>
              <p>Connectez‑vous avec vos informations personnelles pour accéder à votre parcours d'apprentissage</p>
              <button className="auth-hidden" onClick={() => setIsSignUp(false)}>Se connecter</button>
            </div>

            {/* Panel droit (visible quand on est sur la connexion) */}
            <div className="auth-toggle-panel auth-toggle-right">
              <h1><b>Salut !</b></h1>
              <p>Inscrivez‑vous pour accéder à toutes les fonctionnalités et commencer votre voyage d'apprentissage</p>
              <button className="auth-hidden" onClick={() => setIsSignUp(true)}>
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {message && <p className="auth-message">{message}</p>}
      </div>
      <style jsx>{`

        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');



* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
}

.auth-page {
  background: linear-gradient(to right, var(--light-bg), var(--accent-bg));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
}

.auth-container {
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 580px; /* Augmenté pour accommoder les éléments supplémentaires */
}

.auth-container p {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.3px;
  margin: 20px 0;
}

.auth-container span {
  font-size: 12px;
}

.auth-container a {
  color: var(--text-dark);
  font-size: 13px;
  text-decoration: none;
  margin: 15px 0 10px;
  transition: color 0.3s ease;
}

.auth-container a:hover {
  color: var(--primary-color);
}

.auth-container button {
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 12px;
  padding: 10px 45px;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.auth-container button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.auth-container button.auth-hidden {
  background-color: transparent;
  border-color: var(--white);
}

.auth-container button.auth-hidden:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.auth-container form {
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  height: 100%;
  overflow-y: auto; /* Permet de scroller si le formulaire est trop long */
  transition: all var(--transition-speed) ease-in-out;
}

/* Lien pour changer de formulaire dans le même formulaire */
.auth-toggle-link {
  margin-top: 15px;
  font-size: 13px;
  color: var(--text-light);
}

.auth-toggle-link a {
  color: var(--primary-color);
  font-weight: 600;
  margin: 0 0 0 5px;
  text-decoration: underline;
}

.auth-toggle-link a:hover {
  color: var(--gradient-start);
}

/* INPUTS */
.auth-container input,
.auth-container select {
  background-color: var(--input-bg);
  border: none;
  margin: 8px 0;
  padding: 10px 15px;
  font-size: 13px;
  border-radius: var(--border-radius-sm);
  width: 100%;
  outline: none;
  transition: border 0.3s ease, background-color 0.3s ease;
}

.auth-container input:focus,
.auth-container select:focus {
  background-color: var(--white);
  border: 1px solid var(--primary-color);
}

/* SELECTS STYLING */
.auth-select-container {
  position: relative;
  width: 100%;
  margin: 8px 0;
}

.auth-custom-select {
  display: block;
  width: 100%;
  height: 38px;
  padding: 10px 15px;
  color: var(--text-dark);
  background-color: var(--input-bg);
  border: none;
  border-radius: var(--border-radius-sm);
  appearance: none; /* Removes default arrow in some browsers */
  cursor: pointer;
  transition: all 0.3s ease;
}

.auth-custom-select:focus {
  outline: none;
  border: 1px solid var(--primary-color);
  background-color: var(--white);
}

/* Custom arrow for select boxes */
.auth-select-container::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--text-dark);
  pointer-events: none;
}

/* Pour éviter que les options débordent */
.auth-container select option {
  border-radius: var(--border-radius-sm);
  background-color: var(--white);
  color: var(--text-dark);
}

.auth-form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all var(--transition-speed) ease-in-out;
}

.auth-sign-in {
  left: 0;
  width: 50%;
  z-index: 2;
}

.auth-container.active .auth-sign-in {
  transform: translateX(100%);
}

.auth-sign-up {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  overflow-y: auto; /* Pour permettre de défiler si le formulaire est trop long */
  max-height: 100%;
}

.auth-container.active .auth-sign-up {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: auth-move var(--transition-speed);
}

@keyframes auth-move {
  0%, 49.99% {
    opacity: 0;
    z-index: 1;
  }
  50%, 100% {
    opacity: 1;
    z-index: 5;
  }
}

.auth-visible-title {
  display: block !important;
  margin-bottom: 15px;
  font-size: 24px;
  color: var(--text-dark);
  font-weight: 700;
}

.auth-social-icons {
  margin: 20px 0;
}

.auth-social-icons a {
  border: 1px solid #ccc;
  border-radius: 20%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 3px;
  width: 40px;
  height: 40px;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.auth-social-icons a:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
}

.auth-toggle-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: all var(--transition-speed) ease-in-out;
  border-radius: 150px 0 0 100px;
  z-index: 1000;
}

.auth-container.active .auth-toggle-container {
  transform: translateX(-100%);
  border-radius: 0 150px 100px 0;
}

.auth-toggle {
  height: 100%;
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
  color: var(--white);
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: all var(--transition-speed) ease-in-out;
}

.auth-container.active .auth-toggle {
  transform: translateX(50%);
}

.auth-toggle-panel {
  position: absolute;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 30px;
  text-align: center;
  top: 0;
  transform: translateX(0);
  transition: all var(--transition-speed) ease-in-out;
}

.auth-toggle-left {
  transform: translateX(-200%);
}

.auth-container.active .auth-toggle-left {
  transform: translateX(0);
}

.auth-toggle-right {
  right: 0;
  transform: translateX(0);
}

.auth-container.active .auth-toggle-right {
  transform: translateX(200%);
}

.auth-message {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  color: var(--primary-color);
  border-radius: var(--border-radius-sm);
  z-index: 2000;
  transition: opacity 0.5s ease;
}

/* Style pour les messages d'erreur */
.auth-error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: 5px;
  text-align: left;
  width: 100%;
}
.auth-switch-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1500;
  display: flex;
  gap: 10px;
}

.auth-switch-buttons button {
  padding: 8px 15px;
  font-size: 12px;
  background-color: var(--gradient-start);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-weight: 600;
  text-transform: uppercase;
}

.auth-switch-buttons button:hover {
  background-color: var(--primary-color);
  transform: translateY(-2px);
}
/* Styles pour Profile.css */

/* Conteneur principal */
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Messages de succès et d'erreur */
.success-message {
  background-color: #2da0a8;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
  animation: fadeOut 3s forwards;
  animation-delay: 3s;
}

.error-message {
  background-color: #e74c3c;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* En-tête du profil */
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e2e2;
}

.profile-avatar {
  margin-right: 2rem;
  color: #5c6bc0;
}

.profile-title h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
}

.profile-title p {
  margin: 5px 0;
  color: #666;
}

.profile-member-since {
  font-size: 0.85rem;
  color: #999;
}

/* Navigation */
.profile-nav {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e2e2;
}

.profile-nav button {
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.profile-nav button.active {
  color: #2da0a8;
}

.profile-nav button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #2da0a8;
}

.profile-nav button:hover {
  color: #2da0a8;
}

.profile-nav button svg {
  margin-right: 8px;
}

/* Sections de contenu */
.profile-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Cartes d'information */
.profile-info-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.profile-info-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: #333;
  border-bottom: 2px solid #2da0a8;
  padding-bottom: 0.5rem;
}

/* Éléments d'information */
.profile-info-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: baseline;
}

.profile-info-item label {
  font-weight: 600;
  min-width: 150px;
  color: #666;
}

.profile-info-item span {
  flex: 1;
  color: #333;
}

/* Boutons */
.profile-buttons {
  display: flex;
  gap: 10px;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn svg {
  margin-right: 8px;
}

.btn-primary {
  background-color: #2da0a8;
  color: white;
}

.btn-primary:hover {
  background-color: #5c6bc0;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #e2e2e2;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d1d1d1;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.btn-success {
  background-color: #27ae60;
  color: white;
}

.btn-success:hover {
  background-color: #2ecc71;
  transform: translateY(-2px);
}

/* Favoris */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.favorite-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.favorite-card-header {
  padding: 15px;
  background: linear-gradient(to right, #5c6bc0, #2da0a8);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-débutant {
  background-color: #2ecc71;
  color: white;
}

.badge-intermédiaire {
  background-color: #f39c12;
  color: white;
}

.badge-avancé {
  background-color: #e74c3c;
  color: white;
}

.favorite-card-body {
  padding: 15px;
}

.favorite-card-body p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.favorite-card-footer {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
}

.no-content {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

/* Message de chargement */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2rem;
  color: #666;
}

/* Style pour les formulaires d'édition */
.edit-form {
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: #eee;
  color: #333;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #2da0a8;
  box-shadow: 0 0 0 2px rgba(45, 160, 168, 0.2);
  outline: none;
  background-color: #fff;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-start;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-section {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .profile-nav {
    overflow-x: auto;
    padding-bottom: 5px;
  }
  
  .profile-info-item {
    flex-direction: column;
  }
  
  .profile-info-item label {
    margin-bottom: 5px;
  }
  
  .form-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

/* Animations pour les transitions de formulaires */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-form {
  animation: slideIn 0.3s ease-out forwards;
}


      `}</style>
    </div>
  );
};

export default Login;