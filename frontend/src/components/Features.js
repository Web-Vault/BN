const features = [
        { title: "AI-Powered Insights", desc: "Understand your data like never before." },
        { title: "Customizable Dashboard", desc: "Tailor the platform to your needs." },
        { title: "24/7 Support", desc: "We're always here to help you." },
];

const Features = () => {
        return (
                <section className="py-20 bg-black text-white text-center">
                        <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                                Key Features
                        </h2>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-10">
                                {features.map((feature, index) => (
                                        <div key={index} className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-lg">
                                                <h3 className="text-2xl font-semibold text-blue-400">{feature.title}</h3>
                                                <p className="text-gray-300 mt-2">{feature.desc}</p>
                                        </div>
                                ))}
                        </div>
                </section>
        );
};

export default Features;
