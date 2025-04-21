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
      const response = await axios.get(`${API_URL}/api/dashboard` , {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement du tableau de bord :", error.response?.data || error.message);

    }
  };
  // api/api.js

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
    const response = await axios.get(`${API_URL}/api/cours/details/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du cours :", error);
    throw error;
  }
};


export const getCourseDetails = async (id) => {
  const res = await fetch(`/api/cours/details/${id}`, {
    credentials: "include",
  });
  return res.json();
};

export const toggleFavorite = async (id) => {
  return fetch(`/api/profil/favoris/ajouter/${id}`, {
    method: "POST",
    credentials: "include",
  });
};

export const deleteCourse = async (id) => {
  return fetch(`/api/admin/cours/delete/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

export const submitReview = async (id, data) => {
  const res = await fetch(`/api/cours/avis/${id}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

  


