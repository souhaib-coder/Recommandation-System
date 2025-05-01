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
  const [formData, setFormData] = useState({
    note: 5, // Default to 5 stars
    commentaire: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  
  
  // Handle form submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await submitReview(id, formData);
      setMessage(response.message || "Avis soumis avec succès !");
        
      // Créer un nouvel avis avec les données du formulaire et la date actuelle
      const today = new Date();
      const formattedDate = today.toLocaleDateString('fr-FR');
      
      const newReview = {
        id: response.id || Date.now(),
        utilisateur: "Vous", // Assumer que c'est l'utilisateur actuel
        note: formData.note,
        commentaire: formData.commentaire,
        date: formattedDate
      };
      
      // Mettre à jour la liste des avis et assurer qu'elle est affichée
      setAvisList(prev => [...prev, newReview]);
      setShowReviews(true); // Forcer l'affichage des avis
      
      setFormData({ note: 5, commentaire: "" });
      setShowReviewForm(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(error.response?.data?.errors || "Erreur lors de la soumission de l'avis");
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


  // Fonction pour extraire l'ID de la vidéo YouTube depuis l'URL
  const getYoutubeVideoId = (url) => {
    if (!url) return '';
    
    // Pour les URLs de format https://youtu.be/VIDEO_ID
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
    
    // Pour les URLs de format https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v');
    }
    
    return '';
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
        <Link to="/Dashboard" className="btn" style={{
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
      
      {/* Hero Banner with Course Info */}
      <div className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "280px",
        marginTop: "70px",
        padding: "2rem 0"
      }}>
        <div className="container position-relative" style={{zIndex: "2"}}>
          <div className="row align-items-center">
            <div className="col-lg-8 py-3">
              <div className="d-flex align-items-center mb-2">
                <span className={`badge ${getNiveauBadgeClass(course.niveau)} me-2`}>{course.niveau}</span>
                <span className="badge me-2" style={{background: "rgba(255,255,255,0.2)"}}>{course.domaine}</span>
                <span className="badge me-2" style={{background: "rgba(255,255,255,0.2)"}}>{course.type_ressource}</span>
                <span className="badge me-2" style={{background: "rgba(255,255,255,0.2)"}}>{course.langue}</span>
                <span className="badge" style={{background: "rgba(255,255,255,0.2)"}}>
                  <i className="bi bi-eye me-1"></i> {course.nombre_vues} vues
                </span>
              </div>
              <h1 className="display-5 fw-bold mb-3">{course.nom}</h1>
              
              {/* Admin Actions */}
              {admin && (
                <div className="mt-3">
                  <div className="btn-group">
                    <Link to={`/admin/modifier/${course.id_cours}`} className="btn btn-light" style={{borderRadius: "var(--border-radius-lg) 0 0 var(--border-radius-lg)"}}>
                      <i className="bi bi-pencil me-2 text-success"></i> Modifier
                    </Link>
                    <button onClick={handleDelete} className="btn btn-light" style={{borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0"}}>
                      <i className="bi bi-trash me-2 text-danger"></i> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Favorite Button - Moved to Right */}
            <div className="col-lg-4 py-3 text-lg-end">
              <button
                className={`btn btn-lg shadow ${isFavorite ? "btn-warning" : "btn-light"}`}
                onClick={handleToggleFavorite}
                style={{
                  borderRadius: "var(--border-radius-lg)",
                  transition: "all 0.3s ease"
                }}
              >
                <i className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'} me-2`}></i>
                {isFavorite ? "Retiré des favoris" : "Ajouter aux favoris"}
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

      <div className="container py-5">
        {message && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm rounded-lg mb-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
          </div>
        )}
        
        <div className="row">
          {/* Main Column - Centered Content */}
          <div className="col-lg-10 mx-auto">
            {/* Course Content Section */}
            <div className="card border-0 shadow-sm rounded-lg mb-4 overflow-hidden">
              <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-play-circle me-2" style={{color: "var(--primary-color)"}}></i>
                  Contenu du cours
                </h5>
              </div>
              <div className="card-body p-0">
              {course.chemin_source?.includes("youtube.com") || course.chemin_source?.includes("youtu.be") ? (
              <div className="ratio ratio-16x9" style={{ maxHeight: "550px" }}>
                <iframe
                  className="w-100"
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(course.chemin_source)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                    </div>
                  ) : course.chemin_source?.endsWith(".mp4") ? (
                    <video className="w-100" controls style={{ maxHeight: "550px" }}>
                      <source src={`http://localhost:5000/static/${course.chemin_source}`} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  ) : course.chemin_source?.endsWith(".pdf") ? (
                    <div className="ratio ratio-16x9" style={{ height: "550px" }}>
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

            {/* Course Objectives Section 
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
            </div>*/}
            
            {/* Course Details Card - New Section */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-header border-0 py-3" style={{background: "var(--white)"}}>
                <h5 className="m-0 fw-bold">
                  <i className="bi bi-info-circle me-2" style={{color: "var(--primary-color)"}}></i>
                  Informations détaillées
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  {[
                    { icon: "bi-tag", label: "Domaine", value: course.domaine },
                    { icon: "bi-file-earmark", label: "Type", value: course.type_ressource },
                    { icon: "bi-bar-chart", label: "Niveau", value: course.niveau },
                    { icon: "bi-globe", label: "Langue", value: course.langue }
                  ].map((item, index) => (
                    <div key={index} className="col-md-3 col-6">
                      <div className="p-3 rounded-lg text-center h-100" style={{
                        background: "rgba(var(--primary-rgb), 0.05)",
                        border: "1px solid rgba(var(--primary-rgb), 0.1)"
                      }}>
                        <div className="mb-2">
                          <i className={`${item.icon}`} style={{
                            fontSize: "1.75rem", 
                            color: "var(--primary-color)"
                          }}></i>
                        </div>
                        <div className="fw-bold mb-1">{item.label}</div>
                        <div>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Reviews Toggle Button */}
            <div className="card border-0 shadow-sm rounded-lg mb-4">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-chat-quote me-2" style={{color: "var(--primary-color)", fontSize: "1.25rem"}}></i>
                    <span className="fw-medium">Avis des utilisateurs</span>
                    <span className="badge rounded-pill ms-2" style={{background: "var(--primary-color)", color: "var(--white)"}}>
                      {avisList.length}
                    </span>
                  </div>
                  <div>
                    <button 
                      className="btn btn-outline-primary me-2" 
                      onClick={() => setShowReviews(!showReviews)}
                      style={{borderRadius: "var(--border-radius-lg)"}}
                    >
                      <i className={`bi ${showReviews ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                      {showReviews ? "Masquer les commentaires" : "Voir les commentaires"}
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      style={{borderRadius: "var(--border-radius-lg)"}}
                    >
                      <i className="bi bi-pencil-square me-2"></i>
                      Donner mon avis
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reviews Section - Conditionally Displayed */}
            {showReviews && (
              <div className="card border-0 shadow-sm rounded-lg mb-4">
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
            )}
            
            {/* Submit Review Form - Conditionally Displayed */}
            {showReviewForm && (
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
            )}
            
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