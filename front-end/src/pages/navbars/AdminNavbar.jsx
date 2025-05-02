import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/api"; // Importer la fonction logout de l'API
import "../../css/NavStyle/AdminNavbarStyle.css";

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
      navigate('/auth');
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
    </>
  );
};

export default AdminNavbar;