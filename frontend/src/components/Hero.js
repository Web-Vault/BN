import { motion } from "framer-motion";

const Hero = () => {
        return (
                <section className="relative flex justify-center items-center h-screen bg-gradient-to-br from-[#1a1f2b] via-[#232b38] to-[#0c1018] overflow-hidden">
                        {/* Floating Particles */}
                        <div className="absolute inset-0">
                                <div className="absolute w-72 h-72 bg-blue-500/30 blur-3xl rounded-full top-20 left-20 animate-pulse"></div>
                                <div className="absolute w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full bottom-10 right-10 animate-pulse"></div>
                        </div>

                        {/* Glassmorphism Card */}
                        <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-lg border border-white/20 text-center max-w-3xl mx-auto"
                        >
                                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                                        Elevate Your <span className="text-blue-500">Business</span>
                                </h1>
                                <p className="text-gray-300 text-lg mt-4">
                                        Join a platform where professionals connect, collaborate, and grow.
                                </p>
                                <motion.button
                                        whileHover={{ boxShadow: "0px 0px 15px #3b82f6" }}
                                        className="mt-6 px-8 py-3 rounded-full bg-blue-500 text-white text-lg font-medium shadow-md hover:shadow-blue-500/50 transition-all duration-300"
                                >
                                        Join Now
                                </motion.button>
                        </motion.div>
                </section>
        );
};

export default Hero;
