import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import "../css/AuthStyle.css";
import { login, register,resetPassword,forgotPassword } from '../api/api'; // Importez les fonctions d'API

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

  // Configurer le token CSRF pour les requêtes
  useEffect(() => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      // Vous pouvez configurer le token CSRF dans vos fonctions d'API au lieu d'ici
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
      // Utiliser la fonction d'API au lieu d'axios
      const data = await register(formData);
      setMessage(data.message || "Inscription réussie !");
      
      // Stocker l'email avant de réinitialiser le formulaire
      const userEmail = formData.email;
      
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
      // et pré-remplir l'email de connexion
      setTimeout(() => {
        setActiveView("login");
        setMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        // Pré-remplir l'email dans le formulaire de connexion
        setLoginData(prev => ({ ...prev, email: userEmail }));
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
      // Utiliser la fonction d'API au lieu d'axios
      const data = await login(loginData);
      setMessage(data.message || "Connexion réussie !");
      
      // Rediriger vers la page d'accueil après connexion réussie
      setTimeout(() => {
        if (data.admin) {
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
  
  // Ces fonctions nécessitent de nouvelles fonctions d'API à ajouter dans le fichier api.jsx
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      // Cette fonction doit être créée dans api.jsx
      const response = await forgotPassword(forgotPasswordData);
      setMessage(response.message || "Email de réinitialisation envoyé !");
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
      // Cette fonction doit être créée dans api.jsx
      const response = await resetPassword(token, resetPasswordData.new_password);
      
      setMessage(response.message || "Mot de passe réinitialisé avec succès !");
      
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
    </div>
  );
};

export default AuthPage;