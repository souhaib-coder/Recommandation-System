import React, { useState, useEffect } from 'react';
import { addCourse, updateCourse, deleteCourse, AdminCours,checkAuth,checkAdmin } from '../api/api';
import { PlusCircle, Edit, Trash2, XCircle, Save, Eye, Book, FileText } from 'lucide-react';
import AdminNavbar from './navbars/AdminNavbar';
import { Link, useLocation, useNavigate } from "react-router-dom";


const AdminCourses = () => {

  const initialFormState = {
    nom: '',
    type_ressource: 'Cours',
    domaine: 'Informatique',
    langue: 'Français',
    niveau: 'Débutant',
    objectifs: 'Apprentissage',
    durée: '',
    type_contenu: 'fichier', // Nouveau champ pour distinguer fichier/lien
    url_cours: '', // Nouveau champ pour stocker l'URL
  };

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const [fichierCours, setFichierCours] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);
  const navigate = useNavigate(); // Hook de navigation
 


  
// Changer de page
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
  }
};
  // Fonction pour charger tous les cours
  const loadCourses = async () => {
    setLoading(true);
    try {
      const authStatus = await checkAuth();
        
        if (!authStatus.authenticated) {
          // L'utilisateur n'est pas connecté, redirection vers la page de connexion
          navigate('/auth', { replace: true });
          return;
        }

      const adminStatus = await checkAdmin();
        
        if (!adminStatus.isAdmin) {
          if (adminStatus.error === 'Non connecté') {
            navigate('/auth', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
          return;
        }

      const data = await AdminCours();
      setCourses(data);
    } catch (err) {
      setError("Erreur lors du chargement des cours");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    loadCourses();
  }, []);

  // Gestionnaire pour la modification des champs du formulaire
  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prevState => ({
    ...prevState,
    [name]: value
  }));
};

  // Gestionnaire pour le téléchargement de fichier
  // Gestion du changement de fichier
const handleFileChange = (e) => {
  if (e.target.files[0]) {
    setFichierCours(e.target.files[0]);
  }
};

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData(initialFormState);
    setFichierCours(null);
    setError('');
  };


  // Fonction pour charger les données d'un cours à modifier
