// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/api';

function Register() {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', confirmation_password: '',
    domaine_intérêt: '', objectifs: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmation_password) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const data = await register(form);
      if (data.success) {
        navigate('/login');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l inscription.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 mx-auto shadow" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-3">Inscription</h2>
        <form onSubmit={handleSubmit}>
          {['nom', 'prenom', 'email'].map(field => (
            <div className="mb-3" key={field}>
              <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="form-control" name={field} onChange={handleChange} required />
            </div>
          ))}
          <div className="mb-3">
            <label>Mot de passe</label>
            <input type="password" className="form-control" name="password" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Confirmation</label>
            <input type="password" className="form-control" name="confirmation_password" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Domaine d’intérêt</label>
            <select className="form-select" name="domaine_intérêt" onChange={handleChange} required>
              <option value="">Choisir un domaine</option>
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Langues">Langues</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Objectifs</label>
            <select className="form-select" name="objectifs" onChange={handleChange} required>
              <option value="">Choisir un objectif</option>
              <option value="Révision">Révision</option>
              <option value="Préparation examen">Préparation examen</option>
              <option value="Apprentissage">Apprentissage</option>
              <option value="Approfondissement">Approfondissement</option>
            </select>
          </div>
          {message && <div className="alert alert-danger">{message}</div>}
          <button className="btn btn-success w-100">S'inscrire</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
