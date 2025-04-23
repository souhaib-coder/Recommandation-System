import React, { useEffect, useState } from "react";
import { getDashboardData, searchCours } from "../api/api";
import AdminNavbar from "./navbars/AdminNavbar";
import UserNavbar from "./navbars/UserNavbar";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour les filtres de recherche
  const [search, setSearch] = useState("");
  const [domaine, setDomaine] = useState("");
  const [type, setType] = useState("");
  const [niveau, setNiveau] = useState("");
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [coursPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecommandations = (filters = {}) => {
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) cleanFilters[key] = filters[key];
    });
  
    setLoading(true);
    searchCours(cleanFilters)
      .then((data) => {
        setRecommandations(data);
        setTotalPages(Math.ceil(data.length / coursPerPage));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des recommandations:", err);
        setLoading(false);
      });
  };

  const fetchDashboard = () => {
    setLoading(true);
    getDashboardData()
      .then((data) => {
        setIsAdmin(data.admin);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du dashboard:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
    fetchRecommandations();
  }, []);
  
  // Appliquer les filtres automatiquement à chaque changement
  useEffect(() => {
    fetchRecommandations({
      search,
      domaine,
      type_ressource: type,
      niveau,
    });
    setCurrentPage(1); // Revenir à la première page après un changement de filtre
  }, [search, domaine, type, niveau]);
  
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

  // Pagination - obtenir les cours actuels
  const indexOfLastCours = currentPage * coursPerPage;
  const indexOfFirstCours = indexOfLastCours - coursPerPage;
  const currentCours = recommandations.slice(indexOfFirstCours, indexOfLastCours);
  
  // Changement de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
      <div className="spinner-grow" style={{color: "var(--primary-color)"}} role="status"></div>
      <div className="fw-bold">Chargement de votre espace d'apprentissage...</div>
    </div>
  );

  return (
    <div className="education-dashboard" style={{background: "var(--light-bg)"}}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar onSearch={(value) => {
        setSearch(value);
      }} />}
      
      {/* Hero Banner */}
      <div className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "250px",
        marginTop: "70px",
        padding: "3rem 0"
      }}>


        
        <div className="container position-relative" style={{zIndex: "2"}}>
          <div className="row align-items-center">
            <div className="col-lg-12 py-4 text-center">
              <h1 className="display-4 fw-bold mb-3">Explorez le monde du savoir</h1>
              <p className="lead mb-0 opacity-90">Accédez à des milliers de ressources éducatives provenant du monde entier.</p>
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
        <div className="row g-4">
          {/* Left Column (Filtres) */}
          <div className="col-lg-4">
            {/* Filters Card */}
            <div className="card shadow-sm border-0 sticky-top" style={{
              borderRadius: "var(--border-radius-sm)", 
              boxShadow: "var(--shadow)",
              top: "100px"
            }}>
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0">
                  <i className="bi bi-funnel-fill me-2" style={{color: "var(--primary-color)"}}></i>
                  Filtres
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">Domaine</label>
                  <select 
                    className="form-select" 
                    style={{borderRadius: "var(--border-radius-sm)", background: "var(--input-bg)"}} 
                    value={domaine} 
                    onChange={(e) => setDomaine(e.target.value)}
                  >
                    <option value="">Tous les domaines</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Chimie">Chimie</option>
                    <option value="Langues">Langues</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Type de ressource</label>
                  <select 
                    className="form-select" 
                    style={{borderRadius: "var(--border-radius-sm)", background: "var(--input-bg)"}} 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">Tous les types</option>
                    <option value="Tutoriel">Tutoriel</option>
                    <option value="Cours">Cours</option>
                    <option value="Livre">Livre</option>
                    <option value="TD">TD</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Niveau</label>
                  <select 
                    className="form-select" 
                    style={{borderRadius: "var(--border-radius-sm)", background: "var(--input-bg)"}} 
                    value={niveau} 
                    onChange={(e) => setNiveau(e.target.value)}
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                
                <button 
                  className="btn w-100" 
                  style={{
                    background: "var(--primary-color)",
                    color: "var(--white)",
                    borderRadius: "var(--border-radius-lg)"
                  }}
                  onClick={() => {
                    setSearch("");
                    setDomaine("");
                    setType("");
                    setNiveau("");
                    setCurrentPage(1);
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>Réinitialiser les filtres
                </button>
                
                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-top">
                  <h6 className="mb-3">
                    <i className="bi bi-bar-chart-line-fill me-2" style={{color: "var(--primary-color)"}}></i>
                    Votre progression
                  </h6>
                  <div className="row g-3">
                    {[
                      { icon: "bi-journals", label: "Cours complétés", value: "0" },
                      { icon: "bi-clock-history", label: "Heures", value: "0" },
                      { icon: "bi-lightning-charge", label: "Jours consécutifs", value: "1" }
                    ].map((stat, index) => (
                      <div className="col-4 text-center" key={index}>
                        <div className="py-2">
                          <div className="mb-1">
                            <i className={`${stat.icon}`} style={{color: "var(--primary-color)"}}></i>
                          </div>
                          <h6 className="fw-bold mb-0">{stat.value}</h6>
                          <small style={{color: "var(--text-light)"}} className="d-block text-truncate">{stat.label}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-top">
                  <Link to="/user/favorites" className="btn btn-outline-primary w-100">
                    <i className="bi bi-heart me-2"></i>Voir mes cours favoris
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column (Recommendations) */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">
                <i className="bi bi-stars text-warning me-2"></i>
                {search || domaine || type || niveau ? "Résultats de recherche" : "Cours recommandés pour vous"}
              </h4>
              <span className="badge rounded-pill" style={{background: "var(--primary-color)", color: "var(--white)"}}>{recommandations.length} cours</span>
            </div>
            
            {recommandations.length === 0 ? (
              <div className="card shadow-sm border-0 text-center p-5" style={{borderRadius: "var(--border-radius-sm)"}}>
                <div className="display-3 mb-3" style={{color: "var(--text-light)"}}>
                  <i className="bi bi-search"></i>
                </div>
                <h5 className="mb-3">Aucun résultat trouvé</h5>
                <p style={{color: "var(--text-light)"}} className="mb-4">Essayez de modifier vos critères de recherche.</p>
                <button className="btn mx-auto" style={{
                  borderRadius: "var(--border-radius-lg)",
                  color: "var(--primary-color)",
                  borderColor: "var(--primary-color)"
                }} onClick={() => {
                  setSearch("");
                  setDomaine("");
                  setType("");
                  setNiveau("");
                  setCurrentPage(1);
                }}>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {currentCours.map((c) => (
                    <div className="col-md-6" key={c.id_cours}>
                      <div className="card h-100 border-0 shadow-sm shadow-hover overflow-hidden" style={{
                        borderRadius: "var(--border-radius-sm)", 
                        transition: "var(--transition-speed)"
                      }}>
                        <div className="position-relative">
                          <div className="card-img-top bg-light" style={{height: "140px", background: "var(--accent-bg)"}}>
                            <div className="h-100 d-flex align-items-center justify-content-center">
                              <i className={`${getDomaineIcon(c.domaine)} display-4`} style={{color: "var(--primary-color)"}}></i>
                            </div>
                          </div>
                          <div className="position-absolute" style={{top: "15px", right: "15px"}}>
                            <span className={`badge ${getNiveauBadgeClass(c.niveau)}`}>
                              {c.niveau}
                            </span>
                          </div>
                          <div className="position-absolute" style={{top: "15px", left: "15px"}}>
                            <span className="badge" style={{background: "rgba(0,0,0,0.6)", color: "white"}}>
                              <i className="bi bi-eye me-1"></i>{c.nombre_vues}
                            </span>
                          </div>
                        </div>
                        
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                              {c.domaine}
                            </span>
                            <button className="btn btn-sm btn-icon">
                              <i className="bi bi-heart"></i>
                            </button>
                          </div>
                          <h5 className="card-title mb-3">{c.nom}</h5>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                              <i className="bi bi-file-earmark me-1"></i>{c.type_ressource}
                            </span>
                            <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                              <i className="bi bi-globe me-1"></i>{c.langue}
                            </span>
                          </div>
                        </div>
                        
                        <div className="card-footer border-top d-flex justify-content-between align-items-center py-3" style={{background: "var(--white)"}}>
                          <button className="btn btn-sm" style={{color: "var(--text-dark)"}}>
                            <i className="bi bi-info-circle me-1"></i>Détails
                          </button>
                          <Link to={`/DetailCours/${c.id_cours}`} className="btn btn-sm" style={{
                            background: "var(--primary-color)",
                            color: "var(--white)"
                          }}>
                            <i className="bi bi-play-fill me-1"></i>Commencer
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-5 d-flex justify-content-center">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {[...Array(totalPages).keys()].map(number => (
                        <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(number + 1)}
                            style={currentPage === number + 1 ? {background: "var(--primary-color)", borderColor: "var(--primary-color)"} : {}}
                          >
                            {number + 1}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
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
      
      {/* CSS personnalisé */}
      <style jsx>{`
        .shadow-hover {
          transition: var(--transition-speed);
        }
        .shadow-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1)!important;
        }
        .btn-icon {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--text-light);
          background: var(--accent-bg);
        }
        .btn-icon:hover {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
        }
        .pagination .page-link {
          color: var(--text-dark);
          border-radius: 4px;
          margin: 0 3px;
        }
        .pagination .page-item.active .page-link {
          color: var(--white);
        }
        .pagination .page-link:focus {
          box-shadow: 0 0 0 0.25rem rgba(var(--primary-color-rgb), 0.25);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;