import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <Link className="navbar-brand" to="/"><b>DevStorm</b></Link>
      </nav>

      <div className="container text-center mt-5">
        <h1 className="mb-4">Bienvenue sur DevStorm</h1>
        <div className="d-grid gap-3 col-6 mx-auto">
          <Link to="/Login" className="btn btn-primary">Page de Connexion</Link>
          <Link to="/Register" className="btn btn-success">Page d'Inscription</Link>
        </div>
      </div>

      <footer className="mt-auto py-3 bg-light text-center">
        <p className="mb-0">&copy; 2025 DevStorm. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default Home;


