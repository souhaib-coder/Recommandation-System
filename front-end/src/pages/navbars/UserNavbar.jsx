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






















/*import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = `navbar fixed-top navbar-expand-lg py-3 px-4 transition-navbar ${
    scrolled ? "navbar-scrolled" : "navbar-default"
  }`;

  return (
    <>
      <nav className={navClass}>
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold fs-4 text-gradient" to="/">
            <i className="bi bi-lightning-charge-fill me-2"></i>
            <span className="brand-text">DevStorm</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${navbarOpen ? "show" : ""}`}>
            <ul className="navbar-nav ms-auto align-items-center">
              {[
                { to: "/user/dashboard", label: "Dashboard", icon: "speedometer2" },
                { to: "/user/favorites", label: "Favoris", icon: "heart-fill" },
                { to: "/user/history", label: "Historique", icon: "clock-history" },
                { to: "/user/profile", label: "Profil", icon: "person-circle" },
              ].map((item, i) => (
                <li className="nav-item mx-2" key={i}>
                  <Link className="nav-link nav-custom" to={item.to}>
                    <i className={`bi bi-${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="nav-item ms-3">
                <Link className="btn btn-primary btn-glow rounded-pill px-4" to="/logout">
                  <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

     
      <style jsx>{`
        .transition-navbar {
          transition: all 0.3s ease;
        }
        
        .navbar-default {
          background-color: transparent;
        }
        
        .navbar-scrolled {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .navbar-default .nav-custom {
          color: white;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .navbar-scrolled .nav-custom {
          color: #333;
          font-weight: 500;
        }
        
        .nav-custom:hover {
          color: #4776E6 !important;
          transform: translateY(-2px);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .navbar-default .brand-text {
          color: white;
          -webkit-text-fill-color: white;
        }
        
        .navbar-scrolled .brand-text {
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .btn-glow {
          border: none;
          position: relative;
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-glow:hover {
          box-shadow: 0 5px 15px rgba(71, 118, 230, 0.4);
          transform: translateY(-2px);
        }
        
        @media (max-width: 992px) {
          .navbar-default, .navbar-scrolled {
            background-color: white;
          }
          
          .navbar-default .nav-custom {
            color: #333;
          }
          
          .navbar-default .brand-text {
            -webkit-text-fill-color: transparent;
          }
        }
      `}</style>
    </>
  );
};

export default UserNavbar;*/





























/*import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = `navbar fixed-top navbar-expand-lg py-3 px-4 transition-navbar ${
    scrolled ? "navbar-scrolled" : "navbar-default"
  }`;

  return (
    <nav className={navClass}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-4 text-gradient" to="/">
          <i className="bi bi-lightning-charge-fill me-2"></i>
          DevStorm
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setNavbarOpen(!navbarOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${navbarOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            {[
              { to: "/user/dashboard", label: "Dashboard", icon: "speedometer2" },
              { to: "/user/favorites", label: "Favoris", icon: "heart-fill" },
              { to: "/user/history", label: "Historique", icon: "clock-history" },
              { to: "/user/profile", label: "Profil", icon: "person-circle" },
            ].map((item, i) => (
              <li className="nav-item mx-2" key={i}>
                <Link className="nav-link nav-custom" to={item.to}>
                  <i className={`bi bi-${item.icon} me-2`}></i>
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="nav-item mx-2">
              <Link className="btn btn-outline-primary rounded-pill px-3" to="/logout">
                <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;*/
