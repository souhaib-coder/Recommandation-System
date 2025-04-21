import React, { useEffect, useState } from "react";
import { getDashboardData, searchCours } from "../api/api";
import AdminNavbar from "./navbars/AdminNavbar";
import UserNavbar from "./navbars/UserNavbar";
import { Link } from "react-router-dom";


const Dashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [favoris, setFavoris] = useState([]);
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour les filtres de recherche
  const [search, setSearch] = useState("");
  const [domaine, setDomaine] = useState("");
  const [type, setType] = useState("");
  const [niveau, setNiveau] = useState("");

  const fetchRecommandations = (filters = {}) => {
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) cleanFilters[key] = filters[key];
    });
  
    setLoading(true);
    searchCours(cleanFilters)
      .then((data) => {
        setRecommandations(data);
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
        setFavoris(data.favoris);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du dashboard:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard(); // favoris, admin
    fetchRecommandations();
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecommandations({
      search,
      domaine,
      type_ressource: type,
      niveau,
    });
  };
  
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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
      <div className="spinner-grow" style={{color: "var(--primary-color)"}} role="status"></div>
      <div className="fw-bold">Chargement de votre espace d'apprentissage...</div>
    </div>
  );

  return (
    <div className="education-dashboard" style={{background: "var(--light-bg)"}}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      <br /><br />
      {/* Hero Banner */}
      <div className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "300px",
        marginTop: "70px",
        padding: "3rem 0"
      }}>
        <div className="container position-relative" style={{zIndex: "2"}}>
          <div className="row align-items-center">
            <div className="col-lg-7 py-5">
              <h1 className="display-4 fw-bold mb-3">Explorez le monde du savoir</h1>
              <p className="lead mb-4 opacity-90">Accédez à des milliers de ressources éducatives provenant du monde entier.</p>
              
              {/* Search Form */}
              <form className="search-form mt-4" onSubmit={handleSearch}>
                <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden" style={{borderRadius: "var(--border-radius-lg)"}}>
                  <input 
                    type="text" 
                    className="form-control border-0 py-3" 
                    style={{background: "var(--input-bg)"}}
                    placeholder="Rechercher un cours, un sujet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn px-4" style={{background: "var(--white)", color: "var(--primary-color)"}} type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="p-4 rounded-3 text-center" style={{background: "rgba(255, 255, 255, 0.1)", borderRadius: "var(--border-radius-sm)"}}>
                <div className="display-6 mb-2">
                  <i className="bi bi-mortarboard-fill"></i>
                </div>
                <h5 className="mb-3">Continuez votre apprentissage</h5>
                {favoris.length > 0 ? (
                  <p className="mb-0">Vous avez {favoris.length} cours en favoris</p>
                ) : (
                  <p className="mb-0">Découvrez des cours qui vous passionnent</p>
                )}
              </div>
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
        {/* Advanced Filters */}
        <div className="card shadow-sm mb-5 border-0" style={{borderRadius: "var(--border-radius-sm)", boxShadow: "var(--shadow)"}}>
          <div className="card-body p-4">
            <h5 className="mb-3"><i className="bi bi-funnel-fill me-2" style={{color: "var(--primary-color)"}}></i>Filtres avancés</h5>
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Domaine</label>
                  <select className="form-select" style={{borderRadius: "var(--border-radius-sm)", background: "var(--input-bg)"}} value={domaine} onChange={(e) => setDomaine(e.target.value)}>
                    <option value="">Tous les domaines</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Chimie">Chimie</option>
                    <option value="Langues">Langues</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Type de ressource</label>
                  <select className="form-select" style={{borderRadius: "var(--border-radius-sm)", background: "var(--input-bg)"}} value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">Tous les types</option>
                    <option value="Tutoriel">Tutoriel</option>
                    <option value="Cours">Cours</option>
                    <option value="Livre">Livre</option>
                    <option value="TD">TD</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Niveau</label>
                  <select className="form-select" style={{borderRadius: "var(--border-radius-sm)", background: "var(--input-bg)"}} value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                    <option value="">Tous les niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn px-4" style={{
                    background: "var(--primary-color)",
                    color: "var(--white)",
                    borderRadius: "var(--border-radius-lg)"
                  }}>
                    Appliquer les filtres
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="row g-4">
          {/* Left Column (Favoris) */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100" style={{borderRadius: "var(--border-radius-sm)", boxShadow: "var(--shadow)"}}>
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0">
                  <i className="bi bi-heart-fill text-danger me-2"></i>
                  Mes cours favoris
                </h5>
              </div>
              <div className="card-body p-0">
                {favoris.length === 0 ? (
                  <div className="text-center p-5">
                    <div className="display-3 mb-3" style={{color: "var(--text-light)"}}>
                      <i className="bi bi-heart"></i>
                    </div>
                    <p style={{color: "var(--text-light)"}} className="mb-4">Vous n'avez pas encore de cours favoris.</p>
                    <button className="btn" style={{
                      borderRadius: "var(--border-radius-lg)",
                      color: "var(--primary-color)",
                      borderColor: "var(--primary-color)"
                    }}>
                      Découvrir des cours
                    </button>
                  </div>
                ) : (
                  <div className="favoris-list">
                    {favoris.map((c, index) => (
                      <div key={c.id_cours} className={`p-3 d-flex align-items-center ${index < favoris.length-1 ? 'border-bottom' : ''}`}>
                        <div className="me-3 icon-wrapper rounded-circle d-flex align-items-center justify-content-center" style={{
                          width: "48px", 
                          height: "48px", 
                          backgroundColor: "var(--accent-bg)"
                        }}>
                          <i className={`${getDomaineIcon(c.domaine)} fs-5`} style={{color: "var(--primary-color)"}}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1" style={{color: "var(--text-dark)"}}>{c.nom}</h6>
                          <div className="d-flex align-items-center">
                            <span className={`badge ${getNiveauBadgeClass(c.niveau)} me-2`}>{c.niveau}</span>
                            <small style={{color: "var(--text-light)"}}>{c.type_ressource} • {c.langue}</small>
                          </div>
                        </div>
                        <div>
                          <button className="btn btn-sm btn-light rounded-circle">
                            <i className="bi bi-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column (Recommendations) */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0" style={{borderRadius: "var(--border-radius-sm)", boxShadow: "var(--shadow)"}}>
              <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center" style={{background: "var(--white)"}}>
                <h5 className="m-0">
                  <i className="bi bi-stars text-warning me-2"></i>
                  {search || domaine || type || niveau ? "Résultats de recherche" : "Recommandations pour vous"}
                </h5>
                <span className="badge rounded-pill" style={{background: "var(--primary-color)", color: "var(--white)"}}>{recommandations.length} cours</span>
              </div>
              <div className="card-body">
                {recommandations.length === 0 ? (
                  <div className="text-center p-5">
                    <div className="display-3 mb-3" style={{color: "var(--text-light)"}}>
                      <i className="bi bi-search"></i>
                    </div>
                    <p style={{color: "var(--text-light)"}}>Aucun résultat trouvé pour votre recherche.</p>
                    <button className="btn" style={{
                      borderRadius: "var(--border-radius-lg)",
                      color: "var(--primary-color)",
                      borderColor: "var(--primary-color)"
                    }} onClick={() => {
                      setSearch("");
                      setDomaine("");
                      setType("");
                      setNiveau("");
                      fetchRecommandations({});
                    }}>
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    {recommandations.map((c) => (
                      <div className="col-md-6" key={c.id_cours}>
                        <div className="card h-100 border shadow-hover position-relative" style={{transition: "var(--transition-speed)"}}>
                          <div className="ribbon-wrapper position-absolute" style={{top: "12px", right: "12px"}}>
                            <span className={`badge ${getNiveauBadgeClass(c.niveau)}`}>
                              {c.niveau}
                            </span>
                          </div>
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <div className="icon-wrapper rounded-circle d-flex align-items-center justify-content-center me-3" style={{
                                width: "40px", 
                                height: "40px", 
                                backgroundColor: "var(--accent-bg)"
                              }}>
                                <i className={`${getDomaineIcon(c.domaine)}`} style={{color: "var(--primary-color)"}}></i>
                              </div>
                              <div>
                                <span style={{color: "var(--text-light)"}} className="small">{c.domaine}</span>
                                <h6 className="fw-bold mb-0" style={{color: "var(--text-dark)"}}>{c.nom}</h6>
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <span className="badge me-2" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                                  <i className="bi bi-file-earmark me-1"></i>{c.type_ressource}
                                </span>
                                <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                                  <i className="bi bi-globe me-1"></i>{c.langue}
                                </span>
                              </div>
                              <span className="small" style={{color: "var(--text-light)"}}>
                                <i className="bi bi-eye me-1"></i>{c.nombre_vues} vues
                              </span>
                            </div>
                          </div>
                          <div className="card-footer border-top d-flex justify-content-between align-items-center" style={{background: "var(--white)"}}>
                            <button className="btn btn-sm" style={{
                              color: "var(--text-dark)",
                              borderColor: "var(--text-light)"
                            }}>
                              <i className="bi bi-bookmark-plus me-1"></i>Sauvegarder
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
                )}
              </div>
            </div>
            
            {/* Statistiques d'apprentissage */}
            <div className="card shadow-sm border-0 mt-4" style={{borderRadius: "var(--border-radius-sm)", boxShadow: "var(--shadow)"}}>
              <div className="card-body">
                <h5 className="mb-4">
                  <i className="bi bi-bar-chart-line-fill me-2" style={{color: "var(--primary-color)"}}></i>
                  Votre progression
                </h5>
                <div className="row g-4 text-center">
                  {[
                    { icon: "bi-journals", label: "Cours complétés", value: "0" },
                    { icon: "bi-clock-history", label: "Heures d'apprentissage", value: "0" },
                    { icon: "bi-award", label: "Certificats", value: "0" },
                    { icon: "bi-lightning-charge", label: "Jours consécutifs", value: "1" }
                  ].map((stat, index) => (
                    <div className="col-6 col-md-3" key={index}>
                      <div className="py-3">
                        <div className="display-6 mb-2">
                          <i className={`${stat.icon}`} style={{color: "var(--primary-color)"}}></i>
                        </div>
                        <h2 className="fw-bold mb-0">{stat.value}</h2>
                        <small style={{color: "var(--text-light)"}}>{stat.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      
      {/* CSS personnalisé */}
      <style jsx>{`
        .shadow-hover {
          transition: var(--transition-speed);
        }
        .shadow-hover:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow)!important;
        }
        .transition-navbar {
          transition: var(--transition-speed);
        }
        .navbar-default {
          background-color: transparent;
        }
        .navbar-scrolled {
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;