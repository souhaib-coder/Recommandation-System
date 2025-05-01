import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './navbars/AdminNavbar';
import UserNavbar from './navbars/UserNavbar';
import { getDashboardData, getFavorites, toggleFavorite } from '../api/api';

const Favoris = () => {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

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

  // Fonction pour basculer le statut favori
  const handleToggleFavorite = async (coursId) => {
    try {
      await toggleFavorite(coursId);
      // Mettre à jour l'état local après la bascule
      setFavoris(prevFavoris => {
        // Retirer le cours de la liste des favoris
        return prevFavoris.filter(cours => cours.cours_id !== coursId);
      });
    } catch (err) {
      console.error('Erreur lors de la modification du favori:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Utiliser la fonction getFavorites de l'API
        const favsData = await getFavorites();
        setFavoris(favsData);
        
        // Vérifier si l'utilisateur est admin
        const userData = await getDashboardData();
        setIsAdmin(userData.admin);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError("Impossible de charger les favoris.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="education-dashboard" style={{ background: "var(--light-bg)" }}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar onSearch={(value) => {
        setSearch(value);
      }} />}

      {/* Hero Section */}
      <div className="hero-section text-white position-relative d-flex align-items-center" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "160px",
        marginTop: "66px", // correspond à la navbar
        padding: "2rem 0",
      }}>
        <div className="container text-center" style={{ zIndex: 2 }}>
          <h1 className="fw-bold display-6 mb-2" style={{ letterSpacing: "-0.5px" }}>
            <i className="bi bi-heart-fill me-2 text-white" style={{ opacity: 0.85 }}></i>
            Vos favoris, en un clic
          </h1>
          <p className="lead" style={{ opacity: 0.85 }}>Tous les cours que vous aimez à portée de main.</p>
        </div>

        <div className="position-absolute bottom-0 start-0 w-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" style={{ display: "block" }}>
            <path fill="var(--light-bg)" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100H0Z"></path>
          </svg>
        </div>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "var(--primary-color)" }} role="status" />
            <div className="mt-3 fw-medium">Chargement des favoris...</div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : favoris.length === 0 ? (
          <div className="card text-center p-5 shadow-sm border-0" style={{ borderRadius: "var(--border-radius-sm)" }}>
            <h4>Aucun favori pour l'instant</h4>
            <p className="text-muted">Ajoutez des cours à vos favoris pour les retrouver ici.</p>
            <Link to="/Dashboard" className="btn btn-outline-primary mt-3">
              <i className="bi bi-arrow-left-circle me-2"></i>Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favoris.map((c) => (
              <div className="col-md-6 col-lg-4" key={c.id_favoris}>
                <div className="card h-100 border-0 shadow-sm shadow-hover overflow-hidden" style={{ borderRadius: "var(--border-radius-sm)" }}>
                  <div className="position-relative">
                    <div className="card-img-top bg-light" style={{ height: "140px", background: "var(--accent-bg)" }}>
                      <div className="h-100 d-flex align-items-center justify-content-center">
                        <i className={`${getDomaineIcon(c.domaine)} display-4`} style={{ color: "var(--primary-color)" }}></i>
                      </div>
                    </div>
                    <div className="position-absolute" style={{ top: "15px", right: "15px" }}>
                      <span className={`badge ${getNiveauBadgeClass(c.niveau)}`}>{c.niveau}</span>
                    </div>
                    <div className="position-absolute" style={{ top: "15px", left: "15px" }}>
                      <span className="badge" style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>
                        <i className="bi bi-calendar me-1"></i>
                        {c.date_ajout ? (
                          // Simplifier pour éviter les erreurs de parsing
                          c.date_ajout.split(' ')[0]  // Prend juste la partie date
                        ) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge" style={{ background: "var(--accent-bg)", color: "var(--text-dark)" }}>{c.domaine}</span>
                      <button 
                        className="btn 'btn-warning shadow-sm btn-sm" 
                        onClick={() => handleToggleFavorite(c.cours_id)}
                        style={{ background:"rgb(255, 202, 44)", borderRadius: "var(--border-radius-sm)",
                            transition: "all 0.3s ease"}}
                      >
                        <i className="bi bi-bookmark-fill" style={{ color: "black" }}></i>
                      </button>
                    </div>
                    <h5 className="card-title mb-3">{c.nom}</h5>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="badge" style={{ background: "var(--accent-bg)", color: "var(--text-dark)" }}>
                        <i className="bi bi-file-earmark me-1"></i>{c.type_ressource}
                      </span>
                      <span className="badge" style={{ background: "var(--accent-bg)", color: "var(--text-dark)" }}>
                        <i className="bi bi-globe me-1"></i>{c.langue}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer border-top d-flex justify-content-between align-items-center py-3" style={{ background: "var(--white)" }}>
                    <Link to={`/DetailCours/${c.cours_id}`} className="btn btn-sm" style={{ color: "var(--text-dark)" }}>
                      <i className="bi bi-info-circle me-1"></i>Détails
                    </Link>
                    <Link
                      to={`/DetailCours/${c.cours_id}`}
                      className="btn btn-sm"
                      style={{ background: "var(--primary-color)", color: "var(--white)" }}
                    >
                      <i className="bi bi-play-fill me-1"></i>Commencer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Styles personnalisés */}
      <style>{`
        .shadow-hover {
          transition: var(--transition-speed);
        }
        .shadow-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1)!important;
        }
      `}</style>
    </div>
  );
};

export default Favoris;