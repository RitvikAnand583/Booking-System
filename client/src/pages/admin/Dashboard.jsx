import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Users, ClipboardList, CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import api from '../../services/api'

function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [recentBookings, setRecentBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/bookings?limit=5')
            ])
            setStats(statsRes.data)
            setRecentBookings(bookingsRes.data.bookings)
        } catch (error) {
            console.error('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        )
    }

    const bookingStats = [
        { label: 'Total Bookings', value: stats?.bookings?.total || 0, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
        { label: 'Pending', value: stats?.bookings?.pending || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Active', value: stats?.bookings?.active || 0, icon: AlertTriangle, color: 'bg-purple-100 text-purple-600' },
        { label: 'Completed', value: stats?.bookings?.completed || 0, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        { label: 'Cancelled', value: stats?.bookings?.cancelled || 0, icon: XCircle, color: 'bg-gray-100 text-gray-600' },
        { label: 'Failed', value: stats?.bookings?.failed || 0, icon: XCircle, color: 'bg-red-100 text-red-600' },
    ]

    const userStats = [
        { label: 'Total Customers', value: stats?.users?.customers || 0 },
        { label: 'Total Providers', value: stats?.users?.providers || 0 },
        { label: 'Active Providers', value: stats?.users?.activeProviders || 0 },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
                <p className="text-secondary-600 mt-1">Overview of system activity</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {bookingStats.map((stat) => (
                    <div key={stat.label} className="card">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                        <p className="text-sm text-secondary-600">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-secondary-900">Recent Bookings</h2>
                        <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentBookings.map((booking) => (
                            <div key={booking._id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="font-medium text-secondary-900 capitalize">{booking.service?.replace('-', ' ')}</p>
                                        <p className="text-sm text-secondary-500">{booking.customerId?.name}</p>
                                    </div>
                                </div>
                                <span className={`status-badge status-${booking.status}`}>
                                    {booking.status?.replace('-', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                            <Users size={20} />
                        </div>
                        <h2 className="font-semibold text-secondary-900">Users</h2>
                    </div>
                    <div className="space-y-4">
                        {userStats.map((stat) => (
                            <div key={stat.label} className="flex items-center justify-between">
                                <span className="text-secondary-600">{stat.label}</span>
                                <span className="font-bold text-secondary-900">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/admin/bookings" className="card hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary-900">Manage Bookings</h3>
                                <p className="text-sm text-secondary-600">View and override booking states</p>
                            </div>
                        </div>
                        <ArrowRight className="text-secondary-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                </Link>

                <Link to="/admin/events" className="card hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-secondary-900">Event Logs</h3>
                                <p className="text-sm text-secondary-600">View all system events and changes</p>
                            </div>
                        </div>
                        <ArrowRight className="text-secondary-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default AdminDashboard
