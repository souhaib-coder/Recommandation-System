import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

const AuthPage = () => {
  // États pour gérer les différentes vues
  const [activeView, setActiveView] = useState("login"); // "login", "register", "forgotPassword", "resetPassword"
  const [token, setToken] = useState(""); // Pour le token de réinitialisation de mot de passe
  const navigate = useNavigate();

  // Données des formulaires
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmation_password: "",
    domaine_intérêt: "",
    objectifs: "",
  });
  
  const [loginData, setLoginData] = useState({ 
    email: "", 
    password: "" 
  });
  
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ""
  });
  
  const [resetPasswordData, setResetPasswordData] = useState({
    new_password: "",
    confirm_password: ""
  });

  // États pour les messages, erreurs et chargement
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // État pour la force du mot de passe à l'inscription
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    isValid: false
  });

  // État pour la force du mot de passe pour la réinitialisation
  const [resetPasswordStrength, setResetPasswordStrength] = useState({
    score: 0,
    feedback: '',
    isValid: false
  });

  // Configurer le token CSRF pour les requêtes axios
  useEffect(() => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
    }
    
    // Vérifier s'il y a un token dans l'URL pour la réinitialisation du mot de passe
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      setActiveView("resetPassword");
    }
  }, []);

  // Fonction de vérification de la force du mot de passe
  const checkPasswordStrength = (password, isReset = false) => {
    if (!password) {
      const emptyState = {
        score: 0,
        feedback: '',
        isValid: false
      };
      
      if (isReset) {
        setResetPasswordStrength(emptyState);
      } else {
        setPasswordStrength(emptyState);
      }
      return;
    }

    // Calculer le score de sécurité
    let score = 0;
    let feedback = [];

    // Longueur minimale
    if (password.length >= 8) {
      score++;
    } else {
      feedback.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    // Présence de lettres majuscules
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins une lettre majuscule");
    }

    // Présence de lettres minuscules
    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins une lettre minuscule");
    }

    // Présence de chiffres
    if (/\d/.test(password)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins un chiffre");
    }

    // Présence de caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins un caractère spécial (!@#$%^&*(),.?\":{}|<>)");
    }

    // Détecter si le mot de passe contient des séquences simples
    if (/123|abc|qwerty|azerty|password|motdepasse/i.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push("Évitez les séquences courantes (123, abc, etc.)");
    }

    const isValid = score >= 3;
    const strengthData = {
      score,
      feedback: feedback.join('. '),
      isValid
    };

    if (isReset) {
      setResetPasswordStrength(strengthData);
    } else {
      setPasswordStrength(strengthData);
    }
  };

  // Mettre à jour la force du mot de passe quand il change
  useEffect(() => {
    checkPasswordStrength(formData.password);
  }, [formData.password]);

  useEffect(() => {
    checkPasswordStrength(resetPasswordData.new_password, true);
  }, [resetPasswordData.new_password]);

  // Fonction pour obtenir la couleur de la barre de force du mot de passe
  const getPasswordStrengthColor = (strength) => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'red';
      case 2:
        return 'orange';
      case 3:
        return 'yellow';
      case 4:
        return 'lightgreen';
      case 5:
        return 'green';
      default:
        return 'transparent';
    }
  };

  // Fonction pour obtenir le texte de force du mot de passe
  const getPasswordStrengthText = (strength) => {
    switch (strength.score) {
      case 0:
      case 1:
        return 'Très faible';
      case 2:
        return 'Faible';
      case 3:
        return 'Moyen';
      case 4:
        return 'Fort';
      case 5:
        return 'Très fort';
      default:
        return '';
    }
  };

  // Gestionnaires d'événements pour les formulaires
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
  
  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ email: e.target.value });
  };
  
  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Validation de formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Validation du mot de passe
    if (formData.password !== formData.confirmation_password) {
      newErrors.confirmation_password = "Les mots de passe ne correspondent pas";
    }
    
    if (!passwordStrength.isValid) {
      newErrors.password = "Veuillez choisir un mot de passe plus sécurisé";
    }
    
    // Validation de l'email avec regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateResetPasswordForm = () => {
    const newErrors = {};
    
    if (resetPasswordData.new_password !== resetPasswordData.confirm_password) {
      newErrors.confirm_password = "Les mots de passe ne correspondent pas";
    }
    
    if (!resetPasswordStrength.isValid) {
      newErrors.new_password = "Veuillez choisir un mot de passe plus sécurisé";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission des formulaires
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/inscription", formData);
      setMessage(res.data.message || "Inscription réussie !");
      
      // Réinitialiser le formulaire
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
        setActiveView("login");
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
      const res = await axios.post("http://localhost:5000/api/connexion", loginData, {
        withCredentials: true
      });
      setMessage(res.data.message || "Connexion réussie !");
      
      // Rediriger vers la page d'accueil après connexion réussie
      setTimeout(() => {
          if (res.data.admin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      // Fix: Update the endpoint URL to match your Flask blueprint route
      const res = await axios.post("http://localhost:5000/api/forgot-password", forgotPasswordData);
      setMessage(res.data.message || "Email de réinitialisation envoyé !");
      setForgotPasswordData({ email: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!validateResetPasswordForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Fix: Update the endpoint URL to match your Flask blueprint route
      const res = await axios.post("http://localhost:5000/api/reset-password", {
        token: token,
        new_password: resetPasswordData.new_password
      });
      
      setMessage(res.data.message || "Mot de passe réinitialisé avec succès !");
      
      // Rediriger vers la page de connexion après réinitialisation réussie
      setTimeout(() => {
        setActiveView("login");
        setMessage("Votre mot de passe a été réinitialisé ! Vous pouvez maintenant vous connecter.");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de la réinitialisation du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  // Effacer les messages après un certain temps
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Déterminer si le formulaire est à droite ou à gauche
  const isFormOnRight = activeView === "register" || activeView === "forgotPassword" || activeView === "resetPassword";

  return (
    <div className="auth-page">
      <div className={`auth-container ${isFormOnRight ? "active" : ""}`} id="container">
        {/* FORMULAIRE DE CONNEXION (à gauche par défaut) */}
        <div className="auth-form-container auth-sign-in">
          {activeView === "login" && (
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

              <center><Link 
                className="forgot-password-link"
                onClick={() => setActiveView("forgotPassword")}
              >
                Mot de passe oublié ?
              </Link></center>
              <button type="submit" disabled={loading}>
                {loading ? "Chargement..." : "Connexion"}
              </button>
            </form>
          )}
        </div>

        {/* FORMULAIRE D'INSCRIPTION (à droite quand actif) */}
        <div className="auth-form-container auth-sign-up">
          {activeView === "register" && (
            <form onSubmit={handleRegister} className="compact-form">
              <h1 className="auth-visible-title">Créer un compte</h1>
              <div className="form-row">
                <div className="form-column">
                  <input
                    type="text"
                    name="nom"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleSignUpChange}
                    required
                  />
                  {errors.nom && <span className="auth-error-message">{errors.nom}</span>}
                </div>
                <div className="form-column">
                  <input
                    type="text"
                    name="prenom"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={handleSignUpChange}
                    required
                  />
                  {errors.prenom && <span className="auth-error-message">{errors.prenom}</span>}
                </div>
              </div>
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleSignUpChange}
                required
              />
              {errors.email && <span className="auth-error-message">{errors.email}</span>}
              
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleSignUpChange}
                  required
                  minLength="8"
                />
                {errors.password && <span className="auth-error-message">{errors.password}</span>}
                
                {formData.password && (
                  <div className="password-strength-wrapper">
                    <div className="password-strength-container">
                      <div 
                        className="password-strength-bar" 
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(passwordStrength)
                        }}
                      ></div>
                    </div>
                    <div className="password-strength-info">
                      <span className="password-strength-text">
                        Force: {getPasswordStrengthText(passwordStrength)}
                      </span>
                      {passwordStrength.feedback && (
                        <span className="password-feedback" title={passwordStrength.feedback}>
                          ℹ️
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
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

              <div className="form-row">
                <div className="form-column">
                  <div className="auth-select-container">
                    <select
                      name="domaine_intérêt"
                      value={formData.domaine_intérêt}
                      onChange={handleSignUpChange}
                      required
                      className="auth-custom-select"
                    >
                      <option value="">Domaine</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="Langues">Langues</option>
                    </select>
                  </div>
                </div>
                <div className="form-column">
                  <div className="auth-select-container">
                    <select
                      name="objectifs"
                      value={formData.objectifs}
                      onChange={handleSignUpChange}
                      required
                      className="auth-custom-select"
                    >
                      <option value="">Objectif</option>
                      <option value="Révision">Révision</option>
                      <option value="Préparation examen">Préparation examen</option>
                      <option value="Apprentissage">Apprentissage</option>
                      <option value="Approfondissement">Approfondissement</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !passwordStrength.isValid || formData.password !== formData.confirmation_password}
                className="auth-submit-button"
              >
                {loading ? "Chargement..." : "S'inscrire"}
              </button>
            </form>
          )}
          
          {/* FORMULAIRE MOT DE PASSE OUBLIÉ */}
          {activeView === "forgotPassword" && (
            <form onSubmit={handleForgotPassword}>
              <h1 className="auth-visible-title">Mot de passe oublié</h1>
              <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={forgotPasswordData.email}
                onChange={handleForgotPasswordChange}
                required
              />
              
              <button type="submit" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
          )}
          
          {/* FORMULAIRE RÉINITIALISATION MOT DE PASSE */}
          {activeView === "resetPassword" && (
            <form onSubmit={handleResetPassword}>
              <h1 className="auth-visible-title">Réinitialiser votre mot de passe</h1>
              
              <div className="form-group">
                <input
                  type="password"
                  name="new_password"
                  placeholder="Nouveau mot de passe"
                  value={resetPasswordData.new_password}
                  onChange={handleResetPasswordChange}
                  required
                  minLength="8"
                />
                {errors.new_password && <span className="auth-error-message">{errors.new_password}</span>}
                
                {resetPasswordData.new_password && (
                  <div className="password-strength-wrapper">
                    <div className="password-strength-container">
                      <div 
                        className="password-strength-bar" 
                        style={{ 
                          width: `${(resetPasswordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(resetPasswordStrength)
                        }}
                      ></div>
                    </div>
                    <div className="password-strength-info">
                      <span className="password-strength-text">
                        Force: {getPasswordStrengthText(resetPasswordStrength)}
                      </span>
                      {resetPasswordStrength.feedback && (
                        <span className="password-feedback" title={resetPasswordStrength.feedback}>
                          ℹ️
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirmer le mot de passe"
                value={resetPasswordData.confirm_password}
                onChange={handleResetPasswordChange}
                required
              />
              {errors.confirm_password && <span className="auth-error-message">{errors.confirm_password}</span>}
              
              <button 
                type="submit" 
                disabled={loading || !token || !resetPasswordStrength.isValid || resetPasswordData.new_password !== resetPasswordData.confirm_password}
              >
                {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
              </button>
              
              <div className="auth-toggle-link">
                <button 
                  type="button" 
                  className="auth-link-button"
                  onClick={() => setActiveView("login")}
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PANNEAUX DE BASCULEMENT */}
        <div className="auth-toggle-container">
          <div className="auth-toggle">
            {/* Panneau gauche (visible quand on est sur l'inscription ou mot de passe oublié) */}
            <div className="auth-toggle-panel auth-toggle-left">
              <h1><b>Bon retour !</b></h1>
              <p>Connectez-vous avec vos informations personnelles pour accéder à votre parcours d'apprentissage</p>
              <button className="auth-hidden" onClick={() => setActiveView("login")}>Se connecter</button>
            </div>

            {/* Panneau droit (visible quand on est sur la connexion) */}
            <div className="auth-toggle-panel auth-toggle-right">
              <h1><b>Salut !</b></h1>
              <p>Inscrivez-vous pour accéder à toutes les fonctionnalités et commencer votre voyage d'apprentissage</p>
              <button className="auth-hidden" onClick={() => setActiveView("register")}>
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <p className={`auth-message ${message.includes("Erreur") ? "error" : ""}`}>
            {message}
          </p>
        )}
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
  background: #f0f2f5;
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
  width: 900px;
  max-width: 100%;
  min-height: 550px;
  max-height: 90vh;
}

.auth-container p {
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0.3px;
  margin: 10px 0;
  color: var(--text-light);
}

.auth-container span {
  font-size: 12px;
}

.auth-container a {
  color: var(--text-dark);
  font-size: 12px;
  text-decoration: none;
  margin: 8px 0;
  transition: color 0.3s ease;
}

.auth-container a:hover {
  color: var(--primary-color);
}

.auth-container button {
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 14px;
  padding: 10px 35px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.auth-container button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.auth-container button.auth-hidden {
  background-color: transparent;
  border: 2px solid var(--white);
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
  transition: all var(--transition-speed) ease-in-out;
}

.auth-form-container {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  transition: all var(--transition-speed) ease-in-out;
}

.auth-toggle-link {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-light);
}

.auth-link-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  margin: 0 0 0 5px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.auth-link-button:hover {
  color: var(--gradient-start);
}

/* INPUTS */
.auth-container input,
.auth-container select {
  background-color: var(--input-bg);
  border: none;
  margin: 6px 0;
  padding: 12px;
  font-size: 13px;
  border-radius: var(--border-radius-sm);
  width: 100%;
  height: 42px;
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
  margin: 6px 0;
}

.auth-custom-select {
  display: block;
  width: 100%;
  height: 42px;
  padding: 12px;
  color: var(--text-dark);
  background-color: var(--input-bg);
  border: none;
  border-radius: var(--border-radius-sm);
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.auth-custom-select:focus {
  outline: none;
  border: 1px solid var(--primary-color);
  background-color: var(--white);
}

.auth-select-container::after {
  content: '';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--text-dark);
  pointer-events: none;
}

/* POSITIONNEMENT DES FORMULAIRES */
.auth-sign-in {
  left: 0;
  z-index: 2;
}

.auth-sign-up {
  left: 0;
  z-index: 1;
  opacity: 0;
  visibility: hidden;
}

.auth-container.active .auth-sign-in {
  transform: translateX(100%);
  opacity: 0;
  visibility: hidden;
}

.auth-container.active .auth-sign-up {
  transform: translateX(100%);
  opacity: 1;
  visibility: visible;
  z-index: 5;
}

/* TOGGLE CONTAINER STYLING */
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

.auth-toggle-panel h1 {
  color: var(--white);
  font-size: 26px;
  margin-bottom: 10px;
}

.auth-toggle-panel p {
  color: var(--white);
  opacity: 0.9;
  margin-bottom: 20px;
  font-size: 14px;
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

/* AFFICHAGE DES TITRES */
.auth-visible-title {
  margin-bottom: 10px;
  font-size: 26px;
  font-weight: 700;
  color: var(--text-dark);
}

/* MESSAGES - Repositionnés dans la zone blanche pour une meilleure lisibilité */
.auth-message {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(45, 160, 168, 0.1);
  color: var(--primary-color);
  padding: 8px 15px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  text-align: center;
  max-width: 80%;
  z-index: 2000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 3px solid var(--primary-color);
}

.auth-message.error {
  background-color: rgba(255, 0, 0, 0.1);
  color: #cc0000;
  border-left: 3px solid #cc0000;
}

/* STYLE POUR LES ERREURS */
.auth-error-message {
  color: #cc0000;
  font-size: 11px;
  margin-top: -4px;
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
}

/* STYLE POUR LES FORMULAIRES COMPACTS */
.compact-form {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 15px 40px;
}

.form-row {
  display: flex;
  width: 100%;
  gap: 8px;
}

.form-column {
  flex: 1;
  min-width: 0;
}

.form-group {
  width: 100%;
  margin-bottom: 3px;
}

/* STYLE POUR L'INDICATEUR DE FORCE DU MOT DE PASSE */
.password-strength-wrapper {
  width: 100%;
  margin-top: 0;
  margin-bottom: 6px;
}

.password-strength-container {
  width: 100%;
  height: 4px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.password-strength-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.password-strength-info {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  margin-top: 3px;
  color: var(--text-light);
}

.password-feedback {
  cursor: help;
}

/* MOT DE PASSE OUBLIÉ */
.forgot-password-link {
  display: block;
  margin: 8px 0;
  color: var(--text-light);
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
  align-self: flex-start;
}

.forgot-password-link:hover {
  color: var(--primary-color);
}

/* BOUTONS PRINCIPAUX */
.auth-container button.auth-submit-button {
  background-color: var(--primary-color);
  width: 100%;
  padding: 12px;
  font-size: 14px;
  margin-top: 15px;
  border-radius: var(--border-radius-sm);
}

/* Bouton S'INSCRIRE pour le panneau bleu */
.auth-toggle-panel button {
  background-color: transparent;
  border: 2px solid white;
  padding: 10px 30px;
  font-size: 14px;
  border-radius: var(--border-radius-sm);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.auth-toggle-panel button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .auth-container {
    min-height: 480px;
    width: 90%;
  }
  
  .auth-form-container {
    width: 100%;
  }
  
  .auth-toggle-container {
    display: none;
  }
  
  .auth-container.active .auth-sign-in {
    transform: translateX(0);
    opacity: 0;
    visibility: hidden;
    z-index: 1;
  }
  
  .auth-container.active .auth-sign-up {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
    z-index: 5;
  }
  
  .auth-sign-up {
    left: 0;
    width: 100%;
  }
  
  .auth-sign-in {
    width: 100%;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .auth-container form {
    padding: 0 20px;
  }

  .auth-message {
    max-width: 90%;
    top: 10px;
  }
  
  .auth-visible-title {
    font-size: 22px;
  }
}

/* STYLES POUR LES BOUTONS DÉSACTIVÉS */
.auth-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Styles pour les boutons de connexion et inscription */
.auth-container button[type="submit"] {
  margin-top: 15px;
  width: 100%;
  font-size: 14px;
  padding: 12px;
  border-radius: var(--border-radius-sm);
}`}</style>
    </div>

  );
};

export default AuthPage;