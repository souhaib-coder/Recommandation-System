import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomeNavbar from "./navbars/HomeNavbar"; // Import du composant HomeNavbar modifié

const Home = () => {
  const navigate = useNavigate();
  const [currentDomain, setCurrentDomain] = useState("Informatique");

  const handleStartLearning = () => {
    navigate("/auth");
  };

  // Fonction pour obtenir les icônes par domaine
  const getDomainIcon = (domain) => {
    return {
      "Informatique": "bi-laptop",
      "Mathématiques": "bi-calculator",
      "Langues": "bi-translate",
      "Communication": "bi-chat-dots"
    }[domain] || "bi-book";
  };

  // Mise à jour de l'affichage dynamique des icônes
  const updateDomainIcon = (domain) => {
    setCurrentDomain(domain);
  };

  return (
    <div className="education-dashboard" style={{ background: "var(--light-bg)" }}>
      <HomeNavbar />
      {/* Hero Banner - Maintenant avec un ID pour la navigation */}
      <div id="hero" className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "500px",
        marginTop: "70px",
        padding: "3rem 0",
        overflow: "hidden"
      }}>
        {/* Éléments décoratifs pour le header */}
        <div className="position-absolute" style={{ 
          top: "-50px", 
          right: "-50px", 
          width: "300px", 
          height: "300px", 
          borderRadius: "50%", 
          background: "rgba(255,255,255,0.1)", 
          zIndex: "1" 
        }}></div>
        <div className="position-absolute" style={{ 
          bottom: "50px", 
          left: "-80px", 
          width: "200px", 
          height: "200px", 
          borderRadius: "50%", 
          background: "rgba(255,255,255,0.05)", 
          zIndex: "1" 
        }}></div>
        
        <div className="container position-relative" style={{ zIndex: "2" }}>
          <div className="row align-items-center">
            <div className="col-lg-6 py-4">
              <span className="badge mb-3" style={{ 
                background: "rgba(255,255,255,0.2)", 
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "30px",
                backdropFilter: "blur(5px)"
              }}>
                <i className="bi bi-stars me-2"></i>La nouvelle façon d'apprendre
              </span>
              <h1 className="display-4 fw-bold mb-3">Apprenez à votre rythme, où que vous soyez</h1>
              <p className="lead mb-4 opacity-90">Explorez des centaines de cours dispensés par des experts et propulsés par un moteur de recommandation intelligent.</p>
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-lg shadow-sm" 
                  onClick={handleStartLearning}
                  style={{
                    background: "var(--white)",
                    color: "var(--primary-color)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "0.8rem 2rem",
                    fontWeight: "600",
                    transition: "var(--transition-speed)"
                  }}
                >
                  <i className="bi bi-lightning-charge me-2"></i>
                  Commencer l'apprentissage
                </button>
                <a
                  href="#categories"
                  className="btn btn-lg" 
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "0.8rem 2rem",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "var(--transition-speed)"
                  }}
                >
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  Découvrir nos catégories
                </a>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="position-relative">
                <div className="p-4 text-center" style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "var(--border-radius-lg)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "var(--shadow)",
                  transform: "rotate(-3deg)"
                }}>
                  {/* Icône dynamique qui reflète le domaine actuel */}
                  <i className={`${getDomainIcon(currentDomain)} display-1 mb-3`}></i>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <span className="badge rounded-pill" style={{background: "rgba(255,255,255,0.2)", color: "white"}}>
                      <i className="bi bi-code-slash me-1"></i> Codage
                    </span>
                    <span className="badge rounded-pill" style={{background: "rgba(255,255,255,0.2)", color: "white"}}>
                      <i className="bi bi-braces me-1"></i> Design
                    </span>
                    <span className="badge rounded-pill" style={{background: "rgba(255,255,255,0.2)", color: "white"}}>
                      <i className="bi bi-graph-up me-1"></i> Data
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="position-absolute bottom-0 start-0 w-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" style={{ display: "block" }}>
            <path fill="var(--light-bg)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      {/* Section vidéo publicitaire */}
      <div className="container-fluid py-4" style={{ background: "var(--accent-bg)" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8 mx-auto">
              <div className="card shadow-sm border-0" style={{ 
                borderRadius: "var(--border-radius-sm)",
                overflow: "hidden",
                position: "relative"
              }}>
                <div className="ratio ratio-16x9">
                  <video 
                    src="ads.mp4" 
                    controls={true} 
                    //autoPlay 
                    //muted 
                    loop
                    style={{ objectFit: "cover", width: "100%" }}
                  ></video>
                </div>
                <div className="position-absolute top-0 end-0 p-2">
                  <span className="badge" style={{ 
                    background: "rgba(255,255,255,0.3)", 
                    backdropFilter: "blur(3px)",
                    color: "var(--white)",
                    fontSize: "0.7rem"
                  }}>
                    Publicité
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Catégories populaires */}
        <section id="categories" className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="m-0">Catégories populaires</h4>
            <span className="badge rounded-pill" style={{ background: "var(--primary-color)", color: "var(--white)" }}>4 domaines</span>
          </div>

          <div className="row g-4">
            {[
              { domain: "Informatique", desc: "Développement web, mobile et intelligence artificielle" },
              { domain: "Mathématiques", desc: "Algèbre, calcul, statistiques et mathématiques appliquées" },
              { domain: "Langues", desc: "Anglais, français, espagnol, allemand et bien d'autres" },
              { domain: "Communication", desc: "Expression orale, écrite et compétences professionnelles" }
            ].map((category, index) => (
              <div className="col-md-6 col-lg-3" key={index}>
                <div 
                  className="card h-100 border-0 shadow-sm shadow-hover overflow-hidden" 
                  style={{
                    borderRadius: "var(--border-radius-sm)",
                    transition: "var(--transition-speed)"
                  }}
                  onMouseEnter={() => updateDomainIcon(category.domain)}
                >
                  <div className="text-center py-4" style={{ background: "var(--accent-bg)" }}>
                    <i className={`${getDomainIcon(category.domain)} display-4`} style={{ color: "var(--primary-color)" }}></i>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{category.domain}</h5>
                    <p className="card-text" style={{ color: "var(--text-light)" }}>{category.desc}</p>
                  </div>
                  <div className="card-footer border-top d-grid" style={{ background: "var(--white)" }}>
                    <Link to="/auth" className="btn" style={{
                      background: "var(--primary-color)",
                      color: "var(--white)",
                      borderRadius: "var(--border-radius-sm)"
                    }}>
                      <i className="bi bi-arrow-right me-2"></i>Explorer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pourquoi nous choisir */}
        <section id="why-us" className="mb-5 py-5">
          <h4 className="mb-4 text-center">Pourquoi nous choisir</h4>
          <div className="row g-4">
            {[
              { 
                icon: "bi-graph-up", 
                title: "Recommandations intelligentes", 
                desc: "Notre algorithme d'IA analyse vos préférences et objectifs pour vous suggérer les cours les plus pertinents." 
              },
              { 
                icon: "bi-award", 
                title: "Contenus de qualité", 
                desc: "Tous nos cours sont élaborés par des experts reconnus et régulièrement mis à jour pour refléter les dernières avancées." 
              },
              { 
                icon: "bi-clock", 
                title: "Flexibilité totale", 
                desc: "Accédez à vos cours depuis n'importe quel appareil, à tout moment, et progressez à votre propre rythme." 
              }
            ].map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="card h-100 border-0 shadow-sm text-center p-4" style={{ borderRadius: "var(--border-radius-sm)" }}>
                  <div className="mb-3">
                    <i className={`${feature.icon} display-5`} style={{ color: "var(--primary-color)" }}></i>
                  </div>
                  <h5 className="mb-3">{feature.title}</h5>
                  <p style={{ color: "var(--text-light)" }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Témoignages */}
        <section id="testimonials" className="mb-5 py-4">
          <h4 className="mb-4 text-center">Ils nous font confiance</h4>
          <div className="row g-4">
            {[
              {
                name: "Sophie Martin",
                role: "Développeuse Web",
                quote: "La qualité des cours est exceptionnelle. J'ai pu acquérir de nouvelles compétences et les appliquer immédiatement dans mon travail."
              },
              {
                name: "Thomas Dubois",
                role: "Chef de projet",
                quote: "Les recommandations personnalisées m'ont permis de découvrir des cours que je n'aurais jamais trouvés par moi-même. Un vrai gain de temps!"
              },
              {
                name: "Julie Legrand",
                role: "Entrepreneur",
                quote: "J'apprécie particulièrement la flexibilité de la plateforme. Je peux suivre mes cours pendant mes déplacements et m'adapter à mon emploi du temps."
              }
                          ].map((testimonial, index) => (
                            <div className="col-md-4" key={index}>
                              <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: "var(--border-radius-sm)" }}>
                                <div className="mb-3 text-center">
                                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ 
                                    width: "60px", 
                                    height: "60px", 
                                    background: "var(--accent-bg)",
                                    color: "var(--primary-color)"
                                  }}>
                                    <i className="bi bi-person-circle display-6"></i>
                                  </div>
                                </div>
                                <div className="card-body p-0 text-center">
                                  <p className="mb-4" style={{ color: "var(--text-dark)" }}>"{testimonial.quote}"</p>
                                  <h6 className="mb-1">{testimonial.name}</h6>
                                  <p className="small" style={{ color: "var(--text-light)" }}>{testimonial.role}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
              
                      {/* Call to Action */}
                      <section className="my-5 py-5 text-center">
                        <div className="card border-0 shadow-sm p-5" style={{ 
                          borderRadius: "var(--border-radius-lg)",
                          background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
                          color: "var(--white)"
                        }}>
                          <h2 className="mb-3">Prêt à rejoindre notre communauté ?</h2>
                          <p className="mb-4 mx-auto" style={{ maxWidth: "700px" }}>Rejoignez plus de 100 000 apprenants et commencez votre parcours d'apprentissage dès aujourd'hui.</p>
                          <div className="d-flex gap-3 justify-content-center">
                            <Link to="/auth" className="btn btn-lg" style={{
                              background: "var(--white)",
                              color: "var(--primary-color)",
                              borderRadius: "var(--border-radius-lg)",
                              padding: "0.8rem 2rem",
                              fontWeight: "600"
                            }}>
                              <i className="bi bi-box-arrow-in-right me-2"></i>Commencer maintenant
                            </Link>
                          </div>
                        </div>
                      </section>
                    </div>
                    
                    {/* Footer */}
                    <footer style={{ 
                      background: "var(--text-dark)", 
                      color: "var(--white)",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <div className="container py-4">
                        <div className="row">
                          <div className="col-lg-4">
                            <h5 className="fw-bold mb-3">
                              <i className="bi bi-lightning-charge-fill me-2"></i>DevStorm
                            </h5>
                            <p className="mb-3" style={{ color: "var(--text-light)" }}>Plateforme d'apprentissage en ligne qui révolutionne l'éducation grâce à des recommandations personnalisées et des contenus de qualité.</p>
                            <div className="d-flex gap-2">
                              <a href="#" className="btn btn-sm rounded-circle p-2" style={{ 
                                background: "rgba(255,255,255,0.1)", 
                                color: "white",
                                backdropFilter: "blur(5px)",
                                transition: "var(--transition-speed)"
                              }}>
                                <i className="bi bi-facebook"></i>
                              </a>
                              <a href="#" className="btn btn-sm rounded-circle p-2" style={{ 
                                background: "rgba(255,255,255,0.1)", 
                                color: "white",
                                backdropFilter: "blur(5px)",
                                transition: "var(--transition-speed)"
                              }}>
                                <i className="bi bi-twitter-x"></i>
                              </a>
                              <a href="#" className="btn btn-sm rounded-circle p-2" style={{ 
                                background: "rgba(255,255,255,0.1)", 
                                color: "white",
                                backdropFilter: "blur(5px)",
                                transition: "var(--transition-speed)"
                              }}>
                                <i className="bi bi-linkedin"></i>
                              </a>
                            </div>
                          </div>
                          
                          <div className="col-lg-2 col-6">
                            <h6 className="fw-bold mb-3">Navigation</h6>
                            <ul className="list-unstyled">
                              <li className="mb-2"><a href="#" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>Accueil
                              </a></li>
                              <li className="mb-2"><a href="#categories" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>Catégories
                              </a></li>
                              <li className="mb-2"><a href="#why-us" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>À propos
                              </a></li>
                              <li className="mb-2"><a href="#" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>Contact
                              </a></li>
                            </ul>
                          </div>
                          
                          <div className="col-lg-2 col-6">
                            <h6 className="fw-bold mb-3">Légal</h6>
                            <ul className="list-unstyled">
                              <li className="mb-2"><a href="#" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>Conditions d'utilisation
                              </a></li>
                              <li className="mb-2"><a href="#" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>Politique de confidentialité
                              </a></li>
                              <li className="mb-2"><a href="#" className="text-decoration-none d-flex align-items-center" style={{ color: "var(--text-light)", transition: "var(--transition-speed)" }}>
                                <i className="bi bi-chevron-right me-2" style={{ fontSize: "0.8rem" }}></i>Mentions légales
                              </a></li>
                            </ul>
                          </div>
                          
                          <div className="col-lg-4">
                            <h6 className="fw-bold mb-3">Newsletter</h6>
                            <p className="mb-3" style={{ color: "var(--text-light)" }}>Recevez nos actualités et offres spéciales</p>
                            <div className="input-group mb-3">
                              <input type="email" className="form-control" placeholder="Votre email" aria-label="Votre email" style={{ 
                                borderRadius: "var(--border-radius-sm) 0 0 var(--border-radius-sm)",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "white"
                              }} />
                              <button className="btn" type="button" style={{ 
                                background: "rgba(255,255,255,0.9)", 
                                color: "var(--primary-color)", 
                                borderRadius: "0 var(--border-radius-sm) var(--border-radius-sm) 0",
                                fontWeight: "600"
                              }}>S'abonner</button>
                            </div>
                            <div className="d-flex align-items-center mt-4 p-3" style={{ 
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "var(--border-radius-sm)",
                              backdropFilter: "blur(5px)"
                            }}>
                              <div className="me-3" style={{ 
                                width: "40px", 
                                height: "40px", 
                                borderRadius: "50%", 
                                background: "rgba(255,255,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <i className="bi bi-headset"></i>
                              </div>
                              <div>
                                <p className="mb-0 small" style={{ color: "var(--text-light)" }}>Besoin d'aide ?</p>
                                <a href="#" className="text-decoration-none" style={{ color: "white" }}>Contactez notre support</a>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-top mt-5 pt-4 text-center" style={{ borderColor: "rgba(255,255,255,0.1)!important" }}>
                          <p className="mb-0" style={{ color: "var(--text-light)" }}>© 2025 DevStorm. Tous droits réservés.</p>
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
                        box-shadow: var(--shadow-hover)!important;
                      }
                      .text-gradient {
                        background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                      }
                      footer a:hover {
                        color: white !important;
                        transform: translateX(5px);
                      }
                      footer .btn:hover {
                        background: rgba(255,255,255,0.2);
                        transform: translateY(-2px);
                      }
                      ::placeholder {
                        color: rgba(255,255,255,0.5);
                      }
                      .form-control:focus {
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25);
                      }
                      a {
                        transition: var(--transition-speed);
                      }
                      a:hover {
                        opacity: 0.85;
                      }
                    `}
                    </style>
                  </div>
                );
              };
              
              export default Home;