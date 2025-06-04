import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";
// import { Navigate } from "react-router-dom";

const Navbar = () => {
        const [isScrolled, setIsScrolled] = useState(false);
        const [isOpen, setIsOpen] = useState(false); // State for mobile menu
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isUtilityOpen, setIsUtilityOpen] = useState(false);

        const navigate = useNavigate();

        const location = useLocation();
        const currentPath = location.pathname;

        const navItems = [
                { label: 'Dashboard', path: '/profile' },
                { label: 'Connect With People', path: '/people' },
                { label: 'Chapters', path: '/chapter' },
                { label: 'My Activity', path: '/activity' },
                { label: 'Community Place', path: '/community' },
                { label: 'Platform Report', path: '/reports/platform' },
        ];

        const utilityLinks = [
                { label: 'Support Team', path: '/support' },
                { label: 'About Platform', path: '/about' },
                { label: 'Terms and Conditions', path: '/terms-and-conditions' },
                { label: 'Privacy Policy', path: '/privacy-policy' },
        ];

        useEffect(() => {
                const checkAuth = () => {
                        const token = localStorage.getItem("token");
                        if (token) {
                                setIsAuthenticated(true);
                        }
                };

                checkAuth();
                window.addEventListener("storage", checkAuth);
                return () => window.removeEventListener("storage", checkAuth);
        }, []);

        const handleLogout = () => {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");

                navigate("/login");
        }

        // Handle scroll event for subtle shadow effect
        window.addEventListener("scroll", () => {
                setIsScrolled(window.scrollY > 50);
        });

        return (
                <nav
                        className={`fixed top-6 left-1/2 transform -translate-x-1/2 w-[93.5%] max-w-[1340px] px-6 py-4 rounded-2xl transition-all duration-300 z-50 ${isScrolled
                                ? "backdrop-blur-md bg-white/10 shadow-lg border border-white/20 text-dark"
                                : "backdrop-blur-lg bg-white/5 border border-white/20 text-dark"
                                }`}
                >
                        <div className="flex items-center justify-between">
                                {/* Logo */}
                                <Link
                                        to="/profile"
                                        className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300"
                                >
                                        BusinessNetwork
                                </Link>

                                {/* Desktop Navigation */}
                                <ul className="hidden md:flex space-x-6">
                                        {navItems.map((item) => (
                                                <li
                                                        key={item.path}
                                                        className={`transition-all duration-300 ease-in-out py-2 relative
                                                  ${currentPath === item.path
                                                                        ? `after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 ${isScrolled ? 'after:bg-black' : 'after:bg-white'}`
                                                                        : `after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 ${isScrolled ? 'after:bg-black' : 'after:bg-white'} after:transition-all after:duration-300 hover:after:w-full`
                                                                }`}
                                                >
                                                        <Link
                                                                to={item.path}
                                                                className={`text-[15px] px-1 font-medium transition-colors duration-300 
                                                                ${currentPath === item.path ? 'text-white' : 'text-white'}
                                                                ${isScrolled ? 'text-black' : 'text-white'}`}
                                                        >
                                                                {item.label}
                                                        </Link>
                                                </li>
                                        ))}

                                        {/* Utility Links Dropdown */}
                                        <li
                                                className="relative py-2"
                                                onMouseEnter={() => setIsUtilityOpen(true)}
                                                onMouseLeave={() => setIsUtilityOpen(false)}
                                        >
                                                <button
                                                        className={`flex items-center gap-1 text-[15px] px-1 font-medium transition-colors duration-300 
                                                        ${currentPath === '/utility' ? 'text-white' : 'text-white'}
                                                        ${isScrolled ? 'text-black' : 'text-white'}`}
                                                >
                                                        Utility Links
                                                        <FaChevronDown className={`transform transition-transform duration-300 ${isUtilityOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                        {isUtilityOpen && (
                                                                <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: 10 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden"
                                                                >
                                                                        {utilityLinks.map((link) => (
                                                                                <Link
                                                                                        key={link.path}
                                                                                        to={link.path}
                                                                                        className={`block px-4 py-3 text-sm transition-colors duration-200 hover:bg-blue-50
                                                                                        ${currentPath === link.path ? 'text-blue-600' : 'text-gray-700'}`}
                                                                                >
                                                                                        {link.label}
                                                                                </Link>
                                                                        ))}
                                                                </motion.div>
                                                        )}
                                                </AnimatePresence>
                                        </li>
                                </ul>

                                {/* Desktop Auth Buttons */}
                                <div className="space-x-4 hidden md:flex items-center">
                                        {!isAuthenticated ? (
                                                <Link
                                                        to="/login"
                                                        className="px-5 py-2 bg-transparent border border-blue-400 text-white rounded-xl hover:bg-blue-400 transition"
                                                >
                                                        Connect with Us
                                                </Link>
                                        ) : (
                                                <>
                                                        <div className="flex items-center">
                                                                <NotificationBell isScrolled={isScrolled} />
                                                        </div>
                                                        <button
                                                                className={`px-5 py-2 bg-transparent border border-blue-400 rounded-xl hover:bg-blue-400 transition ${isScrolled ? 'text-black' : 'text-white'}`}
                                                                onClick={handleLogout}
                                                        >
                                                                Logout
                                                        </button>
                                                </>
                                        )}

                                </div>

                                {/* Mobile Menu Button */}
                                <button
                                        className="md:hidden text-white text-2xl focus:outline-none"
                                        onClick={() => setIsOpen(!isOpen)}
                                >
                                        {isOpen ? <FaTimes /> : <FaBars />}
                                </button>
                        </div>

                        {/* Mobile Menu */}
                        <div
                                className={`md:hidden fixed top-0 right-0 h-screen w-64 bg-black/80 backdrop-blur-md transition-all duration-300 rounded ${isOpen ? "right-0" : "right-[-100%]"
                                        }`}
                        >

                                <button
                                        className="absolute top-5 right-5 text-white text-2xl"
                                        onClick={() => setIsOpen(false)}
                                >
                                        <FaTimes />
                                </button>
                                <ul className="flex flex-col space-y-6 mt-20 px-8 text-white">
                                        {navItems.map((item) => (
                                                <li key={item.path}>
                                                <Link
                                                                to={item.path}
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                                {item.label}
                                                </Link>
                                        </li>
                                        ))}
                                        
                                        {/* Mobile Utility Links */}
                                        <li className="pt-4 border-t border-white/20">
                                                <span className="text-lg font-semibold text-blue-400">Utility Links</span>
                                                <ul className="mt-4 space-y-4 pl-4">
                                                        {utilityLinks.map((link) => (
                                                                <li key={link.path}>
                                                <Link
                                                                                to={link.path}
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                                                {link.label}
                                                </Link>
                                        </li>
                                                        ))}
                                                </ul>
                                        </li>

                                        <li>
                                                <Link
                                                        to="/community"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        Community Place
                                                </Link>
                                        </li>

                                        {/*  */}

                                        <li>
                                                {!isAuthenticated ? (
                                                        <Link
                                                                to="/login"
                                                                className="block text-center py-2 border border-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition w-full"
                                                                onClick={() => setIsOpen(false)}
                                                        >
                                                                Connect With Us
                                                        </Link>
                                                ) : (
                                                        <>
                                                                <div className="flex items-center justify-center mb-4">
                                                                        <NotificationBell isScrolled={isScrolled} />
                                                                </div>
                                                                <button
                                                                        className="px-5 py-2 bg-transparent border border-blue-400 text-white rounded-xl hover:bg-blue-400 transition w-full"
                                                                        onClick={handleLogout}
                                                                >
                                                                        Logout
                                                                </button>
                                                        </>
                                                )}
                                        </li>
                                </ul>
                        </div>
                </nav>
        );
};

export default Navbar;
