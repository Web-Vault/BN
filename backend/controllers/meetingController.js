import Meeting from "../models/meeting.js";
import Chapter from "../models/chapter.js";
import MeetingAttendance from "../models/meetingAttendance.js";
import users from "../models/users.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { 
      title, 
      description, 
      date, 
      time, 
      endTime,
      meetingType, 
      meetingLink, 
      location 
    } = req.body;
    const userId = req.user._id;

    // Validate end time is after start time
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    if (endDateTime <= startDateTime) {
      return res.status(400).json({ 
        message: "End time must be after start time" 
      });
    }

    // Check if chapter exists and user is the creator
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapter.chapterCreator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only chapter creator can create meetings" });
    }

    // Create new meeting
    const meeting = new Meeting({
      title,
      description,
      date,
      time,
      endTime,
      meetingType,
      meetingLink,
      location,
      chapter: chapterId,
      createdBy: userId,
    });

    await meeting.save();

    // Add meeting to chapter's meetings array
    chapter.meetings.push(meeting._id);
    await chapter.save();

    // Populate the meeting with creator details
    await meeting.populate("createdBy", "userName userEmail userImage");

    res.status(201).json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Error creating meeting", error: error.message });
  }
};

// Get all meetings for a chapter
export const getChapterMeetings = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const meetings = await Meeting.find({ chapter: chapterId })
      .select('title description date time endTime meetingType meetingLink location status createdBy')
      .populate("createdBy", "userName userEmail userImage")
      .sort({ date: 1, time: 1 });

    // console.log("Fetched meetings:", meetings); // Debug log
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ message: "Error fetching meetings", error: error.message });
  }
};

// Delete a meeting
export const deleteMeeting = async (req, res) => {
  try {
    const { chapterId, meetingId } = req.params;
    const userId = req.user._id;

    // Check if chapter exists and user is the creator
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapter.chapterCreator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only chapter creator can delete meetings" });
    }

    // Find and delete the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.chapter.toString() !== chapterId) {
      return res.status(400).json({ message: "Meeting does not belong to this chapter" });
    }

    await meeting.deleteOne();

    // Remove meeting from chapter's meetings array
    chapter.meetings = chapter.meetings.filter(
      (id) => id.toString() !== meetingId
    );
    await chapter.save();

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ message: "Error deleting meeting", error: error.message });
  }
};

// Update a meeting
export const updateMeeting = async (req, res) => {
  try {
    const { chapterId, meetingId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // If updating time or endTime, validate the times
    if (updates.time || updates.endTime || updates.date) {
      const meeting = await Meeting.findById(meetingId);
      const startDateTime = new Date(
        `${updates.date || meeting.date}T${updates.time || meeting.time}`
      );
      const endDateTime = new Date(
        `${updates.date || meeting.date}T${updates.endTime || meeting.endTime}`
      );
      
      if (endDateTime <= startDateTime) {
        return res.status(400).json({ 
          message: "End time must be after start time" 
        });
      }
    }

    // Check if chapter exists and user is the creator
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapter.chapterCreator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only chapter creator can update meetings" });
    }

    // Find and update the meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.chapter.toString() !== chapterId) {
      return res.status(400).json({ message: "Meeting does not belong to this chapter" });
    }

    // Update allowed fields
    const allowedUpdates = [
      "title", 
      "description", 
      "date", 
      "time", 
      "endTime",
      "meetingType", 
      "meetingLink", 
      "location", 
      "status"
    ];
    Object.keys(updates).forEach((update) => {
      if (allowedUpdates.includes(update)) {
        meeting[update] = updates[update];
      }
    });

    await meeting.save();
    await meeting.populate("createdBy", "userName userEmail userImage");

    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ message: "Error updating meeting", error: error.message });
  }
};

// Add this function to update all meeting statuses
export const updateAllMeetingStatuses = async (req, res) => {
  try {
    await Meeting.updateAllStatuses();
    res.status(200).json({ message: "Meeting statuses updated successfully" });
  } catch (error) {
    console.error("Error updating meeting statuses:", error);
    res.status(500).json({ message: "Error updating meeting statuses", error: error.message });
  }
};

