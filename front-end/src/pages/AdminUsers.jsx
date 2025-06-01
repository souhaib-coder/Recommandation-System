import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
    getUsers, 
    updateUserRole,
    checkAuth,
    checkAdmin
  } from '../api/api';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Shield, 
  RefreshCw, 
  Search,
  XCircle, 
  Save, 
  Filter
} from 'lucide-react';
import AdminNavbar from './navbars/AdminNavbar';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const initialFormState = {
      nom: '',
      prenom: '',
      email: '',
      rôle: 'user'
    };
    
    const [formData, setFormData] = useState(initialFormState);
  
    // Fonction pour charger tous les utilisateurs
    const loadUsers = async () => {
      const authStatus = await checkAuth();
        
        if (!authStatus.authenticated) {
          // L'utilisateur n'est pas connecté, redirection vers la page de connexion
          navigate('/auth', { replace: true });
          return;
        }
        
      const adminStatus = await checkAdmin();
        
        if (!adminStatus.isAdmin) {
          if (adminStatus.error === 'Non connecté') {
            navigate('/auth', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
          return;
        }
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        // Gestion simplifiée des erreurs
        if (err.response && err.response.status === 401) {
          setError({
            type: 'error',
            message: "Vous n'êtes pas authentifié. Redirection vers la page de connexion..."
          });
          setTimeout(() => navigate('/auth'), 2000);
        } else {
          setError({
            type: 'error',
            message: err.response?.data?.message || err.message || "Une erreur est survenue"
          });
        }
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      loadUsers();
    }, []);
  
    // Gestionnaire pour la modification des champs du formulaire
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    };
  
    // Fonction pour réinitialiser le formulaire
    const resetForm = () => {
      setFormData(initialFormState);
      setEditingUser(null);
      setError(null);
    };
  
    // Fonction pour charger les données d'un utilisateur à modifier
    const editUser = (user) => {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        rôle: user.rôle || 'user'
      });
      
      setEditingUser(user);
      setShowEditForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  
    // Fonction pour soumettre le formulaire (modifier rôle)
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Validation du formulaire
        if (!formData.rôle) {
          throw new Error("Le rôle est obligatoire");
        }
        
        // Vérifier si le rôle a réellement changé
        if (editingUser && formData.rôle === editingUser.rôle) {
          setShowEditForm(false);
          setIsSubmitting(false);
          return; // Aucun changement, sortir sans appel API
        }
        
        // Mise à jour du rôle
        if (editingUser) {
          // Le backend attend 'role' (sans accent)
          const response = await updateUserRole(editingUser.id_user, formData.rôle);
          
          // Afficher temporairement un message de succès
          setError({ 
            type: 'success', 
            message: `Le rôle de l'utilisateur ${editingUser.prenom} ${editingUser.nom} a été modifié avec succès.` 
          });
          
          // Mettre à jour l'utilisateur dans la liste locale
          setUsers(users.map(user => 
            user.id_user === editingUser.id_user 
              ? { ...user, rôle: formData.rôle } 
              : user
          ));
          
          // Réinitialiser le formulaire et l'état après succès
          setTimeout(() => {
            resetForm();
            setShowEditForm(false);
            setError(null);
          }, 3000);
        }
      } catch (err) {
        // Gestion simplifiée des erreurs
        if (err.response && err.response.status === 401) {
          setError({
            type: 'error',
            message: "Vous n'êtes pas authentifié. Redirection vers la page de connexion..."
          });
          setTimeout(() => navigate('/auth'), 2000);
        } else {
          setError({
            type: 'error',
            message: err.response?.data?.message || err.message || "Une erreur est survenue"
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  
    // Filtrer les utilisateurs en fonction du terme de recherche et du rôle
    const filteredUsers = users.filter(user => {
      const searchFields = `${user.nom} ${user.prenom} ${user.email}`.toLowerCase();
      const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === '' || user.rôle === filterRole;
      return matchesSearch && matchesRole;
    });
  
    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
    // Changer de page
    const paginate = (pageNumber) => {
      if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    };
  
    // Fonction pour obtenir la couleur de badge en fonction du rôle
    const getRoleBadgeColor = (role) => {
      return role === 'admin' ? '#f72585' : '#4361ee';
    };
  
    // Fonction pour formater la date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      
      try {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      } catch (error) {
        return 'Format invalide';
      }
    };
  
    // Afficher un écran de chargement initial
    if (loading && users.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <div className="fw-bold">Chargement des utilisateurs...</div>
        </div>
      );
    }
  
    return (
      <div className="admin-users" style={{background: "var(--light-bg)"}}>
        <AdminNavbar />
        
        {/* Hero Banner */}
        <div className="hero-section text-white position-relative" style={{
          background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
          minHeight: "200px",
          marginTop: "70px",
          padding: "2rem 0"
        }}>
          <div className="container position-relative" style={{zIndex: "2"}}>
            <div className="row align-items-center">
              <div className="col-lg-8 py-3">
                <h1 className="display-5 fw-bold mb-2">Gestion des Utilisateurs</h1>
                <p className="lead opacity-90 mb-0">Consultez et modifiez les rôles des utilisateurs de la plateforme.</p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <button 
                  className="btn btn-light btn-lg px-4 py-2"
                  style={{borderRadius: "var(--border-radius-sm)"}}
                  onClick={() => setShowEditForm(false)}
                  disabled={!showEditForm}
                >
                  {showEditForm ? (
                    <>
                      <XCircle size={20} className="me-2" />
                      Annuler l'édition
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} className="me-2" />
                      Gestion des rôles
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="position-absolute bottom-0 start-0 w-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" style={{display: "block"}}>
              <path fill="var(--light-bg)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
            </svg>
          </div>
        </div>
  
        <div className="container py-4">
          {/* Notification */}
          {error && (
            <div className={`alert ${error.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`} 
                 role="alert" 
                 style={{borderRadius: "var(--border-radius-sm)"}}>
              <i className={`bi ${error.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
              <div>{error.message || error}</div>
              <button 
                type="button" 
                className="btn-close ms-auto" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}
  
          {/* Formulaire de modification */}
          {showEditForm && editingUser && (
            <div className="card border-0 shadow-sm mb-4" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-header py-3 bg-transparent">
                <h5 className="mb-0">
                  <Edit size={18} className="me-2" style={{color: "var(--primary-color)"}} />
                  Modifier le rôle de l'utilisateur
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        className="form-control"
                        style={{
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid #eaeaea",
                          padding: "0.625rem 1rem",
                          background: "var(--input-bg)"
                        }}
                        disabled
                      />
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        className="form-control"
                        style={{
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid #eaeaea",
                          padding: "0.625rem 1rem",
                          background: "var(--input-bg)"
                        }}
                        disabled
                      />
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="form-control"
                        style={{
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid #eaeaea",
                          padding: "0.625rem 1rem",
                          background: "var(--input-bg)"
                        }}
                        disabled
                      />
                    </div>
                    
                    <div className="col-md-12">
                      <label className="form-label">Rôle <span className="text-danger">*</span></label>
                      <select
                        name="rôle"
                        value={formData.rôle}
                        onChange={handleChange}
                        className="form-select"
                        style={{
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid #eaeaea",
                          padding: "0.625rem 1rem",
                          background: "var(--input-bg)"
                        }}
                        required
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                      <p className="form-text mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Les administrateurs ont accès au tableau de bord et à toutes les fonctionnalités de gestion.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 d-flex">
                    <button
                      type="submit"
                      className="btn px-4 py-2 me-2"
                      style={{
                        background: "var(--primary-color)",
                        color: "var(--white)",
                        borderRadius: "var(--border-radius-sm)"
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="me-2" />
                          Mettre à jour le rôle
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowEditForm(false);
                      }}
                      className="btn px-4 py-2"
                      style={{
                        background: "var(--accent-bg)",
                        color: "var(--text-dark)",
                        borderRadius: "var(--border-radius-sm)"
                      }}
                    >
                      <XCircle size={18} className="me-2" />
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
  
          {/* Filtres et recherche */}
          <div className="card border-0 shadow-sm mb-4" style={{borderRadius: "var(--border-radius-sm)"}}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text" style={{
                      background: "var(--input-bg)",
                      border: "1px solid #eaeaea",
                      borderRight: "none",
                      borderRadius: "var(--border-radius-sm) 0 0 var(--border-radius-sm)"
                    }}>
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderRadius: "0 var(--border-radius-sm) var(--border-radius-sm) 0",
                        border: "1px solid #eaeaea",
                        borderLeft: "none",
                        padding: "0.625rem 1rem",
                        background: "var(--input-bg)"
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text" style={{
                      background: "var(--input-bg)",
                      border: "1px solid #eaeaea",
                      borderRight: "none",
                      borderRadius: "var(--border-radius-sm) 0 0 var(--border-radius-sm)"
                    }}>
                      <Filter size={18} />
                    </span>
                    <select
                      className="form-select"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      style={{
                        borderRadius: "0 var(--border-radius-sm) var(--border-radius-sm) 0",
                        border: "1px solid #eaeaea",
                        borderLeft: "none",
                        padding: "0.625rem 1rem",
                        background: "var(--input-bg)"
                      }}
                    >
                      <option value="">Tous les rôles</option>
                      <option value="user">Utilisateurs</option>
                      <option value="admin">Administrateurs</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-2 text-end">
                  <button
                    onClick={loadUsers}
                    className="btn w-100 px-4 py-2"
                    style={{
                      background: "var(--accent-bg)",
                      color: "var(--text-dark)",
                      borderRadius: "var(--border-radius-sm)"
                    }}
                  >
                    <RefreshCw size={18} className="me-2" />
                    Actualiser
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          {/* Liste des utilisateurs */}
          <div className="card border-0 shadow-sm" style={{borderRadius: "var(--border-radius-sm)"}}>
            <div className="card-header py-3 bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Users size={18} className="me-2" style={{color: "var(--primary-color)"}} />
                  Liste des utilisateurs ({filteredUsers.length})
                </h5>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{background: "var(--accent-bg)"}}>
                    <tr>
                      <th className="border-0 py-3">ID</th>
                      <th className="border-0 py-3">Nom</th>
                      <th className="border-0 py-3">Prénom</th>
                      <th className="border-0 py-3">Email</th>
                      <th className="border-0 py-3">Rôle</th>
                      <th className="border-0 py-3">Inscription</th>
                      <th className="border-0 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <i className="bi bi-inbox me-2"></i>
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => (
                        <tr key={user.id_user}>
                          <td className="py-3 align-middle">{user.id_user}</td>
                          <td className="py-3 align-middle">{user.nom || '-'}</td>
                          <td className="py-3 align-middle">{user.prenom || '-'}</td>
                          <td className="py-3 align-middle">{user.email}</td>
                          <td className="py-3 align-middle">
                            <span className="badge px-3 py-2" style={{                            
                              color: "white",
                              background: getRoleBadgeColor(user.rôle),
                              borderRadius: "var(--border-radius-sm)"
                            }}>
                              {user.rôle === 'admin' ? (
                                <>
                                  <Shield size={14} className="me-1" />
                                  Administrateur
                                </>
                              ) : (
                                <>
                                  <Users size={14} className="me-1" />
                                  Utilisateur
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 align-middle">
                            {formatDate(user.date_inscription)}
                          </td>
                          <td className="py-3 align-middle text-end">
                            <button
                              onClick={() => editUser(user)}
                              className="btn btn-sm mx-1"
                              style={{
                                background: "rgba(58, 12, 163, 0.1)",
                                color: "#3a0ca3",
                                borderRadius: "var(--border-radius-sm)"
                              }}
                              title="Modifier le rôle"
                            >
                              <Edit size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Affichage de {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0}-{Math.min(indexOfLastUser, filteredUsers.length)} utilisateurs sur {filteredUsers.length} au total
                  </small>
                </div>
                <nav aria-label="Page navigation">
                  {totalPages > 1 && (
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Précédent"
                        >
                          <span aria-hidden="true">&laquo;</span>
                        </button>
                      </li>
                      
                      {/* Pages simplifiées */}
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Suivant"
                        >
                          <span aria-hidden="true">&raquo;</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-4 mt-5" style={{background: "var(--text-dark)", color: "var(--white)"}}>
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-lightning-charge-fill me-2"></i>DevStorm
                </h5>
                <p style={{color: "var(--text-light)"}}>Plateforme mondiale d'éducation et de formation en ligne.</p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-0" style={{color: "var(--text-light)"}}>© 2025 DevStorm. Tous droits réservés.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };
  
  export default AdminUsers;