import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout'; 
import Profile from './Pages/Profile/Profile'
import Salon from './Pages/Salon/Salon'; 
import Staff from './Pages/Staff/Staff';
import Wage from './Pages/Wage/Wage';
import Booking from './Pages/Booking/Booking';

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
