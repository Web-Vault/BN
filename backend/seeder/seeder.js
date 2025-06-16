import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import users from "../models/users.js";
import Post from "../models/posts.js";
import Comment from "../models/comments.js";
import MembershipTier from "../models/MembershipTier.js";
// import Activity from "../models/activity.js";

dotenv.config();

const seedData = async () => {
        try {
                await connectDB(); // ✅ Ensures DB is connected before inserting data
                // await users.deleteMany();
                // await Post.deleteMany();
                // await Comment.deleteMany();
                // await Activity.deleteMany();
                await MembershipTier.deleteMany();

                // Seed membership tiers
                const membershipTiers = [
                    {
                        tier: 'basic',
                        price: 99,
                        duration: 1,
                        features: [
                            { name: 'Access to community posts', included: true },
                            { name: 'Basic profile customization', included: true },
                            { name: 'View member profiles', included: true },
                            { name: 'Participate in discussions', included: true },
                            { name: 'Create chapters', included: false },
                            { name: 'Advanced analytics', included: false },
                            { name: 'Priority support', included: false },
                            { name: 'Custom branding', included: false }
                        ]
                    },
                    {
                        tier: 'professional',
                        price: 199,
                        duration: 1,
                        features: [
                            { name: 'Access to community posts', included: true },
                            { name: 'Basic profile customization', included: true },
                            { name: 'View member profiles', included: true },
                            { name: 'Participate in discussions', included: true },
                            { name: 'Create chapters', included: true },
                            { name: 'Advanced analytics', included: true },
                            { name: 'Priority support', included: true },
                            { name: 'Custom branding', included: false }
                        ]
                    }
                ];

                await MembershipTier.insertMany(membershipTiers);
                console.log("✅ Membership Tiers Seeded Successfully!");

                const usersData = await users.find({});

                // Create sample posts for announcements page
                // const samplePosts = [
                //     {
                //         content: "🎉 Welcome to our Business Network! We're excited to have you all here. Let's make this a great space for networking and business growth.",
                //         author: usersData[0]._id,
                //         isAnnouncement: true,
                //         isPinned: true,
                //         likes: [usersData[1]._id, usersData[2]._id],
                //         images: ["https://example.com/welcome-image.jpg"],
                //         createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "📢 Important Update: Our next networking event is scheduled for next Saturday at 2 PM. Don't forget to RSVP!",
                //         author: usersData[1]._id,
                //         isAnnouncement: true,
                //         isPinned: true,
                //         likes: [usersData[0]._id, usersData[3]._id],
                //         images: ["https://example.com/event-flyer.jpg"],
                //         createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "Just launched my new business! Would love to connect with other entrepreneurs in the network.",
                //         author: usersData[2]._id,
                //         isAnnouncement: false,
                //         isPinned: false,
                //         likes: [usersData[0]._id, usersData[1]._id, usersData[4]._id],
                //         images: ["https://example.com/business-launch.jpg"],
                //         createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "🚀 Exciting news! We've reached 1000 members in our business network. Thank you all for being part of this journey!",
                //         author: usersData[0]._id,
                //         isAnnouncement: true,
                //         isPinned: false,
                //         likes: [usersData[1]._id, usersData[2]._id, usersData[3]._id, usersData[4]._id],
                //         images: ["https://example.com/milestone.jpg"],
                //         createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "Looking for business partners for a new venture. Anyone interested in collaboration?",
                //         author: usersData[3]._id,
                //         isAnnouncement: false,
                //         isPinned: false,
                //         likes: [usersData[0]._id, usersData[2]._id],
                //         createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "📚 Just published a new business strategy guide. Check it out and let me know your thoughts!",
                //         author: usersData[4]._id,
                //         isAnnouncement: false,
                //         isPinned: false,
                //         likes: [usersData[0]._id, usersData[1]._id, usersData[3]._id],
                //         images: ["https://example.com/strategy-guide.jpg"],
                //         createdAt: new Date()
                //     }
                // ];

                // Insert posts and store their IDs
                // const createdPosts = await Post.insertMany(samplePosts);

                // Create sample comments for each post
                // const sampleComments = [
                //     // Comments for the first post (Welcome message)
                //     {
                //         content: "Thanks for the warm welcome! Looking forward to networking with everyone.",
                //         author: usersData[1]._id,
                //         post: createdPosts[0]._id,
                //         likes: [usersData[0]._id],
                //         createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "Great to be here! Can't wait to share business insights with the community.",
                //         author: usersData[2]._id,
                //         post: createdPosts[0]._id,
                //         likes: [usersData[0]._id, usersData[1]._id],
                //         createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
                //     },

                //     // Comments for the second post (Networking event)
                //     {
                //         content: "I'll be there! Looking forward to meeting potential business partners.",
                //         author: usersData[0]._id,
                //         post: createdPosts[1]._id,
                //         likes: [usersData[1]._id],
                //         createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "What's the venue for the event?",
                //         author: usersData[3]._id,
                //         post: createdPosts[1]._id,
                //         createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
                //     },

                //     // Comments for the third post (New business)
                //     {
                //         content: "Congratulations on the launch! What industry are you in?",
                //         author: usersData[0]._id,
                //         post: createdPosts[2]._id,
                //         likes: [usersData[2]._id],
                //         createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "Would love to hear more about your business model!",
                //         author: usersData[4]._id,
                //         post: createdPosts[2]._id,
                //         createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                //     }
                // ];

                // // Insert comments and store their IDs
                // const createdComments = await Comment.insertMany(sampleComments);

                // // Create nested replies for some comments
                // const sampleReplies = [
                //     // Reply to the venue question
                //     {
                //         content: "It's at the Grand Business Center, Room 302. There's parking available in the basement.",
                //         author: usersData[1]._id,
                //         post: createdPosts[1]._id,
                //         parentComment: createdComments[3]._id,
                //         likes: [usersData[3]._id],
                //         createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                //     },
                //     {
                //         content: "Thanks for the info! Will there be refreshments?",
                //         author: usersData[3]._id,
                //         post: createdPosts[1]._id,
                //         parentComment: createdComments[3]._id,
                //         createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                //     },

                //     // Reply to the business model question
                //     {
                //         content: "We're in the B2B SaaS space, focusing on business automation. Here's our website: businessautomation.com",
                //         author: usersData[2]._id,
                //         post: createdPosts[2]._id,
                //         parentComment: createdComments[5]._id,
                //         likes: [usersData[4]._id, usersData[0]._id],
                //         createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                //     }
                // ];

                // // Insert replies
                // const createdReplies = await Comment.insertMany(sampleReplies);

                // // Update parent comments with their replies
                // await Comment.findByIdAndUpdate(createdComments[3]._id, {
                //     replies: [createdReplies[0]._id, createdReplies[1]._id]
                // });

                // await Comment.findByIdAndUpdate(createdComments[5]._id, {
                //     replies: [createdReplies[2]._id]
                // });

                // // Update posts with their comments
                // await Post.findByIdAndUpdate(createdPosts[0]._id, {
                //     comments: [createdComments[0]._id, createdComments[1]._id]
                // });

                // await Post.findByIdAndUpdate(createdPosts[1]._id, {
                //     comments: [createdComments[2]._id, createdComments[3]._id]
                // });

                // await Post.findByIdAndUpdate(createdPosts[2]._id, {
                //     comments: [createdComments[4]._id, createdComments[5]._id]
                // });

                // await chapter.create({
                //         chapterName: "React Enthusiasts",
                //         chapterDesc: "A group for tech enthusiasts to collaborate on ideas.",
                //         chapterTech: "ReactJS",
                //         chapterCreator: usersData[0]._id,
                //         members: [usersData[0]._id, usersData[1]._id, usersData[2]._id],
                //         activities: [
                //                 {
                //                         user: usersData[0]._id,
                //                         content: "Just launched a new AI-powered tool for developers! Check it out.",
                //                         image: "https://img.pikbest.com/wp/202346/computer-network-abstract-networking-visualization-in-a-3d-rendering_9724955.jpg!bw700",
                //                 },
                //                 {
                //                         user: usersData[1]._id,
                //                         content: "Anyone attending the Tech Summit next week? Let's connect!",
                //                 },
                //                 {
                //                         user: usersData[2]._id,
                //                         content: "Sharing some insights about cloud infrastructure optimization...",
                //                 },
                //         ],
                //         joinRequests: [usersData[3]._id, usersData[4]._id, usersData[5]._id],
                // });

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
