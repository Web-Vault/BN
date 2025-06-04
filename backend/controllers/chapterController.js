import Chapter from "../models/Chapter.js";
import users from "../models/users.js";

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

export const createChapter = async (req, res) => {
  try {
    const { chapterName, chapterDesc, chapterTech } = req.body;
    const userId = req.user._id;

    const newChapter = new Chapter({
      chapterName,
      chapterDesc,
      chapterTech,
      chapterCreator: userId,
      members: [userId], // Creator is automatically a member
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
    res.status(500).json({ message: "Failed to create chapter", error: error.message });
  }
};
