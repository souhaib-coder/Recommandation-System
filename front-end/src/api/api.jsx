import axios from 'axios';
const API_URL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// 🔐 Auth
export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/api/connexion`, credentials);
  return res.data;
};

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/api/inscription`, userData);
  return res.data;
};

export const getDashboardData = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard`, {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du chargement du tableau de bord :", error.response?.data || error.message);
    throw error; // Relancer l'erreur pour permettre de la gérer dans le composant
  }
};

export const searchCours = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/cours`, {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche de cours :", error.response?.data || error.message);
    return [];
  }
};

export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/api/cours/details/${courseId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du cours :", error);
    throw error;
  }
};

// CORRECTION: Utiliser axios de manière cohérente avec les autres appels API
export const getCourseDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/cours/details/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du cours :", error.response?.data || error.message);
    throw error;
  }
};

// CORRECTION: Utiliser axios au lieu de fetch pour la cohérence
export const toggleFavorite = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/api/profil/favoris/ajouter/${id}`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la modification des favoris :", error.response?.data || error.message);
    throw error;
  }
};

// CORRECTION: Utiliser axios au lieu de fetch
export const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/admin/cours/delete/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du cours :", error.response?.data || error.message);
    throw error;
  }
};

// CORRECTION: Utiliser axios au lieu de fetch
export const submitReview = async (id, data) => {
  try {
    const response = await axios.post(`${API_URL}/api/cours/avis/${id}`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la soumission de l'avis :", error.response?.data || error.message);
    throw error;
  }
};