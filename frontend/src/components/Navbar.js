import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons
// import { Navigate } from "react-router-dom";

const Navbar = () => {
        const [isScrolled, setIsScrolled] = useState(false);
        const [isOpen, setIsOpen] = useState(false); // State for mobile menu
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        const navigate = useNavigate();

        const location = useLocation();
        const currentPath = location.pathname;

        const navItems = [
                { label: 'Dashboard', path: '/profile' },
                { label: 'Connect With People', path: '/people' },
                { label: 'Chapters', path: '/chapter' },
                { label: 'My Activity', path: '/activity' },
                { label: 'Support Team', path: '/support' },
                { label: 'About Platform', path: '/about' },
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
                                                        className={`transition-all duration-300 ease-in-out py-2 relative
                                                  ${currentPath === item.path
                                                                        ? 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white'
                                                                        : 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full'
                                                                }`}
                                                >
                                                        <Link
                                                                to={item.path}
                                                                className={`text-[15px] px-1 font-medium transition-colors duration-300 
                                                                ${currentPath === item.path ? 'text-white' : 'text-black'}
                                                                ${isScrolled ? 'text-black' : 'text-white'}`}
                                                        >
                                                                {item.label}
                                                        </Link>
                                                </li>
                                        ))}
                                </ul>

                                {/* Desktop Auth Buttons */}
                                <div className="space-x-4 hidden md:flex">
                                        {!isAuthenticated ? (
                                                <>
                                                        <Link
                                                                to="/login"
                                                                className="px-5 py-2 bg-transparent border border-blue-400 text-white rounded-xl hover:bg-blue-400 transition"
                                                        >
                                                                Connect with Us
                                                        </Link>
                                                </>) : (
                                                <>
                                                        <button
                                                                className={`px-5 py-2 bg-transparent border border-blue-400  rounded-xl hover:bg-blue-400 transition ${isScrolled ? 'text-black' : 'text-white'}`}
                                                                // to="/logout"
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
                                        <li>
                                                <Link
                                                        to="/"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        Dashboard
                                                </Link>
                                        </li>
                                        <li>
                                                <Link
                                                        to="/people"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        Connect With People
                                                </Link>
                                        </li>
                                        <li>
                                                <Link
                                                        to="/chapter"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        Chapters
                                                </Link>
                                        </li>
                                        <li>
                                                <Link
                                                        to="/activity"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        My Activity
                                                </Link>
                                        </li>
                                        <li>
                                                <Link
                                                        to="/support"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        Support Team
                                                </Link>
                                        </li>
                                        <li>
                                                <Link
                                                        to="/about"
                                                        className="text-lg hover:text-blue-400" onClick={() => setIsOpen(false)}
                                                >
                                                        About Platform
                                                </Link>
                                        </li>

                                        {/*  */}

                                        <li>
                                                {!isAuthenticated ? (
                                                        <>
                                                                <Link
                                                                        to="/login"
                                                                        className="block text-center py-2 border border-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition w-full"
                                                                        onClick={() => setIsOpen(false)}
                                                                >
                                                                        Connect With Us
                                                                </Link>
                                                        </>) : (
                                                        <>
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
