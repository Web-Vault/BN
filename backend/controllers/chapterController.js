import Chapter from "../models/chapter.js";
import users from "../models/users.js";
import { areTechnologiesSimilar } from "../utils/techNormalizer.js";
import Notification from "../models/notification.js";
import jwt from "jsonwebtoken";

export const getAllChapters = async (req, res) => {
        try {
                const allChapters = await Chapter.find({})
                        .populate("chapterCreator", "userName userEmail") // lowercase matches model
                        .populate("members")
                        .populate("activities.user", "userName userEmail -_id");

                res.status(200).json(allChapters);
        } catch (error) {
                console.error("❌ Error in getAllChapters:", error);
                res.status(500).json({ message: "Server Error", error: error.message });
        }
};

export const getChapterById = async (req, res) => {
        try {
                // console.log("🔍 Fetching chapter:", req.params.id);

                const chapter = await Chapter.findById(req.params.id)
                        .populate("chapterCreator")
                        .populate("members")
                        .populate("joinRequests")
                        .populate({
                                path: "meetings",
                                populate: {
                                        path: "createdBy",
                                        select: "userName userEmail userImage"
                                }
                        })
                        .populate({
                                path: "events",
                                populate: [
                                    {
                                        path: "creator",
                                        select: "userName userImage"
                                    },
                                    {
                                        path: "bookings.user",
                                        select: "userName userImage userEmail"
                                    }
                                ]
                        });

                if (!chapter) {
                        // console.log("❌ Chapter not found in DB");
                        return res.status(404).json({ message: "Chapter not found" });
                }

                res.status(200).json(chapter);
        } catch (error) {
                console.error("❌ Server error:", error);
                res.status(500).json({ message: "Server Error" });
        }
};

