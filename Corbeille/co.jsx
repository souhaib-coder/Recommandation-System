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

export default Dashboard;// 


import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/user/dashboard");
  const [hoverIndex, setHoverIndex] = useState(null);
  const hoverRef = useRef(null);
  const indicatorRef = useRef(null);
  
  // Définir les éléments de navigation
  const navItems = [
    { to: "/user/dashboard", label: "Dashboard", icon: "speedometer2" },
    { to: "/user/favorites", label: "Favoris", icon: "heart-fill" },
    { to: "/user/history", label: "Historique", icon: "clock-history" },
    { to: "/user/profile", label: "Profil", icon: "person-circle" },
  ];

  // Suivre le défilement pour l'effet de navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // Détecter les changements de route et définir l'élément actif
  useEffect(() => {
    const currentPath = window.location.pathname;
    const matchingItem = navItems.find(item => currentPath.includes(item.to));
    if (matchingItem) {
      setActiveLink(matchingItem.to);
    }
  }, [navItems]);

  // Gérer les animations d'indicateur au survol
  useEffect(() => {
    if (hoverIndex !== null && hoverRef.current && indicatorRef.current) {
      const element = hoverRef.current.children[hoverIndex];
      const { width, left } = element.getBoundingClientRect();
      const navLeft = hoverRef.current.getBoundingClientRect().left;
      
      indicatorRef.current.style.width = `${width}px`;
      indicatorRef.current.style.left = `${left - navLeft}px`;
      indicatorRef.current.style.opacity = '1';
    } else if (indicatorRef.current) {
      indicatorRef.current.style.opacity = '0';
    }
  }, [hoverIndex]);

  // Mettre à jour la classe Navbar en fonction du défilement
  const navClass = `navbar fixed-top navbar-expand-lg py-3 ${
    scrolled ? "navbar-scrolled" : "navbar-default"
  }`;

  return (
    <>
      <nav className={navClass}>
        <div className="container-fluid">
          {/* Logo animé */}
          <Link className="navbar-brand" to="/">
            <div className="logo-container">
              <div className="logo-icon">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div className="logo-text">DevStorm</div>
            </div>
          </Link>
          
          {/* Bouton hamburger avec animation */}
          <button
            className={`navbar-toggler hamburger-button ${navbarOpen ? 'active' : ''}`}
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          {/* Menu de navigation */}
          <div className={`collapse navbar-collapse ${navbarOpen ? "show" : ""}`}>
            {/* Recherche rapide */}
            <div className="nav-search-wrapper me-auto ms-lg-4">
              <div className="nav-search">
                <i className="bi bi-search search-icon"></i>
                <input type="text" placeholder="Rechercher un cours..." className="search-input" />
              </div>
            </div>
            
            {/* Liens de navigation avec indicateur interactif */}
            <ul className="navbar-nav nav-links ms-auto align-items-center" ref={hoverRef}>
              <div className="nav-indicator" ref={indicatorRef}></div>
              {navItems.map((item, i) => (
                <li 
                  className="nav-item"
                  key={i}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <Link 
                    className={`nav-link ${activeLink === item.to ? 'active' : ''}`} 
                    to={item.to}
                    onClick={() => setActiveLink(item.to)}
                  >
                    <div className="nav-icon">
                      <i className={`bi bi-${item.icon}`}></i>
                    </div>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Bouton notifications et profil */}
            <div className="nav-actions ms-3">
              <button className="btn btn-icon notification-btn position-relative">
                <i className="bi bi-bell-fill"></i>
                <span className="notification-badge">3</span>
                <span className="notification-pulse"></span>
              </button>
              
              <div className="vertical-divider"></div>
              
              <Link className="btn btn-primary rounded-pill logout-btn" to="/logout">
                <span className="d-none d-md-inline me-2">Déconnexion</span>
                <i className="bi bi-box-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        /* Styles de base de la navbar */
        .navbar {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding-top: 1rem;
          padding-bottom: 1rem;
          z-index: 1030;
        }
        
        .navbar-default {
          background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);
          backdrop-filter: blur(8px);
        }
        
        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
        }
        
        /* Logo animé */
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo-icon {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          box-shadow: 0 5px 15px rgba(71, 118, 230, 0.3);
          transform-origin: center;
          transition: all 0.3s ease;
        }
        
        .navbar-brand:hover .logo-icon {
          transform: rotate(15deg) scale(1.1);
        }
        
        .logo-text {
          font-weight: 800;
          margin-left: 10px;
          font-size: 1.3rem;
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }
        
        .navbar-default .logo-text {
          color: white;
          -webkit-text-fill-color: white;
        }
        
        /* Champ de recherche */
        .nav-search-wrapper {
          max-width: 300px;
          width: 100%;
        }
        
        .nav-search {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        
        .navbar-scrolled .nav-search {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .nav-search:focus-within {
          background: white;
          border-color: rgba(71, 118, 230, 0.5);
          box-shadow: 0 0 0 4px rgba(71, 118, 230, 0.15);
        }
        
        .search-icon {
          color: #4776E6;
          margin-right: 8px;
        }
        
        .search-input {
          background: transparent;
          border: none;
          outline: none;
          flex-grow: 1;
          color: #333;
          font-size: 14px;
        }
        
        .navbar-default .search-input {
          color: white;
        }
        
        .navbar-scrolled .search-input {
          color: #333;
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .navbar-scrolled .search-input::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        
        /* Navigation avec indicateur de survol */
        .nav-links {
          position: relative;
          display: flex;
          margin: 0 15px;
        }
        
        .nav-indicator {
          position: absolute;
          bottom: -5px;
          height: 3px;
          border-radius: 3px;
          background: linear-gradient(90deg, #4776E6, #8E54E9);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }
        
        .nav-item {
          position: relative;
          margin: 0 10px;
        }
        
        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 15px;
          transition: all 0.3s ease;
          position: relative;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .navbar-scrolled .nav-link {
          color: rgba(0, 0, 0, 0.7);
        }
        
        .nav-link.active, .nav-link:hover {
          color: #4776E6;
        }
        
        .nav-icon {
          font-size: 1.2rem;
          margin-bottom: 3px;
          transition: all 0.3s ease;
        }
        
        .nav-link:hover .nav-icon {
          transform: translateY(-3px);
        }
        
        .nav-label {
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Bouton hamburger animé */
        .hamburger-button {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 8px;
        }
        
        .hamburger-line {
          width: 100%;
          height: 2px;
          background-color: white;
          border-radius: 10px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        
        .navbar-scrolled .hamburger-line {
          background-color: #333;
        }
        
        .hamburger-button.active .hamburger-line:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        
        .hamburger-button.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger-button.active .hamburger-line:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }
        
        /* Boutons d'action */
        .nav-actions {
          display: flex;
          align-items: center;
        }
        
        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .navbar-scrolled .btn-icon {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }
        
        .btn-icon:hover {
          background: rgba(71, 118, 230, 0.1);
          color: #4776E6;
          transform: translateY(-2px);
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FF5757;
          color: white;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid var(--bs-body-bg);
        }
        
        .notification-pulse {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #FF5757;
          z-index: -1;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 87, 87, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 87, 87, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 87, 87, 0);
          }
        }
        
        .vertical-divider {
          width: 1px;
          height: 25px;
          background: rgba(255, 255, 255, 0.2);
          margin: 0 15px;
        }
        
        .navbar-scrolled .vertical-divider {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          border: none;
          padding: 0.5rem 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(71, 118, 230, 0.2);
        }
        
        .logout-btn:hover {
          box-shadow: 0 8px 20px rgba(71, 118, 230, 0.4);
          transform: translateY(-2px);
        }
        
        /* Responsive */
        @media (max-width: 992px) {
          .navbar-default, .navbar-scrolled {
            background: white;
          }
          
          .navbar-collapse {
            background: white;
            border-radius: 10px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-top: 15px;
          }
          
          .navbar-default .nav-link,
          .navbar-default .search-input,
          .navbar-default .btn-icon {
            color: #333;
          }
          
          .navbar-default .search-input::placeholder {
            color: rgba(0, 0, 0, 0.5);
          }
          
          .navbar-default .hamburger-line {
            background-color: #333;
          }
          
          .navbar-default .logo-text {
            -webkit-text-fill-color: transparent;
          }
          
          .nav-links {
            flex-direction: column;
            width: 100%;
            margin: 15px 0;
          }
          
          .nav-item {
            width: 100%;
            margin: 5px 0;
          }
          
          .nav-link {
            flex-direction: row;
            justify-content: flex-start;
            padding: 12px 15px;
            border-radius: 8px;
          }
          
          .nav-link:hover {
            background: rgba(71, 118, 230, 0.1);
          }
          
          .nav-icon {
            margin-right: 15px;
            margin-bottom: 0;
          }
          
          .nav-indicator {
            display: none;
          }
          
          .nav-search-wrapper {
            max-width: none;
            margin-bottom: 15px;
          }
          
          .nav-actions {
            width: 100%;
            justify-content: space-between;
            margin-top: 15px;
          }
          
          .vertical-divider {
            display: none;
          }
          
          .logout-btn {
            width: 100%;
            margin-top: 15px;
          }
        }
        
        /* Animation de chargement pour la navbar */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .navbar {
          animation: fadeInDown 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default UserNavbar;




