import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCourseDetails,
  toggleFavorite,
  deleteCourse,
  submitReview,
} from "../api/api";

const DetailCours = () => {
  const {id} = useParams();
  const [course, setCourse] = useState(null);
  const [admin, setAdmin] = useState(false); // à adapter selon login
  const [isFavorite, setIsFavorite] = useState(false);
  const [avisList, setAvisList] = useState([]);
  const [formData, setFormData] = useState({ note: "", commentaire: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getCourseDetails(id).then((data) => {
      setCourse(data.cours);
      setIsFavorite(data.cours.est_favori);
      setAvisList(data.avis || []);
      setAdmin(data.admin || false);
    });
  }, [id]);

  const handleToggleFavorite = async () => {
    await toggleFavorite(id);
    setIsFavorite(!isFavorite);
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      await deleteCourse(id);
      window.location.href = "/dashboard"; // ou navigate()
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const res = await submitReview(id, formData);
    setMessage("Avis soumis !");
    setAvisList((prev) => [...prev, res]);
    setFormData({ note: "", commentaire: "" });
  };

  if (!course) return <div className="container mt-4">Chargement...</div>;

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <h2 className="text-primary">{course.nom}</h2>
        <p className="text-muted">
          {course.domaine} - {course.niveau} - <i className="fas fa-eye"></i>{" "}
          {course.nombre_vues} vues
        </p>
        <p>
          <strong>Objectif :</strong> {course.objectifs}
        </p>

        {admin && (
          <div className="mb-3">
            <Link to={`/admin/modifier/${course.id_cours}`} className="btn btn-warning me-2">
              <i className="fas fa-edit"></i> Modifier
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <i className="fas fa-trash"></i> Supprimer
            </button>
          </div>
        )}

        <div className="mt-3">
          <button
            className={`btn ${
              isFavorite ? "btn-warning" : "btn-outline-warning"
            }`}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        {course.chemin_source?.endsWith(".mp4") ? (
          <video className="w-100 rounded shadow" controls>
            <source src={`/static/${course.chemin_source}`} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        ) : course.chemin_source?.endsWith(".pdf") ? (
          <iframe
            className="w-100 border rounded"
            src={`/static/${course.chemin_source}`}
            height="600px"
            title="PDF du cours"
          ></iframe>
        ) : null}
      </div>

      <h3 className="mt-4">Avis des utilisateurs</h3>
      {avisList.length > 0 ? (
        avisList.map((avis, i) => (
          <div key={i} className="card p-3 mb-2 shadow-sm">
            <p>
              <strong>Note :</strong>{" "}
              <span className="badge bg-primary">{avis.note}/5</span>
            </p>
            <p>
              <strong>Commentaire :</strong> {avis.commentaire}
            </p>
            <p className="text-muted">
              <i className="fas fa-calendar"></i> Posté le {avis.date}
            </p>
          </div>
        ))
      ) : (
        <p className="text-muted">Aucun avis pour ce cours.</p>
      )}

      <div className="card p-4 mt-4 shadow-sm">
        <h3>Laissez un avis sur ce cours</h3>
        <form onSubmit={handleSubmitReview}>
          <div className="mb-3">
            <label className="form-label">Note</label>
            <select
              className="form-control"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              required
            >
              <option value="">Choisissez...</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Commentaire</label>
            <textarea
              className="form-control"
              value={formData.commentaire}
              onChange={(e) =>
                setFormData({ ...formData, commentaire: e.target.value })
              }
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-success">
            Envoyer
          </button>
        </form>
        {message && <div className="mt-2 text-success">{message}</div>}
      </div>

      <div className="mt-4">
        <Link to="/cours" className="btn btn-secondary me-2">
          <i className="fas fa-arrow-left"></i> Retour
        </Link>
        <Link to="/dashboard" className="btn btn-primary">
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </Link>
      </div>
    </div>
  );
};

export default DetailCours;
