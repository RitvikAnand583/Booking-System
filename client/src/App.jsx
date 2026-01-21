import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerDashboard from './pages/customer/Dashboard'
import NewBooking from './pages/customer/NewBooking'
import BookingDetail from './pages/customer/BookingDetail'
import ProviderDashboard from './pages/provider/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBookings from './pages/admin/Bookings'
import AdminEvents from './pages/admin/Events'

function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useSelector((state) => state.auth)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'customer') return <Navigate to="/dashboard" replace />
        if (user.role === 'provider') return <Navigate to="/provider" replace />
        if (user.role === 'admin') return <Navigate to="/admin" replace />
    }

    return children
}

function App() {
    const { user } = useSelector((state) => state.auth)

    const getDefaultRoute = () => {
        if (!user) return '/login'
        if (user.role === 'customer') return '/dashboard'
        if (user.role === 'provider') return '/provider'
        if (user.role === 'admin') return '/admin'
        return '/login'
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} /> : <Register />} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to={getDefaultRoute()} replace />} />

                <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="new-booking" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                        <NewBooking />
                    </ProtectedRoute>
                } />
                <Route path="booking/:id" element={
                    <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                        <BookingDetail />
                    </ProtectedRoute>
                } />

                <Route path="provider" element={
                    <ProtectedRoute allowedRoles={['provider']}>
                        <ProviderDashboard />
                    </ProtectedRoute>
                } />

                <Route path="admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="admin/bookings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminBookings />
                    </ProtectedRoute>
                } />
                <Route path="admin/events" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminEvents />
                    </ProtectedRoute>
                } />
            </Route>
        </Routes>
    )
}

export default App
