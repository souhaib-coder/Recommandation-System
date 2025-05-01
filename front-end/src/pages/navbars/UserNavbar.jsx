import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/api"; // Assurez-vous d'importer la fonction logout de votre API

const UserNavbar = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/Dashboard");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Couleur primaire du thème
  const primaryColor = "rgb(65, 138, 178)";
  
  // Navigation items definition
  const navItems = [
    { to: "/Dashboard", label: "Dashboard", icon: "speedometer2" },
    { to: "/user/favorites", label: "Favoris", icon: "heart-fill" },
    { to: "/Profile", label: "Profil", icon: "person-circle" },
  ];

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
  
  // Route change detection
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = navItems.find(item => currentPath.includes(item.to));
    if (matchingItem) setActiveLink(matchingItem.to);
  }, [location.pathname, navItems]);

  // Toggle menu pour mobile
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && typeof onSearch === 'function') onSearch(search);
    setMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      // Rediriger vers la page de connexion après déconnexion
      navigate('/login');
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return (
    <>
    <nav className={`navbar fixed-top navbar-expand-lg py-2 ${scrolled ? "navbar-scrolled" : "navbar-default"}`}>
    <div className="container">
      {/* Logo - à gauche */}
      <Link className="navbar-brand" to="/Dashboard">
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

      {/* Menu items */}
      <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarNav">
        {/* Search bar - centrée */}
        <form onSubmit={handleSearch} className="d-flex mx-lg-auto mt-3 mt-lg-0" style={{ maxWidth: "400px" }}>
          <div className="input-group" style={{
            background: "rgba(240, 240, 240, 0.5)",
            borderRadius: "100px",
            overflow: "hidden",
            border: searchFocused ? `1px solid ${primaryColor}` : "1px solid transparent",
            transition: "var(--transition-speed)"
          }}>
            <span className="input-group-text border-0 bg-transparent">
              <i className="bi bi-search" style={{ color: searchFocused ? primaryColor : "var(--text-dark)" }}></i>
            </span>
            <input 
              type="text" 
              className="form-control border-0 bg-transparent shadow-none"
              placeholder="Rechercher un cours" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ fontSize: "0.9rem" }}
            />
            <button 
              type="submit" 
              className="btn border-0 bg-transparent"
              style={{ color: searchFocused ? primaryColor : "var(--text-dark)" }}
            >
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </form>
        
        {/* Nav Links - avant le bouton de déconnexion */}
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
          {navItems.map((item, i) => (
            <li className="nav-item" key={i}>
              <Link 
                className="nav-link d-flex align-items-center" 
                to={item.to}
                onClick={() => {
                  setActiveLink(item.to);
                  setMenuOpen(false);
                }}
                style={{
                  color: activeLink === item.to ? primaryColor : "var(--text-dark)",
                  opacity: activeLink === item.to ? 1 : 0.9,
                  fontWeight: "500",
                  padding: "0.5rem 1rem",
                  transition: "var(--transition-speed)"
                }}
              >
                <i className={`bi bi-${item.icon} me-2`}></i>
                {item.label}
              </Link>
            </li>
          ))}
          
          {/* Notification Button */}
          <li className="nav-item mx-2 d-flex align-items-center">
            <button 
              className="btn btn-light btn-sm position-relative rounded-circle"
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(240, 240, 240, 0.5)",
                transition: "var(--transition-speed)"
              }}
            >
              <i className="bi bi-bell-fill"></i>
              <span 
                className="position-absolute translate-middle badge rounded-pill"
                style={{
                  top: 0,
                  right: 0,
                  background: "#FF5757",
                  fontSize: "0.65rem",
                  padding: "0.25rem 0.4rem"
                }}
              >
                3
              </span>
            </button>
          </li>
          
          {/* Logout Button - à droite */}
          <li className="nav-item ms-lg-2">
            <button 
              className="btn btn-sm" 
              onClick={handleLogout}
              style={{
                background: primaryColor,
                color: "var(--white)",
                borderRadius: "var(--border-radius-sm)",
                padding: "0.5rem 1.5rem",
                fontWeight: "500",
                transition: "var(--transition-speed)"
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Déconnexion
            </button>
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

export default UserNavbar;