import React, { useState, useEffect } from 'react';
import { getAdminStats, getTopCourses, getCoursesActivity, getUsersActivity,checkAuth,checkAdmin } from '../api/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import AdminNavbar from './navbars/AdminNavbar';
import { Link, useNavigate } from "react-router-dom";


const COLORS = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#4895ef'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [topCourses, setTopCourses] = useState([]);
  const [coursesActivity, setCoursesActivity] = useState([]);
  const [usersActivity, setUsersActivity] = useState([]);
  const [timeFrame, setTimeFrame] = useState('week');
  const navigate = useNavigate(); // Hook de navigation


  useEffect(() => {
    const fetchData = async () => {
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
        setLoading(true);
        
        // Fetch general statistics
        const statsData = await getAdminStats();
        setStats(statsData);
        
        // Fetch top courses by views/ratings
        const topCoursesData = await getTopCourses();
        setTopCourses(topCoursesData);
        
        // Fetch courses activity over time
        const coursesActivityData = await getCoursesActivity(timeFrame);
        setCoursesActivity(coursesActivityData);
        
        // Fetch users activity over time
        const usersActivityData = await getUsersActivity(timeFrame);
        setUsersActivity(usersActivityData);
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
        setError("Impossible de charger les données du tableau de bord administrateur");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeFrame]);

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-grow" style={{color: "var(--primary-color)"}} role="status"></div>
        <div className="fw-bold ms-3">Chargement du tableau de bord administrateur...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{background: "var(--light-bg)"}}>
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
            <div className="col-lg-12 py-3">
              <h1 className="display-5 fw-bold mb-2">Tableau de bord administrateur</h1>
              <p className="lead opacity-90 mb-0">Gérez votre plateforme éducative avec des analyses détaillées et en temps réel.</p>
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
        {/* Time Frame Selector */}
        <div className="d-flex justify-content-end mb-4">
          <div className="card border-0 shadow-sm" style={{borderRadius: "var(--border-radius-sm)"}}>
            <div className="card-body d-flex align-items-center p-2 ps-3">
              <label htmlFor="timeFrameSelect" className="me-2 mb-0">
                <i className="bi bi-calendar3 me-2" style={{color: "var(--primary-color)"}}></i>
                Période:
              </label>
              <select 
                id="timeFrameSelect" 
                className="form-select form-select-sm" 
                value={timeFrame} 
                onChange={handleTimeFrameChange}
                style={{
                  borderRadius: "var(--border-radius-sm)",
                  background: "var(--input-bg)",
                  width: "200px"
                }}
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="year">12 derniers mois</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* General Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 p-2 rounded-circle" style={{background: "rgba(67, 97, 238, 0.1)"}}>
                    <i className="bi bi-people-fill" style={{color: "#4361ee", fontSize: "1.5rem"}}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Utilisateurs</h6>
                    <h3 className="mb-0 fw-bold">{stats.totalUsers}</h3>
                  </div>
                </div>
                <div className="progress" style={{height: "4px", borderRadius: "var(--border-radius-sm)"}}>
                  <div className="progress-bar" role="progressbar" style={{width: "70%", background: "#4361ee"}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 p-2 rounded-circle" style={{background: "rgba(58, 12, 163, 0.1)"}}>
                    <i className="bi bi-journals" style={{color: "#3a0ca3", fontSize: "1.5rem"}}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Total Cours</h6>
                    <h3 className="mb-0 fw-bold">{stats.totalCourses}</h3>
                  </div>
                </div>
                <div className="progress" style={{height: "4px", borderRadius: "var(--border-radius-sm)"}}>
                  <div className="progress-bar" role="progressbar" style={{width: "85%", background: "#3a0ca3"}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 p-2 rounded-circle" style={{background: "rgba(114, 9, 183, 0.1)"}}>
                    <i className="bi bi-eye-fill" style={{color: "#7209b7", fontSize: "1.5rem"}}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Consultations Aujourd'hui</h6>
                    <h3 className="mb-0 fw-bold">{stats.viewsToday}</h3>
                  </div>
                </div>
                <div className="progress" style={{height: "4px", borderRadius: "var(--border-radius-sm)"}}>
                  <div className="progress-bar" role="progressbar" style={{width: "65%", background: "#7209b7"}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 p-2 rounded-circle" style={{background: "rgba(247, 37, 133, 0.1)"}}>
                    <i className="bi bi-person-plus-fill" style={{color: "#f72585", fontSize: "1.5rem"}}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">Nouveaux Utilisateurs (7j)</h6>
                    <h3 className="mb-0 fw-bold">{stats.newUsersLastWeek}</h3>
                  </div>
                </div>
                <div className="progress" style={{height: "4px", borderRadius: "var(--border-radius-sm)"}}>
                  <div className="progress-bar" role="progressbar" style={{width: "50%", background: "#f72585"}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="row g-4 mb-4">
          {/* Course Activity Chart */}
          <div className="col-xl-8">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-header py-3 bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-activity me-2" style={{color: "var(--primary-color)"}}></i>
                    Activité des cours
                  </h5>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-icon" type="button">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={coursesActivity}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Line 
                        type="monotone" 
                        dataKey="consultations" 
                        stroke="#4361ee" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }} 
                        name="Consultations"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="favoris" 
                        stroke="#7209b7" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }} 
                        name="Ajouts aux favoris" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Resource Type Distribution */}
          <div className="col-xl-4">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-header py-3 bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-pie-chart-fill me-2" style={{color: "var(--primary-color)"}}></i>
                    Types de ressources
                  </h5>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-icon" type="button">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats.resourceTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats.resourceTypeDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Row 2 */}
        <div className="row g-4 mb-4">
          {/* Users Activity */}
          <div className="col-xl-6">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-header py-3 bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-graph-up me-2" style={{color: "var(--primary-color)"}}></i>
                    Activité des utilisateurs
                  </h5>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-icon" type="button">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={usersActivity}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar 
                        dataKey="nouveauxUtilisateurs" 
                        name="Nouveaux utilisateurs" 
                        fill="#4361ee" 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="utilisateursActifs" 
                        name="Utilisateurs actifs" 
                        fill="#7209b7" 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Domain Distribution */}
          <div className="col-xl-6">
            <div className="card border-0 shadow-sm h-100" style={{borderRadius: "var(--border-radius-sm)"}}>
              <div className="card-header py-3 bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart-fill me-2" style={{color: "var(--primary-color)"}}></i>
                    Distribution par domaine
                  </h5>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-icon" type="button">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={stats.domainDistribution}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        width={110}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: "rgba(255,255,255,0.9)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Nombre de cours" 
                        fill="#4cc9f0"
                        radius={[0, 4, 4, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Courses Table */}
        <div className="card border-0 shadow-sm mb-4" style={{borderRadius: "var(--border-radius-sm)"}}>
          <div className="card-header py-3 bg-transparent">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-trophy-fill me-2" style={{color: "var(--primary-color)"}}></i>
                Top 10 des cours les plus consultés
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
                    <th className="border-0">Nom du cours</th>
                    <th className="border-0">Domaine</th>
                    <th className="border-0">Type</th>
                    <th className="border-0 text-end">Vues</th>
                    <th className="border-0 text-end">Note moyenne</th>
                    <th className="border-0 text-end">Favoris</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((course) => (
                    <tr key={course.id_cours}>
                      <td className="align-middle fw-medium">{course.nom}</td>
                      <td>
                        <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                          {course.domaine}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{background: "var(--accent-bg)", color: "var(--text-dark)"}}>
                          {course.type_ressource}
                        </span>
                      </td>
                      <td className="text-end">
                        <span className="badge bg-light text-dark">
                          <i className="bi bi-eye me-1"></i>
                          {course.nombre_vues}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end">
                          <i className="bi bi-star-fill me-1" style={{color: "#ffc107"}}></i>
                          <span>{course.moyenne_note.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="text-end">
                        <span className="badge bg-light text-dark">
                          <i className="bi bi-heart me-1"></i>
                          {course.nombre_favoris}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-icon">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-icon">
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer bg-transparent text-end">
            <Link to='/admin/courses' className="btn btn-sm" style={{
              background: "var(--primary-color)",
              color: "var(--white)",
              borderRadius: "var(--border-radius-sm)"
            }}>
              Voir tous les cours
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 mt-2" style={{background: "var(--text-dark)", color: "var(--white)"}}>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-lightning-charge-fill me-2"></i>DocStorm
              </h5>
              <p style={{color: "var(--text-light)"}}>Plateforme mondiale d'éducation et de formation en ligne.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0" style={{color: "var(--text-light)"}}>© 2025 DocStorm. Tous droits réservés.</p>
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;