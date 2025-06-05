import axios from "axios";


const logActivity = async ({ activityType, action, metadata = {}, tokenOverride }) => {
        try {
                const token = tokenOverride || localStorage.getItem("token");

                if (!token) {
                        console.warn("⚠️ No token found. Activity not logged.");
                        return;
                }

                await axios.post(
                        `${config.API_BASE_URL}/api/activity`,
                        {
                                activityType,
                                action,
                                metadata,
                        },
                        {
                                headers: {
                                        Authorization: `Bearer ${token}`,
                                },
                        }
                );

                console.log(`✅ Activity logged: [${activityType}] ${action}`);
        } catch (error) {
                console.error("❌ Error logging activity:", error.response?.data || error.message);
        }
};


export default logActivity;
