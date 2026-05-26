import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Moon, Sun, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { setTheme, effectiveTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const toggleTheme = () => {
        setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                            <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl hidden sm:inline-block">ProjectShowcase</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/projects" className="text-sm font-medium hover:text-primary transition-colors">
                            Browse Projects
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'student' ? '/dashboard' : '/instructor/dashboard'}
                                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <NotificationBell />
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">{user?.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                        {user?.role}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button>Get Started</Button>
                                </Link>
                            </>
                        )}

                        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                            {effectiveTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {effectiveTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                            <Link
                                to="/projects"
                                className="text-sm font-medium hover:text-primary transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Browse Projects
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'student' ? '/dashboard' : '/instructor/dashboard'}
                                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <div className="py-2">
                                        <NotificationBell />
                                    </div>
                                    <div className="flex items-center gap-2 py-2">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-medium">{user?.name}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">Login</Button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={cancelLogout}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className="bg-background border rounded-xl shadow-xl p-6 mx-4 w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <LogOut className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Confirm Logout</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Are you sure you want to logout? You'll need to sign in again to access your account.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full">
                                    <Button variant="outline" className="flex-1" onClick={cancelLogout}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" className="flex-1" onClick={confirmLogout}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