export const joinChapter = async (req, res) => {
        try {
                const { chapterId } = req.params;
                const userId = req.user._id;

                // console.log("chapter ID in controller: ", chapterId);

                const chapter = await Chapter.findById(chapterId);
                if (!chapter) {
                        return res.status(404).json({ message: "Chapter not found" });
                }

                // Convert IDs to string to safely compare ObjectIds
                const isAlreadyMember = chapter.members.some(
                        (memberId) => memberId.toString() === userId.toString()
                );

                if (isAlreadyMember) {
                        return res.status(400).json({ message: "Already a member" });
                }

                const hasRequested = chapter.joinRequests?.some(
                        (requestId) => requestId.toString() === userId.toString()
                );

                if (hasRequested) {
                        return res.status(400).json({ message: "Already requested to join" });
                }

                // Add to join requests
                chapter.joinRequests.push(userId);
                await chapter.save();

                res.status(200).json({ message: "Join request submitted successfully" });
        } catch (error) {
                console.error("❌ Error in joinChapter:", error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const addChapterPost = async (req, res) => {
        try {
                const chapter = await Chapter.findById(req.params.id);
                if (!chapter) {
                        return res.status(404).json({ message: "Chapter not found" });
                }

                const newPost = {
                        content: req.body.content,
                        image: req.body.image || "", // optional
                        user: req.user._id, // gets user from token (middleware)
                };

                chapter.activities.push(newPost);
                await chapter.save();

                res.status(201).json({ message: "Post added successfully", post: newPost });
        } catch (error) {
                console.error("❌ Error adding post:", error);
                res.status(500).json({ message: "Failed to add post", error: error.message });
        }
};

export const acceptJoinRequest = async (req, res) => {
        try {
                const { chapterId, userId } = req.params;
                console.log("Accepting join request for:", { chapterId, userId });

                const chapter = await Chapter.findById(chapterId);
                if (!chapter) return res.status(404).json({ message: "Chapter not found" });

                // Check if user is in joinRequests
                const requestExists = chapter.joinRequests.find(
                        (reqId) => reqId.toString() === userId
                );

                if (!requestExists) {
                        return res.status(400).json({ message: "Join request not found" });
                }

                // Remove from joinRequests
                chapter.joinRequests = chapter.joinRequests.filter(
                        (reqId) => reqId.toString() !== userId
                );

                // Add to members if not already
                if (!chapter.members.includes(userId)) {
                        chapter.members.push(userId);
                }
                
                await chapter.save();
                console.log("Chapter updated successfully");

                // Update user's groupJoined with both Joined and JoinedGroupId
                const updatedUser = await users.findByIdAndUpdate(
                    userId, 
                    { 
                        groupJoined: {
                            Joined: true,
                            JoinedGroupId: chapterId
                        }
                    },
                    { new: true } // Return the updated document
                );

                if (!updatedUser) {
                    console.error("Failed to update user:", userId);
                    return res.status(500).json({ message: "Failed to update user data" });
                }

                console.log("User updated successfully:", {
                    userId: updatedUser._id,
                    groupJoined: updatedUser.groupJoined
                });

                res.status(200).json({ 
                    message: "User added to members",
                    user: updatedUser
                });
        } catch (error) {
                console.error("❌ Error accepting join request:", error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const rejectJoinRequest = async (req, res) => {
        try {
                const { chapterId, userId } = req.params;

                const chapter = await Chapter.findById(chapterId);
                if (!chapter) return res.status(404).json({ message: "Chapter not found" });

                const requestExists = chapter.joinRequests.find(
                        (reqId) => reqId.toString() === userId
                );

                if (!requestExists) {
                        return res.status(400).json({ message: "Join request not found" });
                }

                // Remove the user from joinRequests
                chapter.joinRequests = chapter.joinRequests.filter(
                        (reqId) => reqId.toString() !== userId
                );

                await chapter.save();

                res.status(200).json({ message: "Join request rejected" });
        } catch (error) {
                console.error("❌ Error rejecting join request:", error);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const removeMemberFromChapter = async (req, res) => {
        try {
                const { chapterId, userId } = req.body;

                const chapter = await Chapter.findById(chapterId);
                if (!chapter) {
                        return res.status(404).json({ message: "Chapter not found" });
                }

                // Remove user from members array
                chapter.members = chapter.members.filter(
                        (memberId) => memberId.toString() !== userId
                );
                await chapter.save();

                // Update user's groupJoined to false and clear JoinedGroupId
                await users.findByIdAndUpdate(userId, { 
                    groupJoined: {
                        Joined: false,
                        JoinedGroupId: null
                    }
                });

                res.status(200).json({ message: "Member removed from chapter" });
        } catch (error) {
                console.error("❌ Error removing member:", error);
                res.status(500).json({ message: "Server Error", error: error.message });
        }
};

export const checkChapterExists = async (req, res) => {
    try {
        const { region, tech } = req.query;
        
        if (!region || !tech) {
            return res.status(400).json({ 
                message: "Region and technology are required" 
            });
        }

        // Find all chapters in the same region
        const chaptersInRegion = await Chapter.find({ chapterRegion: region });

        // Check for similar technologies
        const similarChapters = chaptersInRegion.filter(chapter => 
            areTechnologiesSimilar(chapter.chapterTech, tech)
        );

        if (similarChapters.length > 0) {
            return res.status(200).json({ 
                exists: true,
                similar: true,
                chapters: similarChapters.map(chapter => ({
                    name: chapter.chapterName,
                    region: chapter.chapterRegion,
                    tech: chapter.chapterTech
                }))
            });
        }

        res.status(200).json({ 
            exists: false,
            similar: false,
            chapters: []
        });
    } catch (error) {
        console.error("❌ Error checking chapter existence:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const createChapter = async (req, res) => {
    try {
        const { 
            chapterName, 
            chapterDesc, 
            chapterTech,
            chapterRegion,
            chapterCity,
            chapterLocation,
            chapterWebsite,
            chapterEmail,
            confirmSimilarTech // New field to confirm if user wants to proceed with similar tech
        } = req.body;
        const userId = req.user._id;

        // Find all chapters in the same region
        const chaptersInRegion = await Chapter.find({ chapterRegion });

        // Check for similar technologies
        const similarChapters = chaptersInRegion.filter(chapter => 
            areTechnologiesSimilar(chapter.chapterTech, chapterTech)
        );

        // If similar chapters exist and user hasn't confirmed, return error
        if (similarChapters.length > 0 && !confirmSimilarTech) {
            return res.status(400).json({ 
                message: "Similar technology chapters exist in this region",
                similar: true,
                chapters: similarChapters.map(chapter => ({
                    name: chapter.chapterName,
                    region: chapter.chapterRegion,
                    tech: chapter.chapterTech
                }))
            });
        }

        const newChapter = new Chapter({
            chapterName,
            chapterDesc,
            chapterTech,
            chapterRegion,
            chapterCity,
            chapterLocation,
            chapterWebsite,
            chapterEmail,
            chapterCreator: userId,
            members: [userId]
        });

        await newChapter.save();

        // Update user's groupJoined status
        await users.findByIdAndUpdate(userId, {
            groupJoined: {
                Joined: true,
                JoinedGroupId: newChapter._id
            }
        });

        res.status(201).json(newChapter);
    } catch (error) {
        console.error("❌ Error creating chapter:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const deleteChapter = async (req, res) => {
    try {
        const chapterId = req.params.id;
        const userId = req.user._id; // Get userId from the auth middleware

        // Find the chapter
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        // Check if user is the creator
        if (chapter.chapterCreator.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only chapter creator can delete the chapter" });
        }

        // Get all members before deletion
        const members = chapter.members || [];
        const memberIds = members.map(member => member._id);

        // Update all members' joinedChapter status
        await users.updateMany(
            { _id: { $in: memberIds } },
            { $set: { joinedChapter: false } }
        );

        // Create notifications for all members
        const notifications = memberIds.map(memberId => ({
            user: memberId,
            sender: userId,
            type: "one_to_one", // Using a valid notification type
            title: "Chapter Deleted",
            message: `The chapter "${chapter.chapterName}" has been deleted. You have been automatically removed from the chapter.`,
            metadata: {
                chapterId: chapterId,
                action: "chapter_deleted"
            },
            read: false,
            priority: "high"
        }));

        await Notification.insertMany(notifications);

        // Delete the chapter
        await Chapter.findByIdAndDelete(chapterId);

        res.status(200).json({ 
            message: "Chapter deleted successfully",
            notificationsSent: notifications.length
        });
    } catch (error) {
        console.error("Error deleting chapter:", error);
        res.status(500).json({ message: "Error deleting chapter" });
    }
};