// Fonction pour charger les données d'un cours à modifier
const editCourse = (course) => {
  const isTutorial = course.type_ressource === 'Tutoriel';
  
  // Déterminer le type de contenu (lien ou fichier)
  const isLink = course.chemin_source && 
                (course.chemin_source.startsWith('http://') || 
                 course.chemin_source.startsWith('https://'));
  
  // Définir le type de contenu correctement
  const type_contenu = isLink ? 'lien' : 'fichier';
  
  // Définir l'URL uniquement si c'est un lien
  const url_cours = isLink ? course.chemin_source : '';
  
  setFormData({
    nom: course.nom || '',
    type_ressource: course.type_ressource || 'Cours',
    domaine: course.domaine || 'Informatique',
    langue: course.langue || 'Français',
    niveau: course.niveau || 'Débutant',
    objectifs: course.objectifs || 'Apprentissage',
    durée: course.durée || '',
    type_contenu: type_contenu,
    url_cours: url_cours,
  });
  
  setEditingCourse(course);
  setShowAddForm(true);
  setFichierCours(null); // Réinitialiser le fichier
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  // Fonction pour soumettre le formulaire (ajouter ou modifier)
  // Fonction pour soumettre le formulaire (ajouter ou modifier)
// Fonction pour soumettre le formulaire (ajouter ou modifier)
// Fonction handleSubmit corrigée pour le formulaire React
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(''); // Réinitialiser les erreurs précédentes
  
  try {
    const formDataObj = new FormData();
    
    // Ajouter tous les champs du formulaire de base
    formDataObj.append('nom', formData.nom);
    formDataObj.append('type_ressource', formData.type_ressource);
    formDataObj.append('domaine', formData.domaine);
    formDataObj.append('langue', formData.langue);
    formDataObj.append('niveau', formData.niveau);
    formDataObj.append('objectifs', formData.objectifs);
    
    // Ajouter la durée uniquement si elle est définie
    if (formData.durée) {
      formDataObj.append('durée', formData.durée);
    }
    
    // Déterminer correctement le type de contenu
    const isTutorial = formData.type_ressource === 'Tutoriel';
    const type_contenu = isTutorial ? 'lien' : 'fichier';
    formDataObj.append('type_contenu', type_contenu);
    
    // Si c'est un tutoriel, ajouter l'URL
    if (isTutorial) {
      if (!formData.url_cours) {
        setError("Veuillez saisir une URL valide pour le tutoriel");
        setLoading(false);
        return;
      }
      formDataObj.append('url_cours', formData.url_cours);
    } 
    // Si c'est un cours avec fichier
    else {
      // Si on modifie un cours existant et qu'aucun nouveau fichier n'est fourni, c'est OK
      if (editingCourse && !fichierCours) {
        console.log("Mode édition sans nouveau fichier - on garde l'ancien fichier");
      } 
      // Si on ajoute un nouveau cours, le fichier est obligatoire
      else if (!editingCourse && !fichierCours) {
        setError("Veuillez sélectionner un fichier pour le cours");
        setLoading(false);
        return;
      }
      // Si un fichier est fourni, l'ajouter au formData
      else if (fichierCours) {
        formDataObj.append('fichier_cours', fichierCours);
      }
    }
    
    console.log("Soumission du formulaire:", {
      editing: !!editingCourse,
      type_ressource: formData.type_ressource,
      type_contenu: type_contenu
    });
    
    let result;
    if (editingCourse) {
      // Mode édition
      result = await updateCourse(editingCourse.id_cours, formDataObj);
    } else {
      // Mode ajout
      result = await addCourse(formDataObj);
    }
    
    console.log("Résultat de l'opération:", result);
    
    // Si succès
    resetForm();
    setShowAddForm(false);
    loadCourses(); // Recharger la liste des cours
  } catch (err) {
    console.error("Erreur dans handleSubmit:", err);
    
    // Afficher le message d'erreur le plus pertinent disponible
    setError(
      err.response?.data?.error || 
      err.response?.data?.message || 
      (err instanceof Error ? err.message : "Une erreur est survenue lors de l'opération")
    );
  } finally {
    setLoading(false);
  }
};

  // Fonction pour gérer la suppression d'un cours
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      try {
        await deleteCourse(id);
        loadCourses(); // Recharger la liste après suppression
      } catch (err) {
        setError("Erreur lors de la suppression du cours");
        console.error(err);
      }
    }
  };
  


  // Filtrer les cours en fonction du terme de recherche et du domaine
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === '' || course.domaine === filterDomain;
    return matchesSearch && matchesDomain;
  });

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);


  // Fonction pour obtenir la couleur de badge en fonction du domaine
  const getDomainColor = (domain) => {
    const colors = {
      'Informatique': '#4361ee',
      'Mathématiques': '#3a0ca3',
      'Physique': '#7209b7',
      'Chimie': '#f72585',
      'Langues': '#4cc9f0'
    };
    return colors[domain] || '#4895ef';
  };

  // Fonction pour obtenir l'icône en fonction du type de ressource
  const getResourceIcon = (type) => {
    switch(type) {
      case 'Cours': return <Book size={16} className="me-1" />;
      case 'Tutoriel': return <Eye size={16} className="me-1" />;
      case 'Livre': return <Book size={16} className="me-1" />;
      case 'TD': return <FileText size={16} className="me-1" />;
      default: return <FileText size={16} className="me-1" />;
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-grow" style={{color: "var(--primary-color)"}} role="status"></div>
        <div className="fw-bold ms-3">Chargement des cours...</div>
      </div>
    );
  }

  return (
    <div className="admin-courses" style={{background: "var(--light-bg)"}}>
      <AdminNavbar />
      
      {/* Hero Banner */}
      <div className="hero-section text-white position-relative" style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)`,
        minHeight: "200px",
        marginTop: "70px",
        padding: "2rem 0"
      }}>
        <div className="container position-relative" style={{zIndex: "2"}}>
          <div className="row align-items-center">
            <div className="col-lg-8 py-3">
              <h1 className="display-5 fw-bold mb-2">Gestion des Cours</h1>
              <p className="lead opacity-90 mb-0">Ajoutez, modifiez ou supprimez des cours pour votre plateforme éducative.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button 
                className="btn btn-light btn-lg px-4 py-2"
                style={{borderRadius: "var(--border-radius-sm)"}}
                onClick={() => {
                  resetForm();
                  setShowAddForm(!showAddForm);
                }}
              >
                {showAddForm ? (
                  <>
                    <XCircle size={20} className="me-2" />
                    Annuler
                  </>
                ) : (
                  <>
                    <PlusCircle size={20} className="me-2" />
                    Nouveau Cours
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="position-absolute bottom-0 start-0 w-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" style={{display: "block"}}>
            <path fill="var(--light-bg)" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </div>

      <div className="container py-4">
        {/* Notification d'erreur */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert" style={{borderRadius: "var(--border-radius-sm)"}}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
            <button 
              type="button" 
              className="btn-close ms-auto" 
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
{showAddForm && (
  <div className="card border-0 shadow-sm mb-4" style={{borderRadius: "var(--border-radius-sm)"}}>
    <div className="card-header py-3 bg-transparent">
      <h5 className="mb-0">
        <i className="bi bi-journal-plus me-2" style={{color: "var(--primary-color)"}}></i>
        {editingCourse ? 'Modifier le cours' : 'Ajouter un nouveau cours'}
      </h5>
    </div>
    <div className="card-body">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">Nom du cours</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="form-control"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
              required
            />
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Domaine</label>
            <select
              name="domaine"
              value={formData.domaine}
              onChange={handleChange}
              className="form-select"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
              required
            >
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
              <option value="Langues">Langues</option>
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Type de ressource</label>
            <select
              name="type_ressource"
              value={formData.type_ressource}
              onChange={(e) => {
                // Mettre à jour le type de contenu en fonction du type de ressource
                const newTypeContenu = e.target.value === 'Tutoriel' ? 'lien' : 'fichier';
                
                setFormData(prevState => ({
                  ...prevState,
                  type_ressource: e.target.value,
                  type_contenu: newTypeContenu
                }));
              }}
              className="form-select"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
              required
              disabled={editingCourse} // Désactiver le changement de type en mode édition
            >
              <option value="Tutoriel">Tutoriel</option>
              <option value="Cours">Cours</option>
              <option value="Livre">Livre</option>
              <option value="TD">TD</option>
            </select>
            {editingCourse && (
              <p className="form-text text-muted mt-1">
                <i className="bi bi-info-circle me-1"></i>
                Le type de ressource ne peut pas être modifié
              </p>
            )}
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Niveau</label>
            <select
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              className="form-select"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
              required
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Langue</label>
            <select
              name="langue"
              value={formData.langue}
              onChange={handleChange}
              className="form-select"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
              required
            >
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Arabe">Arabe</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Durée (en heures)</label>
            <input
              type="number"
              name="durée"
              value={formData.durée}
              onChange={handleChange}
              className="form-control"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
            />
          </div>
          
          <div className="col-md-12">
            <label className="form-label">Objectifs</label>
            <select
              name="objectifs"
              value={formData.objectifs}
              onChange={handleChange}
              className="form-select"
              style={{
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid #eaeaea",
                padding: "0.625rem 1rem",
                background: "var(--input-bg)"
              }}
              required
            >
              <option value="Révision">Révision</option>
              <option value="Préparation examen">Préparation examen</option>
              <option value="Apprentissage">Apprentissage</option>
              <option value="Approfondissement">Approfondissement</option>
            </select>
          </div>
          
          {/* Champ caché pour stocker le type de contenu */}
          <input 
            type="hidden" 
            name="type_contenu" 
            value={formData.type_contenu || (formData.type_ressource === 'Tutoriel' ? 'lien' : 'fichier')} 
          />
          
          {/* Affichage conditionnel basé sur le type de ressource */}
          {formData.type_ressource === 'Tutoriel' ? (
            <div className="col-md-12">
              <label className="form-label">URL du tutoriel</label>
              <input
                type="url"
                name="url_cours"
                value={formData.url_cours || ''}
                onChange={handleChange}
                className="form-control"
                style={{
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid #eaeaea",
                  padding: "0.625rem 1rem",
                  background: "var(--input-bg)"
                }}
                placeholder="https://example.com/tutoriel"
                required
                // Correction: Simplifier l'expression régulière pour les URL
                pattern="https?://.+"
                title="Veuillez entrer une URL valide (commençant par http:// ou https://)"
              />
              {editingCourse && (
                <p className="form-text text-muted mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Entrez une nouvelle URL pour remplacer l'actuelle
                </p>
              )}
            </div>
          ) : (
            <div className="col-md-12">
              <label className="form-label">Fichier du cours</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="form-control"
                style={{
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid #eaeaea",
                  padding: "0.625rem 1rem",
                  background: "var(--input-bg)"
                }}
                accept=".pdf,.docx,.pptx,.txt"
                required={!editingCourse}
              />
              {editingCourse && (
                <p className="form-text text-muted mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Laissez vide pour conserver le fichier actuel
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 d-flex">
          <button
            type="submit"
            className="btn px-4 py-2 me-2"
            style={{
              background: "var(--primary-color)",
              color: "var(--white)",
              borderRadius: "var(--border-radius-sm)"
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} className="me-2" />
                {editingCourse ? 'Mettre à jour' : 'Ajouter le cours'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddForm(false);
            }}
            className="btn px-4 py-2"
            style={{
              background: "var(--accent-bg)",
              color: "var(--text-dark)",
              borderRadius: "var(--border-radius-sm)"
            }}
          >
            <XCircle size={18} className="me-2" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Filtres et recherche */}
        <div className="card border-0 shadow-sm mb-4" style={{borderRadius: "var(--border-radius-sm)"}}>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text" style={{
                    background: "var(--input-bg)",
                    border: "1px solid #eaeaea",
                    borderRight: "none",
                    borderRadius: "var(--border-radius-sm) 0 0 var(--border-radius-sm)"
                  }}>
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher un cours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "0 var(--border-radius-sm) var(--border-radius-sm) 0",
                      border: "1px solid #eaeaea",
                      borderLeft: "none",
                      padding: "0.625rem 1rem",
                      background: "var(--input-bg)"
                    }}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  style={{
                    borderRadius: "var(--border-radius-sm)",
                    border: "1px solid #eaeaea",
                    padding: "0.625rem 1rem",
                    background: "var(--input-bg)"
                  }}
                >
                  <option value="">Tous les domaines</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Chimie">Chimie</option>
                  <option value="Langues">Langues</option>
                </select>
              </div>
              <div className="col-md-2 text-end">
                <button
                  onClick={loadCourses}
                  className="btn w-100 px-4 py-2"
                  style={{
                    background: "var(--accent-bg)",
                    color: "var(--text-dark)",
                    borderRadius: "var(--border-radius-sm)"
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des cours */}
        <div className="card border-0 shadow-sm" style={{borderRadius: "var(--border-radius-sm)"}}>
          <div className="card-header py-3 bg-transparent">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-journals me-2" style={{color: "var(--primary-color)"}}></i>
                Liste des cours ({filteredCourses.length})
              </h5>
              <div className="dropdown">
                <button className="btn btn-sm" style={{
                  background: "var(--accent-bg)",
                  color: "var(--text-dark)",
                  borderRadius: "var(--border-radius-sm)"
                }}>
                  <i className="bi bi-download me-2"></i>
                  Exporter
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{background: "var(--accent-bg)"}}>
                  <tr>
                    <th className="border-0 py-3">ID</th>
                    <th className="border-0 py-3">Nom</th>
                    <th className="border-0 py-3">Domaine</th>
                    <th className="border-0 py-3">Type</th>
                    <th className="border-0 py-3">Niveau</th>
                    <th className="border-0 py-3">Langue</th>
                    <th className="border-0 py-3 text-center">Vues</th>
                    <th className="border-0 py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <i className="bi bi-inbox me-2"></i>
                        Aucun cours trouvé
                      </td>
                    </tr>
                  ) : (
                    currentCourses.map((course) => (
                      <tr key={course.id_cours}>
                        <td className="py-3 align-middle">{course.id_cours}</td>
                        <td className="py-3 align-middle fw-medium">{course.nom}</td>
                        <td className="py-3 align-middle">
                          <span className="badge px-3 py-2" style={{                            
                            color: "white",
                            background: getDomainColor(course.domaine),
                            borderRadius: "var(--border-radius-sm)"
                          }}>
                            {course.domaine}
                          </span>
                        </td>
                        <td className="py-3 align-middle">
                          <span className="badge bg-light text-dark px-3 py-2" style={{
                            borderRadius: "var(--border-radius-sm)"
                          }}>
                            {getResourceIcon(course.type_ressource)}
                            {course.type_ressource}
                          </span>
                        </td>
                        <td className="py-3 align-middle">
                          {course.niveau === 'Débutant' && <span className="text-success fw-medium">{course.niveau}</span>}
                          {course.niveau === 'Intermédiaire' && <span className="text-warning fw-medium">{course.niveau}</span>}
                          {course.niveau === 'Avancé' && <span className="text-danger fw-medium">{course.niveau}</span>}
                        </td>
                        <td className="py-3 align-middle">{course.langue}</td>
                        <td className="py-3 align-middle text-center">
                          <span className="badge bg-light text-dark px-3 py-2" style={{
                            borderRadius: "var(--border-radius-sm)"
                          }}>
                            <i className="bi bi-eye me-1"></i>
                            {course.nombre_vues || 0}
                          </span>
                        </td>
                        <td className="py-3 align-middle text-end">
                          <div className="btn-group">
                            <button
                              onClick={() => editCourse(course)}
                              className="btn btn-sm mx-1"
                              style={{
                                background: "rgba(58, 12, 163, 0.1)",
                                color: "#3a0ca3",
                                borderRadius: "var(--border-radius-sm)"
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id_cours)}
                              className="btn btn-sm mx-1"
                              style={{
                                background: "rgba(247, 37, 133, 0.1)",
                                color: "#f72585",
                                borderRadius: "var(--border-radius-sm)"
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer bg-transparent py-3">
  <div className="d-flex justify-content-between align-items-center">
    <div>
      <small className="text-muted">
        Affichage de {indexOfFirstCourse + 1}-{Math.min(indexOfLastCourse, filteredCourses.length)} cours sur {filteredCourses.length} au total
      </small>
    </div>
    <nav aria-label="Page navigation">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
        </li>
        
        {/* Générer dynamiquement les numéros de page */}
        {Array.from({ length: totalPages }, (_, i) => {
          // Pour limiter le nombre de pages affichées
          if (
            i === 0 || // Toujours afficher la première page
            i === totalPages - 1 || // Toujours afficher la dernière page
            (i >= currentPage - 2 && i <= currentPage + 0) // Afficher quelques pages autour de la page actuelle
          ) {
            return (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => paginate(i + 1)}>
                  {i + 1}
                </button>
              </li>
            );
          }
          
          // Afficher des points de suspension pour les pages omises
          if (i === currentPage + 1 || i === currentPage - 3) {
            return (
              <li key={i} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }
          
          return null;
        })}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </li>
      </ul>
    </nav>
  </div>
</div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 mt-5" style={{background: "var(--text-dark)", color: "var(--white)"}}>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-lightning-charge-fill me-2"></i>DevStorm
              </h5>
              <p style={{color: "var(--text-light)"}}>Plateforme mondiale d'éducation et de formation en ligne.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0" style={{color: "var(--text-light)"}}>© 2025 DevStorm. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* CSS personnalisé */}
      <style jsx>{`
        
        .btn-icon {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--text-light);
          background: var(--accent-bg);
        }
        
        .btn-icon:hover {
          color: var(--primary-color);
          background: rgba(var(--primary-color-rgb), 0.1);
        }
        
        .table th, .table td {
          padding: 0.75rem 1rem;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.25rem rgba(var(--primary-color-rgb), 0.25);
        }
        
        .pagination .page-link {
          color: var(--primary-color);
        }
        
        .pagination .page-item.active .page-link {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }
        
        @media (max-width: 767.98px) {
          .hero-section {
            text-align: center;
          }
          
          .col-lg-4.text-lg-end {
            text-align: center !important;
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCourses;