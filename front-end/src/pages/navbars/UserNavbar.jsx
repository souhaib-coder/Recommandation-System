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
  
  // Navigation items definition
  const navItems = [
    { to: "/Dashboard", label: "Dashboard", icon: "speedometer2" },
    { to: "/user/favorites", label: "Favoris", icon: "heart-fill" },
    { to: "/user/history", label: "Historique", icon: "clock-history" },
    { to: "/user/profile", label: "Profil", icon: "person-circle" },
  ];

  // Scroll effect for navbar
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
    if (onSearch && typeof onSearch === 'function') onSearch(search);
    setNavbarOpen(false);
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
              <div className="logo-text">DevStorm</div>
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
          
          {/* Navigation menu */}
          <div className={`collapse navbar-collapse ${navbarOpen ? "show" : ""}`}>
            {/* Search bar */}
            <div className="nav-search-wrapper me-auto ms-lg-4">
              <form onSubmit={handleSearch} className="w-100">
                <div className={`nav-search-main ${searchFocused ? 'focused' : ''}`}>
                  <i className="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher un cours, un sujet..." 
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
            
            {/* Action buttons */}
            <div className="nav-actions ms-3">
              <button className="btn btn-icon notification-btn position-relative">
                <i className="bi bi-bell-fill"></i>
                <span className="notification-badge">3</span>
                <span className="notification-pulse"></span>
              </button>
              
              <div className="vertical-divider"></div>
              
              <Link className="btn btn-primary rounded-pill logout-btn" to="/logout">
                <span className="d-none d-md-inline me-2">Déconnexion</span>
              </Link>
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
        }
        
        /* Search */
        .nav-search-wrapper {
          max-width: 400px;
          width: 100%;
        }
        
        .nav-search-main {
          background: rgba(240, 240, 240, 0.5);
          border-radius: 100px;
          padding: 0.5rem 1rem; /* Smaller */
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
          border-color: rgba(71, 118, 230, 0.5);
          box-shadow: 0 0 0 3px rgba(71, 118, 230, 0.1);
        }
        
        .search-icon, .search-input-main, .search-submit-btn {
          color: #333; /* Black initially */
          transition: all 0.3s ease;
        }
        
        .nav-search-main.focused .search-icon,
        .nav-search-main.focused .search-submit-btn {
          color: #4776E6;
        }
        
        .search-input-main {
          background: transparent;
          border: none;
          outline: none;
          flex-grow: 1;
          font-size: 14px; /* Smaller */
          color: #333; /* Black initially */
        }
        
        .search-submit-btn {
          background: transparent;
          border: none;
          width: 32px; /* Smaller */
          height: 32px; /* Smaller */
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
          height: 2px; /* Thinner */
          border-radius: 2px;
          background: linear-gradient(90deg, #4776E6, #8E54E9);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }
        
        .nav-item {
          position: relative;
          margin: 0 8px; /* Smaller margin */
        }
        
        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 12px; /* Smaller padding */
          transition: all 0.3s ease;
          color: #333; /* Black initially */
          font-weight: 500;
        }
        
        .nav-link.active {
          color: #4776E6;
        }
        
        .nav-link:hover {
          color: #4776E6;
        }
        
        .nav-icon {
          font-size: 1.1rem; /* Smaller */
          margin-bottom: 2px; /* Smaller */
          transition: all 0.3s ease;
        }
        
        .nav-link:hover .nav-icon {
          transform: translateY(-3px); /* Smaller movement */
        }
        
        .nav-label {
          font-size: 0.7rem; /* Smaller */
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Hamburger */
        .hamburger-button {
          width: 36px; /* Smaller */
          height: 36px; /* Smaller */
          border: none;
          background: rgba(240, 240, 240, 0.5);
          border-radius: 6px; /* Smaller */
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 8px; /* Smaller */
          transition: all 0.3s ease;
        }
        
        .hamburger-line {
          width: 100%;
          height: 2px;
          background-color: #333; /* Black initially */
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .hamburger-button.active .hamburger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg); /* Adjusted */
        }
        
        .hamburger-button.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger-button.active .hamburger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg); /* Adjusted */
        }
        
        /* Action buttons */
        .nav-actions {
          display: flex;
          align-items: center;
        }
        
        .btn-icon {
          width: 36px; /* Smaller */
          height: 36px; /* Smaller */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(240, 240, 240, 0.5);
          color: #333; /* Black initially */
          font-size: 1rem; /* Smaller */
          transition: all 0.3s ease;
          position: relative;
        }
        
        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px; /* Smaller */
          height: 18px; /* Smaller */
          border-radius: 50%;
          background: #FF5757;
          color: white;
          font-size: 0.65rem; /* Smaller */
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
          width: 18px; /* Smaller */
          height: 18px; /* Smaller */
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
          height: 20px; /* Smaller */
          background: rgba(0, 0, 0, 0.1); /* Dark initially */
          margin: 0 12px; /* Smaller */
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
          border: none;
          padding: 0.4rem 1.2rem; /* Smaller */
          transition: all 0.3s ease;
          box-shadow: 0 3px 10px rgba(71, 118, 230, 0.2);
          font-weight: 600;
          font-size: 0.9rem; /* Smaller */
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
          }
          
          .logout-btn {
            width: 100%;
            margin-top: 10px;
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default UserNavbar;