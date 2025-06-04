import Event from "../models/Event.js";
import Chapter from "../models/chapter.js";
import users from "../models/users.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      purpose,
      date,
      time,
      endTime,
      venue,
      entryFee,
      totalSeats,
      image,
    } = req.body;

    const chapterId = req.params.chapterId;
    const userId = req.user._id;

    // Check if user is the chapter creator
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapter.chapterCreator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only chapter creator can create events" });
    }

    const event = new Event({
      title,
      description,
      purpose,
      date,
      time,
      endTime,
      venue,
      entryFee: entryFee || 0,
      totalSeats,
      availableSeats: totalSeats,
      image,
      chapter: chapterId,
      creator: userId,
    });

    await event.save();

    // Add event to chapter's events array
    chapter.events.push(event._id);
    await chapter.save();

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { chapterId, eventId } = req.params;
    const userId = req.user._id;

    // Check if user is the chapter creator
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapter.chapterCreator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only chapter creator can delete events" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove event from chapter's events array
    chapter.events = chapter.events.filter(
      (event) => event.toString() !== eventId
    );
    await chapter.save();

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};

// Book an event
export const bookEvent = async (req, res) => {
  try {
    const { chapterId, eventId } = req.params;
    const userId = req.user._id;

    // Check if user is a chapter member
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const isMember = chapter.members.some(
      (member) => member.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Only chapter members can book events" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is in the future
    const eventDate = new Date(event.date);
    const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
    if (new Date() > oneDayBefore) {
      return res.status(400).json({ message: "Booking is closed for this event" });
    }

    // Check if seats are available
    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // Check if user has already booked
    const existingBooking = event.bookings.find(
      (booking) => booking.user.toString() === userId.toString()
    );
    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this event" });
    }

    // Add booking with completed payment status
    event.bookings.push({
      user: userId,
      status: "confirmed",
      paymentStatus: "completed",
      bookingDate: new Date()
    });

    // Update available seats
    event.availableSeats -= 1;
    await event.save();

    res.json({ message: "Event booked successfully", event });
  } catch (error) {
    console.error("Error booking event:", error);
    res.status(500).json({ message: "Error booking event", error: error.message });
  }
};

// Get all events for a chapter
export const getChapterEvents = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const events = await Event.find({ chapter: chapterId })
      .populate("creator", "userName userImage")
      .populate({
        path: "bookings.user",
        select: "userName userImage userEmail"
      })
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

// Get event details
export const getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate("creator", "userName userImage")
      .populate({
        path: "bookings.user",
        select: "userName userImage userEmail"
      });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Error fetching event details", error: error.message });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { chapterId, eventId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Check if user is the chapter creator
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (chapter.chapterCreator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only chapter creator can update events" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event date has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Cannot update past events" });
    }

    // Update event fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'bookings' && key !== 'creator' && key !== 'chapter') {
        event[key] = updateData[key];
      }
    });

    await event.save();

    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
}; 