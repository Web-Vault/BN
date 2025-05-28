import { useState } from "react";
import { motion } from "framer-motion";

const testimonials = [
        {
                name: "Sophia Williams",
                role: "Business Owner",
                image: "https://randomuser.me/api/portraits/women/50.jpg",
                quote:
                        "This platform completely transformed my business! The AI-driven connections helped me find the perfect partners. Absolutely love it!",
        },
        {
                name: "James Carter",
                role: "Freelancer",
                image: "https://randomuser.me/api/portraits/men/45.jpg",
                quote:
                        "I found multiple clients and amazing opportunities. The professional design and seamless networking make it the best!",
        },
        {
                name: "Emma Thompson",
                role: "Startup Founder",
                image: "https://randomuser.me/api/portraits/women/48.jpg",
                quote:
                        "The best decision I made! The analytics and business insights help me track my progress in real time.",
        },
];

const Testimonials = () => {
        const [activeIndex, setActiveIndex] = useState(0);

        return (
                <section className="relative py-20 px-6 md:px-20 bg-[#0a0e17] text-white">
                        {/* Floating Soft Background Effects */}
                        <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute w-96 h-96 bg-blue-500/20 blur-[160px] rounded-full top-10 left-10"></div>
                                <div className="absolute w-80 h-80 bg-purple-500/20 blur-[140px] rounded-full bottom-10 right-10"></div>
                        </div>

                        <div className="max-w-6xl mx-auto text-center">
                                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                        What Our Users Say 💬
                                </h2>
                                <p className="text-gray-400 text-lg mt-4">
                                        Real stories from people who have benefited from our platform.
                                </p>
                        </div>

                        {/* Testimonial Cards */}
                        <div className="relative flex justify-center items-center mt-12">
                                {/* Floating Glass Card */}
                                <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="relative max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 text-center"
                                >
                                        <motion.img
                                                src={testimonials[activeIndex].image}
                                                alt={testimonials[activeIndex].name}
                                                className="w-20 h-20 rounded-full border-4 border-blue-400 mx-auto"
                                        />
                                        <h3 className="text-xl font-semibold mt-4">
                                                {testimonials[activeIndex].name}
                                        </h3>
                                        <p className="text-blue-300 text-sm">{testimonials[activeIndex].role}</p>
                                        <p className="text-gray-300 mt-4 italic">{testimonials[activeIndex].quote}</p>
                                </motion.div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-center gap-4">
                                {testimonials.map((_, index) => (
                                        <motion.button
                                                key={index}
                                                whileHover={{ scale: 1.1 }}
                                                className={`w-4 h-4 rounded-full transition-all ${activeIndex === index ? "bg-blue-500" : "bg-gray-500"
                                                        }`}
                                                onClick={() => setActiveIndex(index)}
                                        ></motion.button>
                                ))}
                        </div>
                </section>
        );
};

export default Testimonials;
