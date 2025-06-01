import axios from 'axios';
const API_URL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// 🔐 Auth - Ces fonctions existent déjà dans votre API
export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/api/connexion`, credentials);
  return res.data;
};

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/api/inscription`, userData);
  return res.data;
};

// Nouvelles fonctions à ajouter pour la gestion de mot de passe
export const forgotPassword = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/api/forgot-password`, data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation du mot de passe:", error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/api/reset-password`, {
      token: token,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error.response?.data || error.message);
    throw error;
  }
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
////////////////////

// Fonction pour vérifier si l'utilisateur est connecté
export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/check`);
    return { authenticated: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { authenticated: false };
    }
    throw error;
  }
};

// Fonction pour vérifier si l'utilisateur est admin
export const checkAdmin = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/check`);
    return { isAdmin: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return { isAdmin: false, error: 'Accès refusé' };
    } else if (error.response && error.response.status === 401) {
      return { isAdmin: false, error: 'Non connecté' };
    }
    throw error;
  }
};





///////////////
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
// Amélioration des fonctions d'API pour une meilleure gestion des erreurs
// et des réponses du serveur

// Suppression d'un cours
export const deleteCourse = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/cours/delete/${id}`, {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du cours :", error);
    // Récupérer le message d'erreur spécifique si disponible
    const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          error.message || 
                          "Erreur lors de la suppression du cours";
    throw new Error(errorMessage);
  }
};
// Fonctions API corrigées

// Ajout d'un nouveau cours avec meilleure gestion des formData
export const addCourse = async (formData) => {
  try {
    // Vérification côté client des données essentielles
    const type_ressource = formData.get('type_ressource');
    const type_contenu = formData.get('type_contenu') || (type_ressource === 'Tutoriel' ? 'lien' : 'fichier');
    
    // Debug: Afficher le contenu du formData pour vérification
    console.log("Type de ressource:", type_ressource);
    console.log("Type de contenu:", type_contenu);
    
    // Validation des données selon le type de contenu
    if (type_contenu === 'lien' && !formData.get('url_cours')) {
      throw new Error("L'URL est obligatoire pour les tutoriels");
    }
    
    if (type_contenu === 'fichier') {
      const fichier = formData.get('fichier_cours');
      if (!fichier || (fichier instanceof File && fichier.size === 0)) {
        throw new Error("Le fichier est obligatoire pour ce type de cours");
      }
    }
    
    // S'assurer que le type_contenu est correctement défini
    formData.set('type_contenu', type_contenu);
    
    // Envoyer la requête avec les entêtes appropriés
    const response = await axios.post(
      `${API_URL}/api/admin/cours/ajouter`,
      formData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data' // Important pour l'upload de fichiers
        },
        timeout: 60000 // Augmenter le timeout pour les grands fichiers
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du cours :", error);
    
    // Analyse détaillée des erreurs
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(", ");
      throw new Error(errorMessages || "Erreur de validation du formulaire");
    }
    
    // Si le serveur renvoie un message d'erreur spécifique
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw error;
  }
};

// Mise à jour d'un cours existant
export const updateCourse = async (courseId, formData) => {
  try {
    // S'assurer que l'ID du cours est dans le formData
    formData.set('id_cours', courseId);
    
    // Récupérer et vérifier le type de contenu
    const type_ressource = formData.get('type_ressource');
    const type_contenu = formData.get('type_contenu') || (type_ressource === 'Tutoriel' ? 'lien' : 'fichier');
    
    // S'assurer que le type_contenu est correctement défini
    formData.set('type_contenu', type_contenu);
    
    // Debug: Afficher le contenu du formData pour vérification
    console.log("Mise à jour du cours ID:", courseId);
    console.log("Type de ressource:", type_ressource);
    console.log("Type de contenu:", type_contenu);
    
    const response = await axios.post(`${API_URL}/api/admin/cours/update/${courseId}`,formData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data' // Important pour l'upload de fichiers
        },
        timeout: 60000 // Augmenter le timeout pour les grands fichiers
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours :", error);
    
    // Gestion détaillée des erreurs
    if (error.code === 'ECONNABORTED') {
      throw new Error("La requête a pris trop de temps, veuillez réessayer");
    }
    
    if (error.response?.status === 413) {
      throw new Error("Le fichier est trop volumineux");
    }
    
    // Si le serveur renvoie un message d'erreur spécifique
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Pour les erreurs de validation du formulaire
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(", ");
      throw new Error(errorMessages || "Erreur de validation du formulaire");
    }
    
    const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la mise à jour du cours";
    throw new Error(errorMessage);
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

//////////////users 


// Fonctions d'API simplifiées
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/users`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { 
      role: role // Envoi sans accent comme attendu par le backend
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};



////////////////


export const getUserProgressions = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/progression`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des progressions :", error.response?.data || error.message);
    throw error;
  }
};

// Récupérer la progression de l'utilisateur dans un cours spécifique
export const getCourseProgression = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/api/progression/${courseId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression du cours :", error.response?.data || error.message);
    throw error;
  }
};

// Mettre à jour la progression de l'utilisateur dans un cours
export const updateCourseProgression = async (courseId, progressionData) => {
  try {
    const response = await axios.post(`${API_URL}/api/progression/${courseId}`, progressionData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la progression :", error.response?.data || error.message);
    throw error;
  }
};