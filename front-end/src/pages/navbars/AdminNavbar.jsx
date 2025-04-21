import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const UserNavbar = () => {
  const [activeLink, setActiveLink] = useState("/user/dashboard");
  
  // Détecter les changements de route et définir l'élément actif
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath) {
      setActiveLink(currentPath);
    }
  }, []);

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo à gauche */}
      <div className="flex items-center">
        <div className="bg-blue-600 text-white p-2 rounded-lg mr-2">
          <i className="bi bi-lightning-charge-fill"></i>
        </div>
        <Link to="/" className="text-blue-600 font-bold text-xl">DevStorm</Link>
      </div>
      
      {/* Barre de recherche (uniquement sur desktop) */}
      <div className="hidden md:block mx-4 bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-md">
        <div className="flex items-center">
          <i className="bi bi-search text-gray-500 mr-2"></i>
          <input 
            type="text" 
            placeholder="Rechercher un cours..." 
            className="bg-transparent border-none outline-none w-full text-gray-700"
          />
        </div>
      </div>
      
      {/* Navigation principale et actions */}
      <div className="flex items-center space-x-6">
        {/* Icônes de navigation */}
        <div className="flex items-center space-x-8">
          <Link 
            to="/user/dashboard" 
            className={`flex flex-col items-center ${activeLink === "/user/dashboard" ? "text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveLink("/user/dashboard")}
          >
            <i className="bi bi-speedometer2 text-xl"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          
          <Link 
            to="/user/favorites" 
            className={`flex flex-col items-center ${activeLink === "/user/favorites" ? "text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveLink("/user/favorites")}
          >
            <i className="bi bi-heart-fill text-xl"></i>
            <span className="text-xs mt-1">Favoris</span>
          </Link>
          
          <Link 
            to="/user/history" 
            className={`flex flex-col items-center ${activeLink === "/user/history" ? "text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveLink("/user/history")}
          >
            <i className="bi bi-clock-history text-xl"></i>
            <span className="text-xs mt-1">Historique</span>
          </Link>
          
          <Link 
            to="/user/profile" 
            className={`flex flex-col items-center ${activeLink === "/user/profile" ? "text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveLink("/user/profile")}
          >
            <i className="bi bi-person-circle text-xl"></i>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button className="text-gray-500 text-xl">
            <i className="bi bi-bell-fill"></i>
          </button>
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </div>
        </div>
        
        {/* Bouton déconnexion */}
        <Link 
          to="/logout" 
          className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Déconnexion <i className="bi bi-box-arrow-right ml-1"></i>
        </Link>
      </div>
    </nav>
  );
};

export default UserNavbar;