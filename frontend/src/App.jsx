import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Search from './pages/Search.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import MyRadar from './pages/MyRadar.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/my-radar" element={<MyRadar />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
