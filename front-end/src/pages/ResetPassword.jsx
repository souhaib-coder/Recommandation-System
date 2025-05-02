import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import "../css/ResetPasswordStyle.css";

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
      
    </div>
  );
}

export default ResetPasswordPage;