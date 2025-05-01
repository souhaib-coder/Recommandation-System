import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/api"; // Importer la fonction logout de l'API

const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/admin/dashboard");
  const location = useLocation();
  const navigate = useNavigate(); // Hook de navigation
  
  // Couleur primaire du thème
  const primaryColor = "#FF7600";
  
  // Définir les éléments de navigation pour l'administrateur
  const navItems = [
    { to: "/admin/courses", label: "Cours", icon: "book" },
    { to: "/admin/users", label: "Utilisateurs", icon: "people-fill" },
    { to: "/admin/settings", label: "Paramètres", icon: "gear-fill" },
  ];

  // Track scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          {/* Logo with Admin badge */}
          <Link className="navbar-brand" to="/admin/dashboard">
            <div className="logo-container">
              <div className="logo-icon">
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div className="logo-text">DocStorm<span className="admin-badge">Admin</span></div>
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
          
          {/* Navbar content */}
          <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
            {/* Navigation links */}
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
              
              {/* Notifications */}
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
                    5
                  </span>
                </button>
              </li>
              
              {/* Admin dropdown */}
              <li className="nav-item mx-2 d-flex align-items-center">
                <div className="dropdown">
                  <button 
                    className="btn btn-light btn-sm rounded-circle"
                    style={{
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(240, 240, 240, 0.5)",
                      transition: "var(--transition-speed)"
                    }}
                    id="adminMenuButton" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenuButton">
                    <li><Link className="dropdown-item" to="/Profile">Mon profil</Link></li>
                  </ul>
                </div>
              </li>
              
              {/* Logout Button */}
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
          min-height: 60px;
        }
        
        .navbar-default {
          background: transparent;
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
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FF7600 0%, #FF5500 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
          box-shadow: 0 4px 10px rgba(255, 118, 0, 0.3);
          transition: all 0.3s ease;
        }
        
        .navbar-brand:hover .logo-icon {
          transform: rotate(15deg) scale(1.1);
        }
        
        .logo-text {
          font-weight: 700;
          margin-left: 10px;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #FF7600 0%, #FF5500 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }
        
        .admin-badge {
          font-size: 0.55rem;
          font-weight: 700;
          background: #FF5500;
          color: white;
          border-radius: 3px;
          padding: 1px 3px;
          margin-left: 5px;
          vertical-align: text-top;
          -webkit-text-fill-color: white;
        }
        
        /* Dropdown menu */
        .dropdown-menu {
          border: none;
          border-radius: 12px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          margin-top: 10px;
          min-width: 180px;
        }
        
        .dropdown-item {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        
        .dropdown-item:hover {
          background: rgba(255, 118, 0, 0.1);
        }
        
        .dropdown-item.text-danger:hover {
          background: rgba(220, 53, 69, 0.1);
        }
        
        /* Responsive */
        @media (max-width: 992px) {
          .navbar-collapse {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 15px;
            margin-top: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminNavbar;