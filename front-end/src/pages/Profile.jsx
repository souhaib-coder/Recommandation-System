import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchProfile, 
  updateProfileInfo, 
  updatePreferences, 
  changePassword, 
  deleteAccount, 
  getHistory, 
  clearHistory 
} from '../api/api';
import UserNavbar from './navbars/UserNavbar';
import { Link } from 'react-router-dom';
import { 
  FaUserCircle, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaHistory, 
  FaCog, 
  FaLock, 
  FaEye,
  FaClock,
  FaBookmark,
  FaChartLine,
  FaLightbulb
} from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { RiGraduationCapFill } from 'react-icons/ri';

const Profile = () => {
  // États utilisateur et profil
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    date_inscription: '',
  });

  const [profil, setProfil] = useState({
    domaine_intérêt: '',
    objectifs: '',
  });

  // Liste des domaines d'intérêt et objectifs
  const domainesInterets = ['Informatique', 'Mathématiques', 'Physique', 'Langues'];
  const objectifsList = ['Révision', 'Préparation examen', 'Apprentissage', 'Approfondissement'];

  // États de navigation et contrôle
  const [historique, setHistorique] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  // États pour l'édition
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [editedProfil, setEditedProfil] = useState({});
  const [passwordData, setPasswordData] = useState({
    ancien_mdp: '',
    nouveau_mdp: '',
    confirmPassword: '',
  });

  // États pour la pagination de l'historique
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Fonction pour la recherche
  const handleSearchFromNav = (searchTerm) => {
    console.log("Recherche depuis la navbar:", searchTerm);
  };

  // Récupérer les données du profil utilisateur
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchProfile();
      setUser(response.user);
      if (response.profil) {
        setProfil(response.profil);
      }
      setEditedUser(response.user);
      setEditedProfil(response.profil || {});
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des données utilisateur');
      setLoading(false);
      console.error('Error fetching user data:', err);
    }
  }, []);

  // Récupérer l'historique
  const fetchHistorique = useCallback(async () => {
    try {
      const data = await getHistory();
      setHistorique(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Charger l'historique lorsque l'onglet est sélectionné
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistorique();
    }
  }, [activeTab, fetchHistorique]);

  // Fonction pour obtenir les icônes par domaine
  const getDomaineIcon = (domaine) => {
    const icons = {
      "Informatique": "bi-laptop",
      "Mathématiques": "bi-calculator",
      "Physique": "bi-atom",
      "Chimie": "bi-flask",
      "Langues": "bi-translate",
    };
    return icons[domaine] || "bi-book";
  };

  // Fonction pour obtenir les couleurs par niveau
  const getNiveauBadgeClass = (niveau) => {
    const colors = {
      "Débutant": "bg-success",
      "Intermédiaire": "bg-warning text-dark",
      "Avancé": "bg-danger",
    };
    return colors[niveau] || "bg-secondary";
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistorique = historique.slice(indexOfFirstItem, indexOfLastItem);
  
  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(historique.length / itemsPerPage);

  // Fonctions pour la gestion des données utilisateur
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setEditedProfil({
      ...editedProfil,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  // Validation de l'email
  const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Sauvegarde des informations personnelles
  const savePersonalInfo = async (e) => {
    e.preventDefault();

    if (!isEmailValid(editedUser.email)) {
      setError("L'adresse email est invalide. Exemple attendu : nom@domaine.com");
      return;
    }

    try {
      const response = await updateProfileInfo(editedUser);
      setUser(response.user || editedUser);
      setEditingPersonalInfo(false);
      displaySuccessMessage('Informations personnelles mises à jour avec succès');
    } catch (err) {
      const serverError = err.response?.data?.error;
      if (serverError && serverError.toLowerCase().includes('email')) {
        setError(serverError);
      } else {
        setError("Erreur lors de la mise à jour des informations");
      }
      console.error("Error updating user info:", err);
    }
  };

  // Sauvegarde des préférences
  const savePreferences = async (e) => {
    e.preventDefault();
    try {
      const response = await updatePreferences(editedProfil);
      setProfil(response.profil || editedProfil);
      setEditingPreferences(false);
      displaySuccessMessage('Préférences mises à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour des préférences');
      console.error('Error updating preferences:', err);
    }
  };

  // Sauvegarde du nouveau mot de passe
  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordData.nouveau_mdp !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await changePassword({
        ancien_mdp: passwordData.ancien_mdp,
        nouveau_mdp: passwordData.nouveau_mdp
      });
      setEditingPassword(false);
      setPasswordData({ ancien_mdp: '', nouveau_mdp: '', confirmPassword: '' });
      displaySuccessMessage('Mot de passe mis à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour du mot de passe');
      console.error('Error updating password:', err);
    }
  };

  // Supprimer le compte utilisateur
  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
      try {
        await deleteAccount();
        window.location.href = '/';
      } catch (err) {
        console.error('Error deleting account:', err);
        setError('Erreur lors de la suppression du compte');
      }
    }
  };

  // Effacer l'historique
  const handleClearHistory = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer tout votre historique?')) {
      try {
        await clearHistory();
        setHistorique([]);
        displaySuccessMessage('Historique effacé avec succès');
      } catch (err) {
        console.error('Error clearing history:', err);
        setError('Erreur lors de l\'effacement de l\'historique');
      }
    }
  };

  // Annuler l'édition
  const cancelEdit = (editType) => {
    if (editType === 'personal') {
      setEditingPersonalInfo(false);
      setEditedUser(user);
    } else if (editType === 'preferences') {
      setEditingPreferences(false);
      setEditedProfil(profil);
    } else if (editType === 'password') {
      setEditingPassword(false);
      setPasswordData({ ancien_mdp: '', nouveau_mdp: '', confirmPassword: '' });
    }
    setError(null);
  };

  // Afficher un message de succès temporaire
  const displaySuccessMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: "100vh", background: "var(--light-bg)"}}>
      <div className="spinner-grow" style={{color: "var(--primary-color)"}} role="status"></div>
      <div className="fw-bold ms-3">Chargement de votre profil...</div>
    </div>
  );

  return (
    <div className="education-profile" style={{background: "var(--light-bg)", minHeight: "100vh"}}>
      <UserNavbar onSearch={handleSearchFromNav} />
      
      {/* Hero Banner */}
      <div className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "250px",
        marginTop: "70px",
        padding: "3rem 0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <div className="container position-relative" style={{zIndex: "2"}}>
          <div className="row align-items-center">
            <div className="col-lg-12 py-4 text-center">
              <h1 className="display-4 fw-bold mb-3" style={{textShadow: "2px 2px 4px rgba(0,0,0,0.1)"}}>
                <RiGraduationCapFill className="me-3" />
                Votre Profil
              </h1>
              <p className="lead mb-0 opacity-90" style={{fontSize: "1.2rem"}}>
                Gérez vos informations personnelles et vos préférences d'apprentissage
              </p>
            </div>
          </div>
        </div>
        <div className="position-absolute bottom-0 start-0 w-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" style={{display: "block"}}>
            <path fill="var(--light-bg)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      <div className="container py-5">
        {message && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm rounded-lg mb-4" role="alert" style={{
            borderLeft: "4px solid var(--success)",
            borderRadius: "var(--border-radius-sm)"
          }}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm rounded-lg mb-4" role="alert" style={{
            borderLeft: "4px solid var(--danger)",
            borderRadius: "var(--border-radius-sm)"
          }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}
        
        <div className="row g-4">
          {/* Left Column (Navigation) */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 sticky-top" style={{
              borderRadius: "var(--border-radius-sm)", 
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              top: "100px",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>
              <div className="card-header border-0 py-3" style={{
                background: "var(--white)",
                borderRadius: "var(--border-radius-sm)"
              }}>
                <div className="d-flex flex-column align-items-center text-center py-3">
                  <div className="user-avatar mb-3 position-relative">
                    <FaUserCircle size={90} style={{color: "var(--primary-color)"}} />
                    <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-2 border-white">
                      <div style={{width: "20px", height: "20px"}}></div>
                    </div>
                  </div>
                  <h5 className="mb-1 fw-bold">{user.prenom} {user.nom}</h5>
                  <p className="text-muted small mb-2">{user.email}</p>
                  <p className="badge bg-light text-dark" style={{fontWeight: "500"}}>
                    <i className="bi bi-calendar-check me-1"></i>
                    Membre depuis {new Date(user.date_inscription).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="card-body">
                <h6 className="text-uppercase text-muted small mb-3 fw-bold">Navigation</h6>
                <nav className="profile-nav">
                  <button 
                    className={`profile-nav-item d-flex align-items-center ${activeTab === 'profile' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('profile')}
                    style={{
                      padding: "0.75rem 1rem",
                      border: "none",
                      background: "transparent",
                      width: "100%",
                      textAlign: "left",
                      borderRadius: "var(--border-radius-sm)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div className="icon-wrapper me-3" style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: activeTab === 'profile' ? "rgba(var(--primary-rgb), 0.1)" : "var(--light-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaUserCircle style={{
                        color: activeTab === 'profile' ? "var(--primary-color)" : "var(--text-muted)"
                      }} />
                    </div>
                    <span style={{
                      fontWeight: activeTab === 'profile' ? "600" : "500",
                      color: activeTab === 'profile' ? "var(--primary-color)" : "var(--text-dark)"
                    }}>Informations personnelles</span>
                  </button>
                  
                  <button 
                    className={`profile-nav-item d-flex align-items-center ${activeTab === 'history' ? 'active' : ''}`}  
                    onClick={() => setActiveTab('history')}
                    style={{
                      padding: "0.75rem 1rem",
                      border: "none",
                      background: "transparent",
                      width: "100%",
                      textAlign: "left",
                      borderRadius: "var(--border-radius-sm)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div className="icon-wrapper me-3" style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: activeTab === 'history' ? "rgba(var(--primary-rgb), 0.1)" : "var(--light-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaHistory style={{
                        color: activeTab === 'history' ? "var(--primary-color)" : "var(--text-muted)"
                      }} />
                    </div>
                    <span style={{
                      fontWeight: activeTab === 'history' ? "600" : "500",
                      color: activeTab === 'history' ? "var(--primary-color)" : "var(--text-dark)"
                    }}>Mon Historique</span>
                  </button>
                  
                  <button 
                    className={`profile-nav-item d-flex align-items-center ${activeTab === 'settings' ? 'active' : ''}`}  
                    onClick={() => setActiveTab('settings')}
                    style={{
                      padding: "0.75rem 1rem",
                      border: "none",
                      background: "transparent",
                      width: "100%",
                      textAlign: "left",
                      borderRadius: "var(--border-radius-sm)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div className="icon-wrapper me-3" style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: activeTab === 'settings' ? "rgba(var(--primary-rgb), 0.1)" : "var(--light-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaCog style={{
                        color: activeTab === 'settings' ? "var(--primary-color)" : "var(--text-muted)"
                      }} />
                    </div>
                    <span style={{
                      fontWeight: activeTab === 'settings' ? "600" : "500",
                      color: activeTab === 'settings' ? "var(--primary-color)" : "var(--text-dark)"
                    }}>Paramètres</span>
                  </button>
                </nav>
                
                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-top">
                  <h6 className="mb-3 d-flex align-items-center">
                    <FaChartLine className="me-2" style={{color: "var(--primary-color)"}} />
                    <span>Votre progression</span>
                  </h6>
                  <div className="row g-3">
                    {[
                      { icon: "bi-journals", label: "Cours complétés", value: "0" },
                      { icon: "bi-clock-history", label: "Heures", value: "0" },
                      { icon: "bi-lightning-charge", label: "Jours consécutifs", value: "1" }
                    ].map((stat, index) => (
                      <div className="col-4 text-center" key={index}>
                        <div className="py-2 px-2 bg-light rounded" style={{background: "var(--accent-bg) !important"}}>
                          <div className="mb-1">
                            <i className={`${stat.icon} fs-5`} style={{color: "var(--primary-color)"}}></i>
                          </div>
                          <h6 className="fw-bold mb-0" style={{color: "var(--primary-color)"}}>{stat.value}</h6>
                          <small style={{color: "var(--text-light)"}} className="d-block text-truncate">{stat.label}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-top">
                  <Link to="/user/favorites" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center">
                    <FaBookmark className="me-2" /> Voir mes favoris
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column (Content) */}
          <div className="col-lg-8">
            {activeTab === 'profile' && (
              <>
                {/* Personal Information Section */}
                <div className="card shadow-sm border-0 mb-4" style={{
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="card-header border-0 py-3" style={{
                    background: "var(--white)",
                    borderRadius: "var(--border-radius-sm)"
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="m-0 d-flex align-items-center">
                        <GiTeacher className="me-2" style={{color: "var(--primary-color)"}} />
                        <span>Informations personnelles</span>
                      </h5>
                      {!editingPersonalInfo && (
                        <button 
                          className="btn btn-sm btn-outline-primary d-flex align-items-center" 
                          onClick={() => setEditingPersonalInfo(true)}
                          style={{borderRadius: "var(--border-radius-sm)"}}
                        >
                          <FaEdit className="me-2" /> Modifier
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    {!editingPersonalInfo ? (
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <p className="text-muted mb-1 small">Nom</p>
                          <p className="fw-medium" style={{fontSize: "1.1rem"}}>{user.nom}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                          <p className="text-muted mb-1 small">Prénom</p>
                          <p className="fw-medium" style={{fontSize: "1.1rem"}}>{user.prenom}</p>
                        </div>
                        <div className="col-md-4 mb-3">
                          <p className="text-muted mb-1 small">Email</p>
                          <p className="fw-medium" style={{fontSize: "1.1rem"}}>{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={savePersonalInfo}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="nom" className="form-label fw-medium">Nom</label>
                            <input
                              type="text"
                              className="form-control"
                              id="nom"
                              name="nom"
                              value={editedUser.nom || ''}
                              onChange={handlePersonalInfoChange}
                              required
                              style={{
                                borderRadius: "var(--border-radius-sm)", 
                                background: "var(--input-bg)",
                                border: "1px solid rgba(0,0,0,0.1)"
                              }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="prenom" className="form-label fw-medium">Prénom</label>
                            <input
                              type="text"
                              className="form-control"
                              id="prenom"
                              name="prenom"
                              value={editedUser.prenom || ''}
                              onChange={handlePersonalInfoChange}
                              required
                              style={{
                                borderRadius: "var(--border-radius-sm)", 
                                background: "var(--input-bg)",
                                border: "1px solid rgba(0,0,0,0.1)"
                              }}
                            />
                          </div>
                          <div className="col-md-12">
                            <label htmlFor="email" className="form-label fw-medium">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              value={editedUser.email || ''}
                              onChange={handlePersonalInfoChange}
                              required
                              style={{
                                borderRadius: "var(--border-radius-sm)", 
                                background: "var(--input-bg)",
                                border: "1px solid rgba(0,0,0,0.1)"
                              }}
                            />
                          </div>
                          <div className="col-12 d-flex gap-2 mt-4">
                            <button 
                              type="submit" 
                              className="btn d-flex align-items-center" 
                              style={{
                                background: "var(--primary-color)",
                                color: "var(--white)",
                                borderRadius: "var(--border-radius-sm)",
                                padding: "0.5rem 1.5rem"
                              }}
                            >
                              <FaSave className="me-2" /> Enregistrer
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary d-flex align-items-center"
                              onClick={() => cancelEdit('personal')}
                              style={{
                                borderRadius: "var(--border-radius-sm)",
                                padding: "0.5rem 1.5rem"
                              }}
                            >
                              <FaTimes className="me-2" /> Annuler
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
                
                {/* Learning Preferences Section */}
                <div className="card shadow-sm border-0" style={{
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="card-header border-0 py-3" style={{
                    background: "var(--white)",
                    borderRadius: "var(--border-radius-sm)"
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="m-0 d-flex align-items-center">
                        <FaLightbulb className="me-2" style={{color: "var(--primary-color)"}} />
                        <span>Préférences d'apprentissage</span>
                      </h5>
                      {!editingPreferences && (
                        <button 
                          className="btn btn-sm btn-outline-primary d-flex align-items-center" 
                          onClick={() => setEditingPreferences(true)}
                          style={{borderRadius: "var(--border-radius-sm)"}}
                        >
                          <FaEdit className="me-2" /> Modifier
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    {!editingPreferences ? (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <p className="text-muted mb-1 small">Domaine d'intérêt</p>
                          <div className="d-flex align-items-center">
                            <i className={`bi ${getDomaineIcon(profil.domaine_intérêt)} me-2`} style={{
                              color: "var(--primary-color)",
                              fontSize: "1.2rem"
                            }}></i>
                            <p className="fw-medium mb-0" style={{fontSize: "1.1rem"}}>
                              {profil.domaine_intérêt || 'Non spécifié'}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <p className="text-muted mb-1 small">Objectifs</p>
                          <p className="fw-medium" style={{fontSize: "1.1rem"}}>
                            {profil.objectifs || 'Non spécifié'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={savePreferences}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="domaine_intérêt" className="form-label fw-medium">Domaine d'intérêt</label>
                            <select
                              className="form-select"
                              id="domaine_intérêt"
                              name="domaine_intérêt" 
                              value={editedProfil.domaine_intérêt || ''}
                              onChange={handlePreferencesChange}
                              required
                              style={{
                                borderRadius: "var(--border-radius-sm)", 
                                background: "var(--input-bg)",
                                border: "1px solid rgba(0,0,0,0.1)"
                              }}
                            >
                              <option value="">Sélectionnez un domaine</option>
                              {domainesInterets.map((domaine, index) => (
                                <option key={index} value={domaine}>{domaine}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="objectifs" className="form-label fw-medium">Objectifs</label>
                            <select
                              className="form-select"
                              id="objectifs"
                              name="objectifs" 
                              value={editedProfil.objectifs || ''}
                              onChange={handlePreferencesChange}
                              required
                              style={{
                                borderRadius: "var(--border-radius-sm)", 
                                background: "var(--input-bg)",
                                border: "1px solid rgba(0,0,0,0.1)"
                              }}
                            >
                              <option value="">Sélectionnez un objectif</option>
                              {objectifsList.map((objectif, index) => (
                                <option key={index} value={objectif}>{objectif}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-12 d-flex gap-2 mt-4">
                            <button 
                              type="submit" 
                              className="btn d-flex align-items-center" 
                              style={{
                                background: "var(--primary-color)",
                                color: "var(--white)",
                                borderRadius: "var(--border-radius-sm)",
                                padding: "0.5rem 1.5rem"
                              }}
                            >
                              <FaSave className="me-2" /> Enregistrer
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary d-flex align-items-center"
                              onClick={() => cancelEdit('preferences')}
                              style={{
                                borderRadius: "var(--border-radius-sm)",
                                padding: "0.5rem 1.5rem"
                              }}
                            >
                              <FaTimes className="me-2" /> Annuler
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'history' && (
              <div className="card shadow-sm border-0" style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid rgba(0,0,0,0.05)"
              }}>
                <div className="card-header border-0 py-3" style={{
                  background: "var(--white)",
                  borderRadius: "var(--border-radius-sm)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="m-0 d-flex align-items-center">
                      <FaHistory className="me-2" style={{color: "var(--primary-color)"}} />
                      <span>Mon historique de cours</span>
                    </h5>
                    <button 
                      className="btn btn-sm btn-outline-danger d-flex align-items-center"
                      onClick={handleClearHistory}
                      style={{borderRadius: "var(--border-radius-sm)"}}
                    >
                      <FaTrash className="me-2" /> Effacer tout
                    </button>
                  </div>
                </div>
                
                <div className="card-body">
                  {historique.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-3 mb-3" style={{color: "var(--text-light)"}}>
                        <i className="bi bi-clock-history"></i>
                      </div>
                      <h5 className="mb-3">Votre historique est vide</h5>
                      <p style={{color: "var(--text-light)"}} className="mb-4">
                        Consultez des cours pour les voir apparaître ici.
                      </p>
                      <Link to="/cours" className="btn" style={{
                        background: "var(--primary-color)",
                        color: "var(--white)",
                        borderRadius: "var(--border-radius-sm)",
                        padding: "0.5rem 1.5rem"
                      }}>
                        Explorer les cours
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="row g-3">
  {currentHistorique.map((item) => (
    <div className="col-md-6 col-lg-4" key={item.id_historique}>
      <div className="card h-100 border-0 overflow-hidden" style={{
        borderRadius: "var(--border-radius-sm)",
        transition: "all 0.25s ease-in-out",
        boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
        transform: "translateY(0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
      }}
      >
        <div className="position-relative">
          <div className="card-img-top bg-light" style={{height: "100px", background: "var(--accent-bg)"}}>
            <div className="h-100 d-flex align-items-center justify-content-center">
              <i className={`${getDomaineIcon(item.domaine)} display-5`} style={{color: "var(--primary-color)"}}></i>
            </div>
          </div>
          <div className="position-absolute" style={{top: "8px", right: "8px"}}>
            <span className={`badge ${getNiveauBadgeClass(item.niveau)}`} style={{fontSize: "0.65rem"}}>
              {item.niveau}
            </span>
          </div>
          <div className="position-absolute" style={{top: "8px", left: "8px"}}>
            <span className="badge" style={{background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.65rem"}}>
              <i className="bi bi-eye me-1"></i>{item.nombre_vues || 0}
            </span>
          </div>
        </div>
        
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)", fontSize: "0.7rem"}}>
              {item.domaine}
            </span>
          </div>
          <h6 className="card-title mb-2 fw-bold text-truncate">{item.nom}</h6>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)", fontSize: "0.7rem"}}>
              <i className="bi bi-clock me-1"></i>{item.durée || 0} min
            </span>
          </div>
          <div className="d-flex align-items-center small" style={{color: "var(--text-light)", fontSize: "0.7rem"}}>
            <i className="bi bi-calendar-check me-1"></i>
            <span>Consulté le {new Date(item.date_consultation).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="card-footer border-top d-flex justify-content-between align-items-center py-2 px-3" style={{background: "var(--white)"}}>
          <button className="btn btn-sm p-1" style={{color: "var(--text-dark)", fontSize: "0.7rem"}}>
            <i className="bi bi-info-circle me-1"></i>Info
          </button>
          <Link to={`/DetailCours/${item.cours_id}`} className="btn btn-sm p-1" style={{
            background: "var(--primary-color)",
            color: "var(--white)",
            fontSize: "0.7rem",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          >
            <i className="bi bi-play-fill me-1"></i>Revoir
          </Link>
        </div>
      </div>
    </div>
  ))}
</div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <nav>
                            <ul className="pagination">
                              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button 
                                  className="page-link" 
                                  onClick={() => paginate(currentPage - 1)}
                                  style={{
                                    borderRadius: "var(--border-radius-sm)",
                                    border: "1px solid rgba(0,0,0,0.1)"
                                  }}
                                >
                                  <i className="bi bi-chevron-left"></i>
                                </button>
                              </li>
                              {[...Array(totalPages)].map((_, index) => (
                                <li 
                                  key={index} 
                                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                  <button 
                                    className="page-link" 
                                    onClick={() => paginate(index + 1)}
                                    style={{
                                      borderRadius: "var(--border-radius-sm)",
                                      border: "1px solid rgba(0,0,0,0.1)"
                                    }}
                                  >
                                    {index + 1}
                                  </button>
                                </li>
                              ))}
                              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button 
                                  className="page-link" 
                                  onClick={() => paginate(currentPage + 1)}
                                  style={{
                                    borderRadius: "var(--border-radius-sm)",
                                    border: "1px solid rgba(0,0,0,0.1)"
                                  }}
                                >
                                  <i className="bi bi-chevron-right"></i>
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="card shadow-sm border-0" style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid rgba(0,0,0,0.05)"
              }}>
                <div className="card-header border-0 py-3" style={{
                  background: "var(--white)",
                  borderRadius: "var(--border-radius-sm)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="m-0 d-flex align-items-center">
                      <FaLock className="me-2" style={{color: "var(--primary-color)"}} />
                      <span>Sécurité du compte</span>
                    </h5>
                  </div>
                </div>
                
                <div className="card-body">
                  {!editingPassword ? (
                    <div className="mb-4">
                      <div className="row mb-4 p-3 border-bottom" style={{borderColor: "rgba(0,0,0,0.05)"}}>
                        <div className="col-md-8">
                          <h6 className="fw-bold mb-2">Mot de passe</h6>
                          <p className="text-muted mb-0">Modifiez votre mot de passe pour sécuriser votre compte</p>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <button 
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => setEditingPassword(true)}
                            style={{borderRadius: "var(--border-radius-sm)"}}
                          >
                            <FaLock className="me-2" /> Changer
                          </button>
                        </div>
                      </div>
                      
                      <div className="row p-3">
                        <div className="col-md-8">
                          <h6 className="fw-bold mb-2 text-danger">Supprimer le compte</h6>
                          <p className="text-muted mb-0">Cette action est irréversible et supprimera toutes vos données</p>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <button 
                            className="btn btn-outline-danger d-flex align-items-center"
                            onClick={handleDeleteAccount}
                            style={{borderRadius: "var(--border-radius-sm)"}}
                          >
                            <FaTrash className="me-2" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={savePassword}>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label htmlFor="ancien_mdp" className="form-label fw-medium">Mot de passe actuel</label>
                          <input
                            type="password"
                            className="form-control"
                            id="ancien_mdp"
                            name="ancien_mdp"
                            value={passwordData.ancien_mdp}
                            onChange={handlePasswordChange}
                            required
                            style={{
                              borderRadius: "var(--border-radius-sm)", 
                              background: "var(--input-bg)",
                              border: "1px solid rgba(0,0,0,0.1)"
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="nouveau_mdp" className="form-label fw-medium">Nouveau mot de passe</label>
                          <input
                            type="password"
                            className="form-control"
                            id="nouveau_mdp"
                            name="nouveau_mdp"
                            value={passwordData.nouveau_mdp}
                            onChange={handlePasswordChange}
                            required
                            minLength="8"
                            style={{
                              borderRadius: "var(--border-radius-sm)", 
                              background: "var(--input-bg)",
                              border: "1px solid rgba(0,0,0,0.1)"
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="confirmPassword" className="form-label fw-medium">Confirmer le mot de passe</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength="8"
                            style={{
                              borderRadius: "var(--border-radius-sm)", 
                              background: "var(--input-bg)",
                              border: "1px solid rgba(0,0,0,0.1)"
                            }}
                          />
                        </div>
                        <div className="col-12 d-flex gap-2 mt-4">
                          <button 
                            type="submit" 
                            className="btn d-flex align-items-center" 
                            style={{
                              background: "var(--primary-color)",
                              color: "var(--white)",
                              borderRadius: "var(--border-radius-sm)",
                              padding: "0.5rem 1.5rem"
                            }}
                          >
                            <FaSave className="me-2" /> Enregistrer
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary d-flex align-items-center"
                            onClick={() => cancelEdit('password')}
                            style={{
                              borderRadius: "var(--border-radius-sm)",
                              padding: "0.5rem 1.5rem"
                            }}
                          >
                            <FaTimes className="me-2" /> Annuler
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;