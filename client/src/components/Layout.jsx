import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { Home, Calendar, Settings, LogOut, User, Shield, ClipboardList, Activity } from 'lucide-react'

function Layout() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const getNavItems = () => {
        if (user?.role === 'customer') {
            return [
                { path: '/dashboard', label: 'Dashboard', icon: Home },
                { path: '/new-booking', label: 'New Booking', icon: Calendar },
            ]
        }
        if (user?.role === 'provider') {
            return [
                { path: '/provider', label: 'Dashboard', icon: Home },
            ]
        }
        if (user?.role === 'admin') {
            return [
                { path: '/admin', label: 'Overview', icon: Home },
                { path: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
                { path: '/admin/events', label: 'Event Logs', icon: Activity },
            ]
        }
        return []
    }

    const navItems = getNavItems()

    return (
        <div className="min-h-screen bg-secondary-50">
            <nav className="bg-white border-b border-secondary-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">CF</span>
                                </div>
                                <span className="font-bold text-xl text-secondary-900">CleanFanatics</span>
                            </Link>

                            <div className="hidden md:flex items-center ml-10 gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${location.pathname === item.path
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-secondary-600 hover:bg-secondary-100'}`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                                    {user?.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                                    <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
