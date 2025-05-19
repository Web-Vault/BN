import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import users from "../models/users.js";
import chapter from "../models/chapter.js";
// import Activity from "../models/activity.js";

dotenv.config();

const seedData = async () => {
        try {
                await connectDB(); // ✅ Ensures DB is connected before inserting data
                // await users.deleteMany();
                await chapter.deleteMany();
                // await Activity.deleteMany();

                const usersData = await users.find({});

                await chapter.create({
                        chapterName: "React Enthusiasts",
                        chapterDesc: "A group for tech enthusiasts to collaborate on ideas.",
                        chapterTech: "ReactJS",
                        chapterCreator: usersData[0]._id,
                        members: [usersData[0]._id, usersData[1]._id, usersData[2]._id],
                        activities: [
                                {
                                        user: usersData[0]._id,
                                        content: "Just launched a new AI-powered tool for developers! Check it out.",
                                        image: "https://img.pikbest.com/wp/202346/computer-network-abstract-networking-visualization-in-a-3d-rendering_9724955.jpg!bw700",
                                },
                                {
                                        user: usersData[1]._id,
                                        content: "Anyone attending the Tech Summit next week? Let's connect!",
                                },
                                {
                                        user: usersData[2]._id,
                                        content: "Sharing some insights about cloud infrastructure optimization...",
                                },
                        ],
                        joinRequests: [usersData[3]._id, usersData[4]._id, usersData[5]._id],
                });

                // await Activity.insertMany([
                //         {
                //                 user: userData[0]._id,
                //                 activityType: "account",
                //                 action: "Created an account",
                //                 metadata: {},
                //         },
                //         {
                //                 user: userData[0]._id,
                //                 activityType: "business",
                //                 action: "Added a business profile",
                //                 metadata: {
                //                         businessName: "Aryan Perfumes",
                //                         industry: "Retail",
                //                 },
                //         },
                //         {
                //                 user: userData[1]._id,
                //                 activityType: "referral",
                //                 action: "Referred a friend",
                //                 metadata: {
                //                         referredEmail: "friend@example.com",
                //                 },
                //         },
                //         {
                //                 user: userData[1]._id,
                //                 activityType: "investment",
                //                 action: "Invested in new campaign",
                //                 metadata: {
                //                         amount: 10000,
                //                         campaign: "Jewelry Expansion",
                //                 },
                //         },
                // ]);

                console.log("✅ Data Seeded Successfully!");
        } catch (err) {
                console.log("❌ Error in inserting data: ", err);
        } finally {
                mongoose.connection.close(); // ✅ Closes the connection after completion
                process.exit(); // ✅ Exits script
        }
};

seedData();