// Join a meeting
export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if meeting is ongoing
    if (meeting.status !== "ongoing") {
      return res.status(400).json({ message: "Meeting is not ongoing" });
    }

    // Calculate if user is late (more than 10 minutes after start time)
    const meetingStartTime = new Date(`${meeting.date}T${meeting.time}`);
    const currentTime = new Date();
    const minutesLate = Math.round((currentTime - meetingStartTime) / (1000 * 60));
    const isLate = minutesLate > 10;

    // Record attendance
    try {
      const attendance = new MeetingAttendance({
        meeting: meetingId,
        user: req.user.id,
        joinTime: currentTime,
        status: isLate ? "late" : "present",
        markedAttendance: true // Flag to track if user marked attendance
      });
      await attendance.save();
    } catch (err) {
      // If duplicate attendance record, update the existing one
      if (err.code === 11000) {
        await MeetingAttendance.findOneAndUpdate(
          { meeting: meetingId, user: req.user.id },
          { 
            joinTime: currentTime,
            status: isLate ? "late" : "present",
            markedAttendance: true
          }
        );
      } else {
        throw err;
      }
    }

    res.json({ message: "Joined meeting successfully" });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({ message: "Error joining meeting" });
  }
};

// Leave a meeting
export const leaveMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Update attendance record
    const attendance = await MeetingAttendance.findOne({
      meeting: meetingId,
      user: req.user.id
    });

    if (attendance) {
      const leaveTime = new Date();
      const duration = Math.round((leaveTime - attendance.joinTime) / (1000 * 60)); // Duration in minutes
      
      // If meeting hasn't ended but user is leaving, mark as left_early
      const status = meeting.status === "completed" ? 
        attendance.status : 
        (duration < 30 ? "left_early" : attendance.status);

      attendance.leaveTime = leaveTime;
      attendance.duration = duration;
      attendance.status = status;
      await attendance.save();
    }

    res.json({ message: "Left meeting successfully" });
  } catch (error) {
    console.error("Error leaving meeting:", error);
    res.status(500).json({ message: "Error leaving meeting" });
  }
};

// Get meeting attendance
export const getMeetingAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Get the chapter to check permissions
    const chapter = await Chapter.findById(meeting.chapter);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Allow access if user is:
    // 1. Chapter creator
    // 2. Meeting attendee
    // 3. Chapter member
    const isCreator = chapter.chapterCreator.toString() === req.user.id;
    const isAttendee = await MeetingAttendance.exists({
      meeting: meetingId,
      user: req.user.id
    });
    const isMember = chapter.members.includes(req.user.id);

    if (!isCreator && !isAttendee && !isMember) {
      return res.status(403).json({ message: "Not authorized to view attendance" });
    }

    // Get all chapter members
    const totalMembers = chapter.members.length;

    // Get attendance records with user details
    const attendance = await MeetingAttendance.find({ meeting: meetingId })
      .populate("user", "userName userEmail userImage")
      .sort({ joinTime: 1 });

    // Calculate attendance statistics
    const presentCount = attendance.filter(a => a.status === "present").length;
    const lateCount = attendance.filter(a => a.status === "late").length;
    const leftEarlyCount = attendance.filter(a => a.status === "left_early").length;
    const markedButNoShowCount = attendance.filter(a => a.markedAttendance && !a.joinTime).length;
    const absentCount = totalMembers - (presentCount + lateCount + leftEarlyCount + markedButNoShowCount);

    // Add statistics to the response
    const stats = {
      totalMembers,
      present: presentCount,
      late: lateCount,
      leftEarly: leftEarlyCount,
      markedButNoShow: markedButNoShowCount,
      absent: absentCount,
      attendanceRate: ((presentCount + lateCount) / totalMembers * 100).toFixed(1)
    };

    res.json({
      attendance,
      stats
    });
  } catch (error) {
    console.error("Error fetching meeting attendance:", error);
    res.status(500).json({ message: "Error fetching meeting attendance" });
  }
};

// Update meeting status
export const updateMeetingStatus = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { status } = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Only chapter creator can update status
    if (meeting.chapter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update meeting status" });
    }

    meeting.status = status;
    await meeting.save();

    // If meeting is completed, update attendance records
    if (status === "completed") {
      const chapter = await users.findById(meeting.chapter);
      if (chapter) {
        // Get all chapter members
        const members = chapter.members || [];
        
        // Get all attendance records for this meeting
        const attendance = await MeetingAttendance.find({ meeting: meetingId });
        const presentUserIds = attendance.map(a => a.user.toString());

        // Find members who marked attendance but never joined
        const markedButNoShow = attendance.filter(a => a.markedAttendance && !a.joinTime);
        for (const record of markedButNoShow) {
          record.status = "absent";
          await record.save();
        }

        // Create attendance records for absent members
        const absentMembers = members.filter(
          memberId => !presentUserIds.includes(memberId.toString())
        );

        // Create attendance records for absent members
        await Promise.all(
          absentMembers.map(memberId =>
            MeetingAttendance.create({
              meeting: meetingId,
              user: memberId,
              status: "absent"
            })
          )
        );
      }
    }

    res.json(meeting);
  } catch (error) {
    console.error("Error updating meeting status:", error);
    res.status(500).json({ message: "Error updating meeting status" });
  }
}; 