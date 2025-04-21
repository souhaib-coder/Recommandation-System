import './App.css';
import {Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DetailCours from './pages/DetailCours';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/Register' element={<Register />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/DetailCours/:id" element={<DetailCours />} />
      </Routes>
    </>
  );
}

export default App;
