import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Current Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import DashboardLayout from './components/layout/DashboardLayout';
import StudentHome from './pages/student/StudentHome';
import StudentProfile from './pages/student/StudentProfile';
import HostelBooking from './pages/student/HostelBooking';
import BookingRooms from './pages/student/BookingRooms';
import MessMenu from './pages/student/MessMenu';
import HostelInfo from './pages/student/HostelInfo';
import Payment from './pages/student/Payment';
import Receipt from './pages/student/Receipt';
import StudentComplaints from './pages/student/StudentComplaints';
import StudentSupport from './pages/student/StudentSupport';
import StudentAchievements from './pages/student/StudentAchievements';
import StudentNotices from './pages/student/StudentNotices';
import StudentRoomChat from './pages/student/StudentRoomChat';
import VerifyCard from './pages/VerifyCard';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import ManageApplications from './pages/admin/ManageApplications';
import RoomManagement from './pages/admin/RoomManagement';
import ManageNotices from './pages/admin/ManageNotices';
import AdminProfile from './pages/admin/AdminProfile';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminAchievements from './pages/admin/AdminAchievements';
import ManageStudents from './pages/admin/ManageStudents';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Set loading to true while we verify the role
      setLoading(true);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const response = await axios.post('/api/users', {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          let userRole = response.data?.user?.role || 'student';
          const normalizedRole = userRole.toLowerCase() === 'admin' ? 'admin' : 'student';
          console.log("Logged in user role:", normalizedRole);
          setRole(normalizedRole);
        } catch (err) {
          console.error("Auth sync error:", err);
          setRole('student');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
        <div className="spinner-border text-primary shadow-sm mb-3" style={{width: '3rem', height: '3rem'}} role="status"></div>
        <h4 className="text-secondary fw-bold">HMS Secure Portal</h4>
        <p className="text-muted small">Verifying your credentials and role...</p>
      </div>
    );
  }

  // Redirect logic for home/dashboard
  const getDashboardRedirect = () => {
    if (!user) return <Navigate to="/sign-in" />;
    if (!role) return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary shadow-sm" style={{width: '3rem', height: '3rem'}}></div>
        <p className="mt-3 text-muted">Checking role...</p>
      </div>
    );
    return role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/student/dashboard" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <><Navbar user={user} /><Home user={user} /></>} />
        <Route path="/sign-in" element={!user ? <Login /> : getDashboardRedirect()} />
        <Route path="/sign-up" element={!user ? <Register /> : getDashboardRedirect()} />
        <Route path="/verify/:uid" element={<VerifyCard />} />

        {/* --- STUDENT ROUTES --- */}
        <Route
          path="/student/*"
          element={
            user && role === 'student' ? (
              <DashboardLayout user={user} role={role}>
                <Routes>
                  <Route path="dashboard" element={<StudentHome user={user} role={role} />} />
                  <Route path="profile" element={<StudentProfile user={user} />} />
                  <Route path="booking" element={<HostelBooking user={user} />} />
                  <Route path="booking-rooms" element={<BookingRooms user={user} />} />
                  <Route path="mess-menu" element={<MessMenu user={user} />} />
                  <Route path="info" element={<HostelInfo user={user} />} />
                  <Route path="payment" element={<Payment user={user} />} />
                  <Route path="receipt" element={<Receipt user={user} />} />
                  <Route path="complaints" element={<StudentComplaints />} />
                  <Route path="achievements" element={<StudentAchievements user={user} />} />
                  <Route path="notices" element={<StudentNotices user={user} />} />
                  <Route path="room-chat" element={<StudentRoomChat user={user} />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </DashboardLayout>
            ) : <Navigate to="/sign-in" />
          }
        />

        {/* --- ADMIN ROUTES --- */}
        <Route
          path="/admin/*"
          element={
            user && role === 'admin' ? (
              <DashboardLayout user={user} role={role}>
                <Routes>
                  <Route path="dashboard" element={<AdminHome user={user} />} />
                  <Route path="applications" element={<ManageApplications user={user} />} />
                  <Route path="room-management" element={<RoomManagement user={user} />} />
                  <Route path="student-management" element={<ManageStudents user={user} />} />
                  <Route path="notices" element={<ManageNotices user={user} />} />
                  <Route path="profile" element={<AdminProfile user={user} />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="achievements" element={<AdminAchievements />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </DashboardLayout>
            ) : <Navigate to="/sign-in" />
          }
        />

        {/* Dashboard Shortcut */}
        <Route path="/dashboard" element={getDashboardRedirect()} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
