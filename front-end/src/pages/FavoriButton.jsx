// FavoriButton.js
import React, { useState } from 'react';
import axios from 'axios';

const FavoriButton = ({ idCours, isFavoriInitial, onToggle }) => {
  const [isFavori, setIsFavori] = useState(isFavoriInitial);

  const toggleFavori = async () => {
    try {
      await axios.post(`http://localhost:5000/api/profil/favoris/ajouter_retirer/${idCours}`, null, {
        withCredentials: true
      });
      setIsFavori(!isFavori);
      if (onToggle) onToggle(idCours, !isFavori); // Optionnel : callback pour informer le parent
    } catch (err) {
      console.error("Erreur lors de l'ajout/retrait du favori", err);
    }
  };

  return (
    <button 
      className="btn btn-sm p-0 border-0 bg-transparent" 
      onClick={toggleFavori} 
      title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <i 
        className={`bi ${isFavori ? 'bi-bookmark-fill' : 'bi-bookmark'}`} 
        style={{ fontSize: "1.25rem", color: "#ffc107", transition: "0.3s" }}
      ></i>
    </button>
  );
};

export default FavoriButton;
