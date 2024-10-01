import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/layouts/admin/layout'; 
import Profile from './pages/Admin/profile'
import Salon from './pages/Admin/salon'; 
import Staff from './pages/Admin/staff';
import Wage from './pages/Admin/wage';
import Booking from './pages/Admin/booking';

function App() {
  return (
    <Layout>
      <Router>
        <Routes>
            {/* Các route con sẽ được render trong Outlet của Layout */}
            {/* <Route path="dashboard" element={<Dashboard />} /> */}
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="salon" element={<Salon />} />
            <Route path="staff" element={<Staff />} />
            <Route path="wage" element={<Wage />} />
            <Route path="booking" element={<Booking />} />
        </Routes>
      </Router>
    </Layout>
  )
}

export default App
