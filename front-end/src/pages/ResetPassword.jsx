import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    isValid: false
  });

  const token = searchParams.get('token');

  // Vérifier la force du mot de passe
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength({
        score: 0,
        feedback: '',
        isValid: false
      });
      return;
    }

    // Calculer le score de sécurité
    let score = 0;
    let feedback = [];

    // Longueur minimale
    if (newPassword.length >= 8) {
      score++;
    } else {
      feedback.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    // Présence de lettres majuscules
    if (/[A-Z]/.test(newPassword)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins une lettre majuscule");
    }

    // Présence de lettres minuscules
    if (/[a-z]/.test(newPassword)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins une lettre minuscule");
    }

    // Présence de chiffres
    if (/\d/.test(newPassword)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins un chiffre");
    }

    // Présence de caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      score++;
    } else {
      feedback.push("Ajoutez au moins un caractère spécial (!@#$%^&*(),.?\":{}|<>)");
    }

    // Détecter si le mot de passe contient des séquences simples
    if (/123|abc|qwerty|azerty|password|motdepasse/i.test(newPassword)) {
      score = Math.max(0, score - 1);
      feedback.push("Évitez les séquences courantes (123, abc, etc.)");
    }

    const isValid = score >= 3;

    setPasswordStrength({
      score,
      feedback: feedback.join('. '),
      isValid
    });
  }, [newPassword]);

  // Fonction pour obtenir la couleur de la barre de force du mot de passe
  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
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
  const getPasswordStrengthText = () => {
    switch (passwordStrength.score) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Veuillez choisir un mot de passe plus sécurisé');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', {
        token,
        new_password: newPassword
      });
      
      setMessage(response.data.message);
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container auth-sign-in">
          <form onSubmit={handleSubmit}>
            <h1 className="auth-visible-title">Réinitialiser votre mot de passe</h1>
            
            {message && (
              <div className="success-message">
                {message}
              </div>
            )}
            
            {error && (
              <div className="auth-error-message">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
              />
              
              {newPassword && (
                <>
                  <div className="password-strength-container">
                    <div 
                      className="password-strength-bar" 
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <div className="password-strength-text">
                    Force: {getPasswordStrengthText()}
                  </div>
                  {passwordStrength.feedback && (
                    <div className="password-feedback">
                      {passwordStrength.feedback}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !token || !passwordStrength.isValid || newPassword !== confirmPassword}
            >
              {isLoading ? 'En cours...' : 'Réinitialiser le mot de passe'}
            </button>
            
            <div className="auth-toggle-link">
              <a href="/auth">Retour à la connexion</a>
            </div>
          </form>
        </div>
        
        <div className="auth-toggle-container">
          <div className="auth-toggle">
            <div className="auth-toggle-panel auth-toggle-left">
              <h1>Nouveau mot de passe</h1>
              <p>Entrez un nouveau mot de passe sécurisé pour votre compte</p>
            </div>
            <div className="auth-toggle-panel auth-toggle-right">
              <h1>Connexion sécurisée</h1>
              <p>Votre compte sera protégé avec votre nouveau mot de passe</p>
              <button 
                className="auth-hidden" 
                onClick={() => navigate('/auth')}
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
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
}

export default ResetPasswordPage;