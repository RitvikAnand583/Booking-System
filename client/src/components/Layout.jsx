import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { Home, Calendar, LogOut, User, Shield, ClipboardList, Activity, Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

function Layout() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

    const getRoleBadgeColor = () => {
        if (user?.role === 'admin') return 'bg-red-100 text-red-700'
        if (user?.role === 'provider') return 'bg-emerald-100 text-emerald-700'
        return 'bg-blue-100 text-blue-700'
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            <nav className="bg-white border-b border-secondary-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                    <Sparkles className="text-white" size={20} />
                                </div>
                                <span className="font-bold text-xl text-secondary-900 hidden sm:block">CleanFanatics</span>
                            </Link>

                            <div className="hidden md:flex items-center ml-10 gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-link ${location.pathname === item.path
                                                ? 'nav-link-active'
                                                : 'nav-link-inactive'
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-secondary-50 rounded-xl">
                                <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-secondary-900">{user?.name}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor()}`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="btn-icon text-secondary-500 hover:text-red-600 hidden sm:flex"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="btn-icon md:hidden"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-secondary-100 bg-white animate-fade-in">
                        <div className="px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${location.pathname === item.path
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-secondary-600 hover:bg-secondary-50'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
