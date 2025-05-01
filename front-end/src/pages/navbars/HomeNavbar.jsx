import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomeNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Couleur violette pour le thème
  const primaryColor = "rgb(65, 138, 178)"; // Couleur violette

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Toggle menu pour mobile
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
    <nav className={`navbar fixed-top navbar-expand-lg py-2 ${scrolled ? "navbar-scrolled" : "navbar-default"}`}>
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand" to="/">
            <div className="logo-container">
              <div className="logo-icon">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div className="logo-text">DocStorm</div>
            </div>
          </Link>

        {/* Bouton Toggle pour mobile */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          onClick={toggleMenu}
          aria-expanded={menuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          style={{
            color: scrolled ? primaryColor : "var(--text-dark)",
          }}
        >
          <i className={`bi ${menuOpen ? "bi-x" : "bi-list"}`}></i>
        </button>

        {/* Navbar avec menu centré et login à droite */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Menu au centre */}
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a className="nav-link" href="#hero" style={{
                color: "var(--text-dark)",
                opacity: "0.9",
                fontWeight: "500",
                padding: "0.5rem 1rem",
                transition: "var(--transition-speed)"
              }}>
                Accueil
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#categories" style={{
                color: "var(--text-dark)",
                opacity: "0.9",
                fontWeight: "500",
                padding: "0.5rem 1rem",
                transition: "var(--transition-speed)"
              }}>
                Catégories
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#why-us" style={{
                color: "var(--text-dark)",
                opacity: "0.9",
                fontWeight: "500",
                padding: "0.5rem 1rem",
                transition: "var(--transition-speed)"
              }}>
                Avantages
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#testimonials" style={{
                color: "var(--text-dark)",
                opacity: "0.9",
                fontWeight: "500",
                padding: "0.5rem 1rem",
                transition: "var(--transition-speed)"
              }}>
                Témoignages
              </a>
            </li>
          </ul>
          
          {/* Login à droite */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="btn btn-sm" to="/auth" style={{
                background: primaryColor,
                color: "var(--white)",
                borderRadius: "var(--border-radius-sm)",
                padding: "0.5rem 1.5rem",
                fontWeight: "500",
                transition: "var(--transition-speed)"
              }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Connexion
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <style jsx>{`
      /* Base navbar styles */
        .navbar {
          transition: all 0.4s ease;
          padding: 0.6rem 0;
          z-index: 1030;
          min-height: 60px; /* Reduced height */
        }
        
        .navbar-default {
          background: transparent; /* No color initially */
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(15px);
          box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.1);
        }
        
        /* Logo */
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo-icon {
          width: 32px; /* Smaller */
          height: 32px; /* Smaller */
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          border-radius: 8px; /* Smaller radius */
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem; /* Smaller */
          box-shadow: 0 4px 10px rgba(71, 118, 230, 0.3); 
          transition: all 0.3s ease;
        }
        
        .navbar-brand:hover .logo-icon {
          transform: rotate(15deg) scale(1.1);
        }
        
        .logo-text {
          font-weight: 700;
          margin-left: 10px;
          font-size: 1.2rem; /* Smaller */
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }`}
        </style>
        </>
  );
};

export default HomeNavbar;