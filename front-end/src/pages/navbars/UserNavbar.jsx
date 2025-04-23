import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const UserNavbar = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/Dashboard");
  const [hoverIndex, setHoverIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const hoverRef = useRef(null);
  const indicatorRef = useRef(null);
  const location = useLocation();
  
  // Définir les éléments de navigation
  const navItems = [
    { to: "/Dashboard", label: "Dashboard", icon: "speedometer2" },
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
    const currentPath = location.pathname;
    const matchingItem = navItems.find(item => currentPath.includes(item.to));
    if (matchingItem) {
      setActiveLink(matchingItem.to);
    }
  }, [location.pathname, navItems]);

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

  // Gérer la soumission de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && typeof onSearch === 'function') {
      onSearch(search);
    }
    setNavbarOpen(false); // Fermer le menu sur mobile après la recherche
  };

  // Gérer la saisie dans le champ de recherche
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearch(value);
    // Recherche en temps réel optionnelle
    // if (onSearch && typeof onSearch === 'function') {
    //   onSearch(value);
    // }
  };

  return (
    <>
      <nav className={navClass}>
        <div className="container">
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
            {/* Barre de recherche principale */}
            <div className="nav-search-wrapper me-auto ms-lg-4">
              <form onSubmit={handleSearch} className="w-100">
                <div className={`nav-search-main ${searchFocused ? 'focused' : ''}`}>
                  <i className="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher un cours, un sujet..." 
                    className="search-input-main" 
                    value={search}
                    onChange={handleSearchInput}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  <button type="submit" className="search-submit-btn">
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </form>
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
                    onClick={() => {
                      setActiveLink(item.to);
                      setNavbarOpen(false); // Fermer le menu sur mobile après clic
                    }}
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
          background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15);
        }
        
        /* Logo animé */
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.3rem;
          box-shadow: 0 5px 15px rgba(71, 118, 230, 0.4); 
          transform-origin: center;
          transition: all 0.3s ease;
        }
        
        .navbar-brand:hover .logo-icon {
          transform: rotate(15deg) scale(1.1);
          box-shadow: 0 8px 20px rgba(71, 118, 230, 0.5);
        }
        
        .logo-text {
          font-weight: 800;
          margin-left: 12px;
          font-size: 1.4rem;
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          letter-spacing: -0.5px;
        }
        
        .navbar-default .logo-text {
          color: white;
          -webkit-text-fill-color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Champ de recherche global */
        .nav-search-wrapper {
          max-width: 450px;
          width: 100%;
        }
        
        .nav-search-main {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          padding: 0.75rem 1.2rem;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-scrolled .nav-search-main {
          background: rgba(0, 0, 0, 0.05);
          border-color: transparent;
        }
        
        .nav-search-main.focused, .nav-search-main:focus-within {
          background: white;
          border-color: rgba(71, 118, 230, 0.5);
          box-shadow: 0 0 0 4px rgba(71, 118, 230, 0.15);
        }
        
        .search-icon {
          color: white;
          margin-right: 12px;
          font-size: 18px;
          transition: all 0.3s ease;
        }
        
        .nav-search-main.focused .search-icon, 
        .navbar-scrolled .search-icon {
          color: #4776E6;
        }
        
        .search-input-main {
          background: transparent;
          border: none;
          outline: none;
          flex-grow: 1;
          font-size: 16px;
          color: #333; /* Toujours noir lors de la saisie */
          transition: all 0.3s ease;
        }
        
        /* Couleur de texte et placeholder quand la navbar est transparente */
        .navbar-default .search-input-main {
          color: white;
        }
        
        .navbar-default .search-input-main::placeholder {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .navbar-scrolled .search-input-main::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        
        /* Quand le champ est focus, toujours noir */
        .nav-search-main.focused .search-input-main {
          color: #333;
        }
        
        .nav-search-main.focused .search-input-main::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        
        .search-submit-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 18px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .nav-search-main.focused .search-submit-btn,
        .navbar-scrolled .search-submit-btn {
          color: #4776E6;
        }
        
        .search-submit-btn:hover {
          background: rgba(71, 118, 230, 0.1);
          transform: scale(1.1);
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
          box-shadow: 0 2px 8px rgba(71, 118, 230, 0.5);
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
          color: white;
          font-weight: 500;
        }
        
        .navbar-scrolled .nav-link {
          color: rgba(0, 0, 0, 0.7);
        }
        
        .nav-link.active, 
        .navbar-default .nav-link.active {
          color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .navbar-scrolled .nav-link.active {
          color: #4776E6;
          text-shadow: none;
        }
        
        .nav-link:hover {
          color: white;
        }
        
        .navbar-scrolled .nav-link:hover {
          color: #4776E6;
        }
        
        .nav-icon {
          font-size: 1.3rem;
          margin-bottom: 4px;
          transition: all 0.3s ease;
          color: inherit;
        }
        
        .navbar-default .nav-icon i {
          color: white;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        
        .navbar-scrolled .nav-icon i {
          color: inherit;
          filter: none;
        }
        
        .nav-link:hover .nav-icon {
          transform: translateY(-5px);
        }
        
        .nav-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        
        /* Bouton hamburger animé */
        .hamburger-button {
          width: 42px;
          height: 42px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 10px;
          transition: all 0.3s ease;
        }
        
        .hamburger-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .navbar-scrolled .hamburger-button {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .navbar-scrolled .hamburger-button:hover {
          background: rgba(0, 0, 0, 0.1);
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
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .navbar-scrolled .btn-icon {
          background: rgba(0, 0, 0, 0.05);
          color: #333;
        }
        
        .btn-icon:hover {
          background: rgba(71, 118, 230, 0.2);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(71, 118, 230, 0.3);
        }
        
        .navbar-scrolled .btn-icon:hover {
          color: #4776E6;
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FF5757;
          color: white;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid var(--bs-body-bg);
          box-shadow: 0 2px 5px rgba(255, 87, 87, 0.5);
        }
        
        .notification-pulse {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 20px;
          height: 20px;
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
          background: rgba(255, 255, 255, 0.3);
          margin: 0 15px;
        }
        
        .navbar-scrolled .vertical-divider {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          border: none;
          padding: 0.6rem 1.4rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(71, 118, 230, 0.3);
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .logout-btn:hover {
          box-shadow: 0 8px 20px rgba(71, 118, 230, 0.5);
          transform: translateY(-2px);
        }
        
        /* Responsive */
        @media (max-width: 992px) {
          .navbar-default {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
          }
          
          .navbar-default .logo-text {
            -webkit-text-fill-color: transparent;
            text-shadow: none;
          }
          
          .navbar-collapse {
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
            padding: 20px;
            margin-top: 15px;
            border: 1px solid rgba(71, 118, 230, 0.1);
          }
          
          .navbar-default .nav-link,
          .navbar-default .btn-icon {
            color: #333;
          }
          
          .navbar-default .nav-icon i {
            color: #333;
            filter: none;
          }
          
          .navbar-default .nav-link.active {
            color: #4776E6;
            text-shadow: none;
          }
          
          .navbar-default .nav-link:hover {
            color: #4776E6;
          }
          
          .navbar-default .search-icon {
            color: #4776E6;
          }
          
          .navbar-default .search-input-main {
            color: #333;
          }
          
          .navbar-default .search-input-main::placeholder {
            color: rgba(0, 0, 0, 0.5);
          }
          
          .navbar-default .search-submit-btn {
            color: #4776E6;
          }
          
          .navbar-default .hamburger-button {
            background: rgba(0, 0, 0, 0.05);
          }
          
          .navbar-default .hamburger-line {
            background-color: #333;
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
            border-radius: 10px;
          }
          
          .nav-link:hover {
            background: rgba(71, 118, 230, 0.1);
          }
          
          .nav-icon {
            margin-right: 15px;
            margin-bottom: 0;
            width: 24px;
            text-align: center;
          }
          
          .nav-link:hover .nav-icon {
            transform: translateX(5px);
          }
          
          .nav-indicator {
            display: none;
          }
          
          .nav-search-wrapper {
            max-width: none;
            margin: 15px 0;
          }
          
          .nav-search-main {
            background: rgba(0, 0, 0, 0.05);
            border-color: transparent;
          }
          
          .nav-actions {
            width: 100%;
            justify-content: space-between;
            margin-top: 20px;
          }
          
          .vertical-divider {
            display: none;
          }
          
          .logout-btn {
            width: 100%;
            margin-top: 15px;
            padding: 12px;
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
          animation: fadeInDown 0.6s ease-out;
        }
        
        /* Support pour les écrans internationaux */
        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }
        
        /* Amélioration de l'accessibilité */
        .nav-search-main:focus-within {
          outline: none;
          box-shadow: 0 0 0 4px rgba(71, 118, 230, 0.25);
        }
        
        .nav-link:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(71, 118, 230, 0.25);
          border-radius: 10px;
        }
        
        .btn-icon:focus, 
        .search-submit-btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(71, 118, 230, 0.25);
        }
      `}</style>
    </>
  );
};

export default UserNavbar;