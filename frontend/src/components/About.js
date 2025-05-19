import { useState } from "react";
import { motion } from "framer-motion";

const About = () => {
        const [openIndex, setOpenIndex] = useState(null);

        const toggleAccordion = (index) => {
                setOpenIndex(openIndex === index ? null : index);
        };

        return (
                <section className="relative py-20 px-6 md:px-20 bg-[#0a0e17] text-white overflow-hidden">
                        {/* Floating Background Glow Effects */}
                        <div className="absolute inset-0">
                                <div className="absolute w-96 h-96 bg-blue-500/20 blur-[160px] rounded-full top-10 left-10"></div>
                                <div className="absolute w-80 h-80 bg-purple-500/20 blur-[140px] rounded-full bottom-10 right-10"></div>
                        </div>

                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left: 3D Infographic Block */}
                                <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="relative flex flex-col gap-6"
                                >
                                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                                Why Choose Us?
                                        </h2>
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                                We are building a **strong community** where individuals and businesses **connect, grow, and succeed.**
                                        </p>

                                        {/* Floating Soft 3D Stats */}
                                        <div className="relative flex gap-5 flex-wrap">
                                                <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        className="p-6 w-44 h-44 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 flex flex-col items-center justify-center text-center"
                                                >
                                                        <h3 className="text-3xl font-bold text-blue-400">10K+</h3>
                                                        <p className="text-gray-300 text-sm">Active Users</p>
                                                </motion.div>
                                                <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        className="p-6 w-44 h-44 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 flex flex-col items-center justify-center text-center"
                                                >
                                                        <h3 className="text-3xl font-bold text-green-400">2K+</h3>
                                                        <p className="text-gray-300 text-sm">Successful Connections</p>
                                                </motion.div>
                                                <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        className="p-6 w-44 h-44 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 flex flex-col items-center justify-center text-center"
                                                >
                                                        <h3 className="text-3xl font-bold text-purple-400">5K+</h3>
                                                        <p className="text-gray-300 text-sm">Verified Businesses</p>
                                                </motion.div>
                                        </div>
                                </motion.div>

                                {/* Right: Staggered Accordions */}
                                <motion.div
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="w-full"
                                >
                                        {[
                                                {
                                                        title: "🌍 Our Vision",
                                                        content:
                                                                "We aim to create a professional space where individuals and businesses can seamlessly collaborate and grow together.",
                                                },
                                                {
                                                        title: "💡 How It Works?",
                                                        content:
                                                                "Our AI-driven system helps match you with the right business connections and growth opportunities tailored to your skills.",
                                                },
                                                {
                                                        title: "🔒 Secure & Trusted",
                                                        content:
                                                                "Your privacy and security are our top priorities. We ensure that all data is encrypted and businesses are verified for authenticity.",
                                                },
                                                {
                                                        title: "🚀 Growth & Networking",
                                                        content:
                                                                "We provide the best tools to help you expand your professional network and take your business to the next level.",
                                                },
                                        ].map((item, index) => (
                                                <motion.div
                                                        key={index}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="mb-5 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 shadow-md cursor-pointer"
                                                        onClick={() => toggleAccordion(index)}
                                                >
                                                        <div className="flex justify-between items-center">
                                                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                                                <span className="text-blue-400 text-xl">
                                                                        {openIndex === index ? "−" : "+"}
                                                                </span>
                                                        </div>
                                                        {openIndex === index && (
                                                                <motion.p
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        transition={{ duration: 0.3 }}
                                                                        className="mt-2 text-gray-300"
                                                                >
                                                                        {item.content}
                                                                </motion.p>
                                                        )}
                                                </motion.div>
                                        ))}
                                </motion.div>
                        </div>
                </section>
        );
};

export default About;
