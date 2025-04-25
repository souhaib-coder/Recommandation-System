import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminNavbar = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/admin/dashboard");
  const [hoverIndex, setHoverIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const hoverRef = useRef(null);
  const indicatorRef = useRef(null);
  const location = useLocation();
  
  // Définir les éléments de navigation pour l'administrateur
  const navItems = [
    { to: "/admin/courses", label: "Cours", icon: "book" },
    { to: "/admin/users", label: "Utilisateurs", icon: "people-fill" },
    { to: "/admin/settings", label: "Paramètres", icon: "gear-fill" },
  ];

  // Track scroll for navbar effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // Route change detection
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = navItems.find(item => currentPath.includes(item.to));
    if (matchingItem) setActiveLink(matchingItem.to);
  }, [location.pathname, navItems]);

  // Hover indicator animation
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
          
          {/* Hamburger button */}
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
          
          {/* Navbar content */}
          <div className={`collapse navbar-collapse ${navbarOpen ? "show" : ""}`}>
            {/* Search bar */}
            <div className="nav-search-wrapper me-auto ms-lg-4">
              <form onSubmit={handleSearch} className="w-100">
                <div className={`nav-search-main ${searchFocused ? 'focused' : ''}`}>
                  <i className="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="search-input-main" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  <button type="submit" className="search-submit-btn">
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </form>
            </div>
            
            {/* Navigation links */}
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
                      setNavbarOpen(false);
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
            
            {/* Actions */}
            <div className="nav-actions ms-3">
              {/* Notifications */}
              <button className="btn btn-icon notification-btn position-relative">
                <i className="bi bi-bell-fill"></i>
                <span className="notification-badge">5</span>
                <span className="notification-pulse"></span>
              </button>
              
              <div className="vertical-divider"></div>
              
              {/* Add Course Button */}
              <Link 
                className="btn btn-primary rounded-pill add-btn"
                to="/admin/ajouter-cours"
                title="Ajouter un cours"
              >
                <i className="bi bi-plus-lg me-md-2"></i>
                <span className="d-none d-md-inline">Ajouter</span>
              </Link>
              
              <div className="vertical-divider"></div>
              
              {/* Admin dropdown */}
              <div className="dropdown">
                <button className="btn btn-icon admin-btn" type="button" id="adminMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
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
        
        /* Search */
        .nav-search-wrapper {
          max-width: 400px;
          width: 100%;
        }
        
        .nav-search-main {
          background: rgba(240, 240, 240, 0.5);
          border-radius: 100px;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        
        .navbar-scrolled .nav-search-main {
          background: rgba(0, 0, 0, 0.03);
        }
        
        .nav-search-main.focused {
          background: white;
          border-color: rgba(255, 118, 0, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 118, 0, 0.1);
        }
        
        .search-icon, .search-input-main, .search-submit-btn {
          color: #333;
          transition: all 0.3s ease;
        }
        
        .nav-search-main.focused .search-icon,
        .nav-search-main.focused .search-submit-btn {
          color: #FF7600;
        }
        
        .search-input-main {
          background: transparent;
          border: none;
          outline: none;
          flex-grow: 1;
          font-size: 14px;
          color: #333;
        }
        
        .search-submit-btn {
          background: transparent;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Navigation */
        .nav-links {
          position: relative;
          display: flex;
          margin: 0 10px;
        }
        
        .nav-indicator {
          position: absolute;
          bottom: -2px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #FF7600, #FF5500);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }
        
        .nav-item {
          position: relative;
          margin: 0 8px;
        }
        
        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 12px;
          transition: all 0.3s ease;
          color: #333;
          font-weight: 500;
        }
        
        .nav-link.active {
          color: #FF7600;
        }
        
        .nav-link:hover {
          color: #FF7600;
        }
        
        .nav-icon {
          font-size: 1.1rem;
          margin-bottom: 2px;
          transition: all 0.3s ease;
        }
        
        .nav-link:hover .nav-icon {
          transform: translateY(-3px);
        }
        
        .nav-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Hamburger */
        .hamburger-button {
          width: 36px;
          height: 36px;
          border: none;
          background: rgba(240, 240, 240, 0.5);
          border-radius: 6px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 8px;
          transition: all 0.3s ease;
        }
        
        .hamburger-line {
          width: 100%;
          height: 2px;
          background-color: #333;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .hamburger-button.active .hamburger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        
        .hamburger-button.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger-button.active .hamburger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        
        /* Action buttons */
        .nav-actions {
          display: flex;
          align-items: center;
        }
        
        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(240, 240, 240, 0.5);
          color: #333;
          font-size: 1rem;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .btn-icon:hover {
          background: rgba(255, 118, 0, 0.1);
          color: #FF7600;
        }
        
        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FF5757;
          color: white;
          font-size: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
        }
        
        .notification-pulse {
          position: absolute;
          top: -4px;
          right: -4px;
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
            box-shadow: 0 0 0 8px rgba(255, 87, 87, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 87, 87, 0);
          }
        }
        
        .vertical-divider {
          width: 1px;
          height: 20px;
          background: rgba(0, 0, 0, 0.1);
          margin: 0 12px;
        }
        
        .add-btn {
          background: linear-gradient(135deg, #FF7600 0%, #FF5500 100%);
          border: none;
          padding: 0.4rem 1.2rem;
          transition: all 0.3s ease;
          box-shadow: 0 3px 10px rgba(255, 118, 0, 0.2);
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 118, 0, 0.3);
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
          
          .nav-links {
            flex-direction: column;
            width: 100%;
            margin: 10px 0;
          }
          
          .nav-item {
            width: 100%;
            margin: 3px 0;
          }
          
          .nav-link {
            flex-direction: row;
            justify-content: flex-start;
          }
          
          .nav-icon {
            margin-right: 12px;
            margin-bottom: 0;
          }
          
          .nav-search-wrapper {
            max-width: none;
            margin: 10px 0;
          }
          
          .nav-actions {
            width: 100%;
            justify-content: space-between;
            margin-top: 15px;
            flex-wrap: wrap;
          }
          
          .add-btn {
            width: 100%;
            margin-top: 10px;
            padding: 10px;
            order: 1;
          }
          
          .vertical-divider {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default AdminNavbar;