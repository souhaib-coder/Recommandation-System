import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminNavbar = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  
  // Définir les éléments de navigation pour l'administrateur - simplified structure
  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "speedometer2" },
    { to: "/admin/courses", label: "Cours", icon: "book" },
    { to: "/admin/users", label: "Utilisateurs", icon: "people-fill" },
    { to: "/admin/stats", label: "Statistiques", icon: "graph-up" },
    { to: "/admin/settings", label: "Paramètres", icon: "gear-fill" },
  ];

  // Track scroll for navbar effect - simplified
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && typeof onSearch === 'function') {
      onSearch(search);
    }
    setNavbarOpen(false);
  };

  return (
    <>
      <nav className={`navbar fixed-top navbar-expand-lg ${scrolled ? "navbar-scrolled" : "navbar-default"}`}>
        <div className="container-fluid px-lg-4">
          {/* Logo with Admin badge */}
          <Link className="navbar-brand" to="/admin/dashboard">
            <div className="logo-container">
              <i className="bi bi-lightning-charge-fill logo-icon"></i>
              <span className="logo-text">DevStorm<span className="admin-badge">Admin</span></span>
            </div>
          </Link>
          
          {/* Hamburger button */}
          <button
            className={`navbar-toggler ${navbarOpen ? 'active' : ''}`}
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          {/* Navbar content */}
          <div className={`collapse navbar-collapse ${navbarOpen ? "show" : ""}`}>
            {/* Search bar */}
            <form onSubmit={handleSearch} className="nav-search-wrapper ms-auto ms-lg-4 me-lg-auto">
              <div className="nav-search-main">
                <i className="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="search-input" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            
            {/* Navigation links */}
            <ul className="navbar-nav nav-links align-items-center">
              {navItems.map((item, i) => {
                const isActive = location.pathname.includes(item.to);
                return (
                  <li className="nav-item" key={i}>
                    <Link 
                      className={`nav-link ${isActive ? 'active' : ''}`} 
                      to={item.to}
                      onClick={() => setNavbarOpen(false)}
                    >
                      <i className={`bi bi-${item.icon} nav-icon`}></i>
                      <span className="nav-label d-lg-none">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            {/* Actions */}
            <div className="nav-actions">
              {/* Notifications */}
              <button className="btn btn-icon position-relative">
                <i className="bi bi-bell"></i>
                {/* Only show badge if there are notifications */}
                <span className="notification-badge">5</span>
              </button>
              
              {/* Add Course Button - compact */}
              <Link 
                className="btn btn-add d-none d-lg-flex"
                to="/admin/ajouter-cours"
                title="Ajouter un cours"
              >
                <i className="bi bi-plus-lg"></i>
              </Link>
              
              {/* Admin dropdown */}
              <div className="dropdown">
                <button className="btn btn-icon" type="button" id="adminMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-person-circle"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenuButton">
                  <li><Link className="dropdown-item" to="/admin/profile">Mon profil</Link></li>
                  <li><Link className="dropdown-item" to="/admin/settings">Paramètres</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item text-danger" to="/logout">Déconnexion</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        /* Streamlined Navbar Styles */
        .navbar {
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          height: 60px;
          z-index: 1030;
        }
        
        .navbar-default {
          background: rgba(13, 17, 23, 0.9);
          backdrop-filter: blur(10px);
        }
        
        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        /* Compact Logo */
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .logo-icon {
          font-size: 1.2rem;
          color: #FF7600;
          margin-right: 8px;
        }
        
        .logo-text {
          font-weight: 700;
          font-size: 1.1rem;
          color: white;
          position: relative;
        }
        
        .navbar-scrolled .logo-text {
          color: #333;
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
        }
        
        /* Search bar */
        .nav-search-wrapper {
          max-width: 300px;
          width: 100%;
        }
        
        .nav-search-main {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          display: flex;
          align-items: center;
          height: 36px;
          padding: 0 12px;
        }
        
        .navbar-scrolled .nav-search-main {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .search-icon {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin-right: 8px;
        }
        
        .navbar-scrolled .search-icon {
          color: rgba(0, 0, 0, 0.5);
        }
        
        .search-input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
          color: white;
        }
        
        .navbar-scrolled .search-input {
          color: #333;
        }
        
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .navbar-scrolled .search-input::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        
        /* Navigation icons */
        .nav-links {
          margin: 0 10px;
        }
        
        .nav-item {
          margin: 0 5px;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .navbar-scrolled .nav-link {
          color: rgba(0, 0, 0, 0.6);
        }
        
        .nav-link.active {
          color: #FF7600;
        }
        
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .navbar-scrolled .nav-link:hover {
          color: #FF7600;
          background: rgba(255, 136, 0, 0.1);
        }
        
        .nav-icon {
          font-size: 1.2rem;
        }
        
        /* Actions area */
        .nav-actions {
          display: flex;
          align-items: center;
          margin-left: 15px;
        }
        
        .btn-icon {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          margin: 0 5px;
          transition: all 0.2s ease;
        }
        
        .navbar-scrolled .btn-icon {
          color: rgba(0, 0, 0, 0.6);
        }
        
        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .navbar-scrolled .btn-icon:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #FF7600;
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FF5757;
          color: white;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .btn-add {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #FF7600;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 5px;
          transition: all 0.2s ease;
        }
        
        .btn-add:hover {
          background: #FF5500;
          color: white;
        }
        
        /* Hamburger button */
        .navbar-toggler {
          width: 36px;
          height: 36px;
          padding: 5px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          transition: all 0.2s ease;
        }
        
        .navbar-scrolled .navbar-toggler {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .hamburger-line {
          width: 100%;
          height: 2px;
          background-color: white;
          border-radius: 5px;
          transition: all 0.3s;
        }
        
        .navbar-scrolled .hamburger-line {
          background-color: #333;
        }
        
        .navbar-toggler.active .hamburger-line:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        
        .navbar-toggler.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        
        .navbar-toggler.active .hamburger-line:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }
        
        /* Dropdown menu */
        .dropdown-menu {
          border: none;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          margin-top: 10px;
          min-width: 180px;
        }
        
        .dropdown-item {
          padding: 0.5rem 1rem;
          border-radius: 5px;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        
        .dropdown-item:hover {
          background: rgba(255, 118, 0, 0.1);
        }
        
        .dropdown-item.text-danger:hover {
          background: rgba(220, 53, 69, 0.1);
        }
        
        /* Responsive styles */
        @media (max-width: 992px) {
          .navbar {
            height: auto;
          }
          
          .navbar-collapse {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            padding: 15px;
            margin-top: 10px;
          }
          
          .nav-links {
            flex-direction: column;
            width: 100%;
            margin: 10px 0;
          }
          
          .nav-item {
            width: 100%;
            margin: 2px 0;
          }
          
          .nav-link {
            display: flex;
            align-items: center;
            padding: 10px;
            color: #333;
          }
          
          .nav-icon {
            margin-right: 10px;
            width: 20px;
            text-align: center;
          }
          
          .nav-actions {
            width: 100%;
            justify-content: space-between;
            margin: 10px 0 0;
            padding-top: 10px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }
          
          .btn-icon, .btn-add {
            color: #333;
            background: rgba(0, 0, 0, 0.05);
          }
          
          .btn-add {
            display: flex !important;
            width: auto;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            background: #FF7600;
            color: white;
          }
          
          .btn-add::after {
            content: "Ajouter un cours";
            margin-left: 8px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
};

export default AdminNavbar;