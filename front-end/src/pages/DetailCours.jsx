import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCourseDetails,
  toggleFavorite,
  deleteCourse,
  submitReview,
} from "../api/api";
import AdminNavbar from "./navbars/AdminNavbar";
import UserNavbar from "./navbars/UserNavbar";

const DetailCours = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [avisList, setAvisList] = useState([]);
  const [formData, setFormData] = useState({ note: "", commentaire: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCourseDetails(id);
        setCourse(data.cours);
        setIsFavorite(data.cours.est_favori);
        setAvisList(data.avis || []);
        setAdmin(data.admin || false);
        setIsAdmin(data.admin || false);
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error);
        if (error.response?.status === 401) {
          setError("Vous devez être connecté pour accéder à ce cours");
          // Rediriger vers la page de connexion après un court délai
          setTimeout(() => navigate("/connexion"), 2000);
        } else {
          setError("Impossible de charger les détails du cours");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id, navigate]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(id);
      setIsFavorite(!isFavorite);
      setMessage(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError("Erreur lors de la modification des favoris");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      try {
        await deleteCourse(id);
        navigate("/dashboard");
      } catch (error) {
        setError("Erreur lors de la suppression du cours");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await submitReview(id, formData);
      setMessage("Avis soumis avec succès !");
      setAvisList((prev) => [...prev, res]);
      setFormData({ note: "", commentaire: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError("Erreur lors de la soumission de l'avis");
      setTimeout(() => setError(""), 3000);
    }
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
    <div className="education-dashboard" style={{background: "var(--light-bg)"}}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh", marginTop: "70px"}}>
        <div className="spinner-grow" style={{color: "var(--primary-color)"}} role="status"></div>
        <div className="fw-bold ms-3">Chargement des détails du cours...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="education-dashboard" style={{background: "var(--light-bg)"}}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      <div className="container py-5" style={{marginTop: "70px"}}>
        <div className="alert alert-danger shadow-sm rounded-lg" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
        <Link to="/dashboard" className="btn" style={{
          background: "var(--primary-color)",
          color: "var(--white)",
          borderRadius: "var(--border-radius-lg)"
        }}>
          <i className="bi bi-speedometer2 me-2"></i> Retour au Dashboard
        </Link>
      </div>
    </div>
  );

  if (!course) return (
    <div className="education-dashboard" style={{background: "var(--light-bg)"}}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      <div className="container py-5" style={{marginTop: "70px"}}>
        <div className="alert alert-warning shadow-sm rounded-lg" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Aucun cours trouvé avec cet identifiant.
        </div>
        <Link to="/dashboard" className="btn" style={{
          background: "var(--primary-color)",
          color: "var(--white)",
          borderRadius: "var(--border-radius-lg)"
        }}>
          <i className="bi bi-speedometer2 me-2"></i> Retour au Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="education-dashboard" style={{background: "var(--light-bg)"}}>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      
      {/* Hero Banner */}
      <div className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "250px",
        marginTop: "70px",
        padding: "3rem 0"
      }}>
        <div className="container position-relative" style={{zIndex: "2"}}>
          <div className="row align-items-center">
            <div className="col-lg-12 py-4">
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${getNiveauBadgeClass(course.niveau)} me-2`}>{course.niveau}</span>
                <span className="badge" style={{background: "rgba(255,255,255,0.2)"}}>{course.domaine}</span>
                <div className="ms-auto">
                  <span className="badge" style={{background: "rgba(255,255,255,0.2)"}}>
                    <i className="bi bi-eye me-1"></i> {course.nombre_vues} vues
                  </span>
                </div>
              </div>
              <h1 className="display-5 fw-bold mb-3">{course.nom}</h1>
              <p className="lead mb-0 opacity-90">{course.type_ressource} • {course.langue}</p>
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
          <div className="alert alert-success alert-dismissible fade show shadow-sm rounded-lg mb-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
          </div>
        )}
        
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Course Content Section */}
            <div className="card border-0 shadow-sm rounded-lg mb-4 overflow-hidden">
              <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-play-circle me-2" style={{color: "var(--primary-color)"}}></i>
                  Contenu du cours
                </h5>
              </div>
              <div className="card-body p-0">
                {course.chemin_source?.endsWith(".mp4") ? (
                  <video className="w-100" controls>
                    <source src={`${process.env.PUBLIC_URL}/static/${course.chemin_source}`} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                ) : course.chemin_source?.endsWith(".pdf") ? (
                  <div className="ratio ratio-16x9" style={{ minHeight: "600px" }}>
                    <iframe
                      className="w-100"
                      src={`http://localhost:5000/static/${course.chemin_source}`}
                      title="PDF du cours"
                    ></iframe>
                  </div>
                ) : (
                  <div className="p-5 text-center text-muted">
                    <i className="bi bi-file-earmark-text display-4 mb-3"></i>
                    <p>Aucun contenu multimédia disponible pour ce cours.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Objectives Section */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-bullseye me-2" style={{color: "var(--primary-color)"}}></i>
                  Objectif du cours
                </h5>
              </div>
              <div className="card-body">
                <p className="lead mb-0">{course.objectifs}</p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-chat-quote me-2" style={{color: "var(--primary-color)"}}></i>
                  Avis des utilisateurs
                </h5>
                <span className="badge rounded-pill" style={{background: "var(--primary-color)", color: "var(--white)"}}>
                  {avisList.length} {avisList.length > 1 ? "avis" : "avis"}
                </span>
              </div>
              <div className="card-body p-4">
                {avisList.length > 0 ? (
                  <div className="reviews-list">
                    {avisList.map((avis, i) => (
                      <div key={i} className={`review-item p-3 ${i !== avisList.length - 1 ? "border-bottom" : ""}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="stars">
                            {[...Array(5)].map((_, index) => (
                              <i key={index} className={`bi bi-star-fill ${index < avis.note ? "text-warning" : "text-muted"}`}></i>
                            ))}
                            <span className="ms-2 fw-bold">{avis.note}/5</span>
                          </div>
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i> {avis.date}
                          </small>
                        </div>
                        <p className="mb-0">{avis.commentaire}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-dots display-5 text-muted mb-3"></i>
                    <p className="text-muted">Aucun avis pour ce cours. Soyez le premier à donner votre opinion !</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Review Form */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-pencil-square me-2" style={{color: "var(--primary-color)"}}></i>
                  Donnez votre avis
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Note</label>
                    <div className="rating-select d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button 
                          key={n} 
                          type="button"
                          className={`btn ${formData.note == n ? 'btn-warning' : 'btn-outline-warning'}`}
                          style={{borderRadius: "var(--border-radius-sm)"}}
                          onClick={() => setFormData({ ...formData, note: n })}
                        >
                          {n} <i className="bi bi-star-fill ms-1"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Commentaire</label>
                    <textarea
                      className="form-control"
                      style={{
                        borderRadius: "var(--border-radius-sm)",
                        background: "var(--input-bg)"
                      }}
                      rows="4"
                      placeholder="Partagez votre expérience avec ce cours..."
                      value={formData.commentaire}
                      onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn py-2"
                      style={{
                        background: "var(--primary-color)",
                        color: "var(--white)",
                        borderRadius: "var(--border-radius-lg)"
                      }}
                    >
                      <i className="bi bi-send me-2"></i> Soumettre mon avis
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="col-lg-4">
            {/* Actions Card */}
            <div className="card border-0 shadow-sm rounded-lg mb-4 sticky-top" style={{
              borderRadius: "var(--border-radius-sm)",
              top: "100px"
            }}>
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-gear me-2" style={{color: "var(--primary-color)"}}></i>
                  Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-3">
                  <button
                    className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
                    style={{borderRadius: "var(--border-radius-lg)"}}
                    onClick={handleToggleFavorite}
                  >
                    <i className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'} me-2`}></i>
                    {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </button>
                  
                  <Link to="/dashboard" className="btn btn-outline-primary" style={{borderRadius: "var(--border-radius-lg)"}}>
                    <i className="bi bi-speedometer2 me-2"></i> Tableau de bord
                  </Link>
                  
                  {admin && (
                    <>
                      <Link to={`/admin/modifier/${course.id_cours}`} className="btn btn-outline-success" style={{borderRadius: "var(--border-radius-lg)"}}>
                        <i className="bi bi-pencil me-2"></i> Modifier le cours
                      </Link>
                      <button onClick={handleDelete} className="btn btn-outline-danger" style={{borderRadius: "var(--border-radius-lg)"}}>
                        <i className="bi bi-trash me-2"></i> Supprimer le cours
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Course Info Card */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-info-circle me-2" style={{color: "var(--primary-color)"}}></i>
                  Informations
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {[
                    { icon: "bi-tag", label: "Domaine", value: course.domaine },
                    { icon: "bi-file-earmark", label: "Type", value: course.type_ressource },
                    { icon: "bi-bar-chart", label: "Niveau", value: course.niveau },
                    { icon: "bi-globe", label: "Langue", value: course.langue },
                    { icon: "bi-eye", label: "Vues", value: course.nombre_vues }
                  ].map((item, index) => (
                    <li key={index} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-bottom">
                      <div>
                        <i className={`${item.icon} me-2`} style={{color: "var(--primary-color)"}}></i>
                        {item.label}
                      </div>
                      <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Share Card */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-share me-2" style={{color: "var(--primary-color)"}}></i>
                  Partager
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  {[
                    { icon: "bi-facebook", color: "#1877f2" },
                    { icon: "bi-twitter", color: "#1da1f2" },
                    { icon: "bi-linkedin", color: "#0077b5" },
                    { icon: "bi-envelope", color: "#ea4335" },
                    { icon: "bi-link-45deg", color: "#6c757d" }
                  ].map((item, index) => (
                    <button 
                      key={index} 
                      className="btn btn-icon"
                      style={{width: "40px", height: "40px", borderRadius: "50%", color: item.color, background: `rgba(${parseInt(item.color.slice(1, 3), 16)}, ${parseInt(item.color.slice(3, 5), 16)}, ${parseInt(item.color.slice(5, 7), 16)}, 0.1)`}}
                    >
                      <i className={item.icon}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between mb-5">
          <Link to="/dashboard" className="btn btn-outline-primary" style={{borderRadius: "var(--border-radius-lg)"}}>
            <i className="bi bi-arrow-left me-2"></i> Retour au dashboard
          </Link>
          <a href="#top" className="btn" style={{
            width: "40px", 
            height: "40px", 
            borderRadius: "50%",
            background: "var(--white)",
            boxShadow: "var(--shadow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <i className="bi bi-arrow-up"></i>
          </a>
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
        .reviews-list .review-item:last-child {
          border-bottom: none !important;
        }
        .card {
          transition: var(--transition-speed);
        }
      `}</style>
    </div>
  );
};

export default DetailCours;