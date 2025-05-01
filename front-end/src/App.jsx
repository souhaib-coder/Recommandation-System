import './App.css';
import {Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DetailCours from './pages/DetailCours';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Favoris from './pages/Favoris';
import AuthPage from './pages/authPage';
import ResetPasswordPage from './pages/ResetPassword';
function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/auth' element={<AuthPage />} />
        <Route path='/ResetPassword' element={<ResetPasswordPage />} />
        <Route path='/Logout' element={<logout />} />
        <Route path='/Profile' element={<Profile />} />
        <Route path='/Register' element={<Register />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Favoris" element={<Favoris />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/DetailCours/:id" element={<DetailCours />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </>
  );
}

export default App;
