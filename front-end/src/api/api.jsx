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


export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/deconnexion`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error.response?.data || error.message);
    throw error;
  }
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
    // Ajout d'un timestamp pour éviter la mise en cache du navigateur ou des CDN
    const timestamp = Date.now();
    const response = await axios.get(`${API_URL}/api/cours`, {
      params: { ...params, _t: timestamp },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche de cours :", error.response?.data || error.message);
    return [];
  }
};


export const AdminCours = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/cours`, {
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



// In api.jsx
export const submitReview = async (id, data) => {
  try {
    // Make sure data has the expected structure for WTForms
    const formData = {
      note: parseInt(data.note), // WTForms expects an integer
      commentaire: data.commentaire || ''
    };
    
    const response = await axios.post(`${API_URL}/api/cours/avis/${id}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la soumission de l'avis :", error.response?.data || error.message);
    throw error;
  }
};

// Fonctions pour le tableau de bord administrateur

// Récupérer les statistiques générales de l'application// Fonctions pour le tableau de bord administrateur

// Récupérer les statistiques générales de l'application
export const getAdminStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques admin :", error.response?.data || error.message);
    throw error;
  }
};

// Récupérer les cours les plus populaires
export const getTopCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/top-courses`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours populaires :", error.response?.data || error.message);
    throw error;
  }
};

// Récupérer l'activité des cours sur une période donnée
export const getCoursesActivity = async (timeFrame = 'week') => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/courses-activity`, {
      params: { timeFrame },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité des cours :", error.response?.data || error.message);
    throw error;
  }
};

// Récupérer l'activité des utilisateurs sur une période donnée
export const getUsersActivity = async (timeFrame = 'week') => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/users-activity`, {
      params: { timeFrame },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité utilisateurs :", error.response?.data || error.message);
    throw error;
  }
};

// Ne pas modifier cette fonction si elle existe déjà dans votre code
// Nous laissons la méthode POST puisque c'est ce que votre backend attend

// Fonction pour supprimer un cours (correction - changé de méthode HTTP DELETE à POST)
export const deleteCourse = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/cours/delete/${id}`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du cours :", error.response?.data || error.message);
    throw error;
  }
};

// Ajouter un nouveau cours
export const addCourse = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/cours/ajouter`,
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du cours :", error.response?.data || error.message);
    throw error;
  }
};

// Mettre à jour un cours existant
export const updateCourse = async (courseId, formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/cours/update/${courseId}`,
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours :", error.response?.data || error.message);
    throw error;
  }
};


////////profile
// Routes du profil utilisateur
export const fetchProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/user/profile`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

// Mettre à jour les informations personnelles de l'utilisateur
export const updateProfileInfo = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/user/update`, userData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

// Mettre à jour les préférences d'apprentissage de l'utilisateur
export const updatePreferences = async (preferencesData) => {
  try {
    const response = await axios.put(`${API_URL}/api/user/profil/update`, preferencesData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    throw error;
  }
};

// Changer le mot de passe de l'utilisateur
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(`${API_URL}/api/user/password/reset`, passwordData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
};

// Supprimer le compte utilisateur
export const deleteAccount = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/user/supprimer`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    throw error;
  }
};

// Route des favoris
export const getFavorites = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/profil/favoris`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    throw error;
  }
};

// Ajouter un cours aux favoris
export const addToFavorites = async (coursId) => {
  try {
    const response = await axios.post(`${API_URL}/api/profil/favoris/add/${coursId}`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    throw error;
  }
};

// Supprimer un cours des favoris
export const removeFavorite = async (favoriteId) => {
  try {
    const response = await axios.post(`${API_URL}/api/profil/favoris/delete/${favoriteId}`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    throw error;
  }
};

// Route de l'historique
export const getHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/profil/historique`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
};

// Effacer l'historique de consultation
export const clearHistory = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/profil/historique/clear`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'effacement de l\'historique:', error);
    throw error;
  }
};