
const LogoutButton = () => {

        const handleLogout = {

        };

        return (
                <>
                        
                                <button id="logoutButton"
                                        type="submit"
                                        onClick={handleLogout}
                                        className="px-5 py-2 bg-transparent border border-red-500 text-white rounded-xl hover:bg-red-500 transition"
                                >
                                        Logout
                                </button>
                </>
        );

};

export default LogoutButton;