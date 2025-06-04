import users from '../models/users.js';
import Chapter from '../models/chapter.js';
import Activity from '../models/activity.js';
import UserActivity from '../models/userActivity.js';
import Connection from '../models/connection.js';
import Investment from '../models/investment.js';
import Post from '../models/posts.js';
import Meeting from '../models/meeting.js';
import Event from '../models/Event.js';
import MeetingAttendance from '../models/meetingAttendance.js';


// ... existing code ...

// Get platform statistics for individual users
export const getPlatformStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const timeRange = req.query.timeRange || 'month';

        // Calculate date range based on timeRange
        const dateRange = getDateRange(timeRange);
        const startDate = dateRange.startDate;
        const endDate = dateRange.endDate;

        // Get user's basic info
        const user = await users.findById(userId)
            .select('-password')
            .populate('connections', 'userName userEmail');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get user's chapters
        const userChapters = await Chapter.find({
            $or: [
                { chapterCreator: userId },
                { members: userId }
            ]
        }).select('_id chapterName');

        // Get user's meeting participation - include all upcoming meetings regardless of time range
        const meetings = await Meeting.find({
            chapter: { $in: userChapters.map(ch => ch._id) },
            $or: [
                { date: { $gte: startDate, $lte: endDate } }, // Past meetings in time range
                { date: { $gt: new Date() } } // All upcoming meetings
            ]
        })
        .populate('chapter', 'chapterName')
        .sort({ date: -1, time: -1 });

        // Get user's event participation - include all upcoming events regardless of time range
        const events = await Event.find({
            chapter: { $in: userChapters.map(ch => ch._id) },
            $or: [
                { date: { $gte: startDate, $lte: endDate } }, // Past events in time range
                { date: { $gt: new Date() } } // All upcoming events
            ]
        })
        .populate('chapter', 'chapterName')
        .sort({ date: -1, time: -1 });

        // Get meeting attendance records
        let meetingAttendance = [];
        try {
            meetingAttendance = await MeetingAttendance.find({
                user: userId,
                meeting: { $in: meetings.map(m => m._id) }
            });
        } catch (error) {
            console.log('Meeting attendance records not found:', error.message);
        }

        // Get user's business activities from userActivity model
        const businessActivities = await UserActivity.find({
            userId: userId,
            type: { $in: ["Business Received", "Business Given"] },
            date: { $gte: startDate, $lte: endDate }
        })
        .populate('relatedUser', 'userName userEmail')
        .sort({ date: -1 });

        // Get user's other activities
        const userActivities = await Activity.find({
            user: userId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        // Get user's network growth
        const connections = await Connection.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'accepted',
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('sender receiver', 'userName userEmail');

        // Get user's investments
        const investments = await Investment.find({
            $or: [
                { creator: userId },
                { investors: userId }
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('chapter', 'chapterName')
          .sort({ createdAt: -1 });

        // Get user's posts
        const posts = await Post.find({
            author: userId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        // Calculate overall engagement score (weighted combination of different activities)
        const engagementScore = calculateEngagementScore({
            totalActivities: userActivities.length + investments.length + posts.length,
            businessActivities: businessActivities.length,
            meetings: meetings.length,
            events: events.length,
            connections: connections.length
        });

        // Calculate business metrics
        const businessMetrics = calculateBusinessMetrics(businessActivities);

        // Calculate network growth metrics
        const networkMetrics = calculateNetworkMetrics(connections, startDate);

        // Calculate participation metrics
        const participationMetrics = calculateParticipationMetrics(meetings, events, meetingAttendance);

        // Prepare response
        const platformStats = {
            user: {
                name: user.userName,
                email: user.userEmail,
                role: user.role || 'member',
                joinDate: user.createdAt,
                industry: user.industry,
                location: user.location,
                chapters: userChapters.map(ch => ({
                    id: ch._id,
                    name: ch.chapterName
                }))
            },
            performance: {
                engagementScore,
                activityBreakdown: {
                    total: userActivities.length + investments.length + posts.length,
                    business: businessActivities.length,
                    investments: investments.length,
                    posts: posts.length
                },
                businessMetrics: {
                    ...businessMetrics.summary,
                    transactions: businessMetrics.transactions,
                    performance: businessMetrics.performance
                },
                networkMetrics,
                participationMetrics
            },
            recentActivity: {
                activities: [
                    // Include user activities only
                    ...userActivities.slice(0, 6).map(activity => ({
                        type: activity.activityType,
                        action: activity.action,
                        date: activity.createdAt,
                        metadata: activity.metadata,
                        title: activity.action,
                        description: activity.metadata?.description,
                        direction: activity.metadata?.direction
                    }))
                ].sort((a, b) => new Date(b.date) - new Date(a.date)),
                meetings: meetings.slice(0, 3).map(meeting => {
                    const attendance = meetingAttendance.find(a => a.meeting.equals(meeting._id));
                    const meetingDateTime = new Date(`${meeting.date.toISOString().split('T')[0]}T${meeting.time}`);
                    const isUpcoming = meetingDateTime > new Date();
                    
                    return {
                        title: meeting.title,
                        date: meeting.date,
                        time: meeting.time,
                        endTime: meeting.endTime,
                        type: 'meeting',
                        status: meeting.status,
                        meetingType: meeting.meetingType,
                        location: meeting.meetingType === 'online' ? meeting.meetingLink : meeting.location,
                        chapter: meeting.chapter?.chapterName,
                        attendance: attendance ? {
                            status: attendance.status,
                            joinTime: attendance.joinTime,
                            leaveTime: attendance.leaveTime,
                            duration: attendance.duration
                        } : null,
                        isUpcoming,
                        description: meeting.description
                    };
                }),
                events: events.slice(0, 3).map(event => {
                    const eventDateTime = new Date(`${event.date.toISOString().split('T')[0]}T${event.time}`);
                    const isUpcoming = eventDateTime > new Date();
                    const userBooking = event.bookings.find(b => b.user.equals(userId));
                    
                    return {
                        title: event.title,
                        date: event.date,
                        time: event.time,
                        endTime: event.endTime,
                        type: 'event',
                        status: isUpcoming ? 'upcoming' : 'completed',
                        venue: event.venue,
                        chapter: event.chapter?.chapterName,
                        description: event.description,
                        purpose: event.purpose,
                        entryFee: event.entryFee,
                        booking: userBooking ? {
                            status: userBooking.status,
                            paymentStatus: userBooking.paymentStatus,
                            bookingDate: userBooking.bookingDate
                        } : null,
                        isUpcoming,
                        availableSeats: event.availableSeats,
                        totalSeats: event.totalSeats
                    };
                }),
                connections: connections.slice(0, 3).map(connection => ({
                    type: 'connection',
                    title: 'New Connection',
                    date: connection.createdAt,
                    name: connection.sender._id.equals(userId) ? connection.receiver.userName : connection.sender.userName,
                    email: connection.sender._id.equals(userId) ? connection.receiver.userEmail : connection.sender.userEmail,
                    status: connection.status,
                    description: `Connected with ${connection.sender._id.equals(userId) ? connection.receiver.userName : connection.sender.userName}`
                }))
            },
            timeRange: {
                type: timeRange,
                startDate,
                endDate
            }
        };

        res.status(200).json({
            success: true,
            data: platformStats
        });

    } catch (error) {
        console.error('Error in getPlatformStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching platform statistics',
            error: error.message
        });
    }
};

// Helper function to calculate engagement score
const calculateEngagementScore = (metrics) => {
    const weights = {
        totalActivities: 1,
        businessActivities: 2,
        meetings: 1.5,
        events: 1.5,
        connections: 1
    };

    const score = Object.entries(metrics).reduce((total, [key, value]) => {
        return total + (value * (weights[key] || 1));
    }, 0);

    return Math.round(score * 10) / 10; // Round to 1 decimal place
};

// Helper function to calculate business metrics
const calculateBusinessMetrics = (activities) => {
    // Calculate business given and received based on type
    const businessReceived = activities.filter(a => a.type === "Business Received").length;
    const businessGiven = activities.filter(a => a.type === "Business Given").length;
    const totalBusiness = businessReceived + businessGiven;

    // Calculate transaction amounts
    const transactions = activities.map(activity => ({
        type: activity.type,
        date: activity.date,
        amount: activity.businessAmount || 0,
        description: activity.content,
        status: activity.businessStatus || 'completed',
        category: activity.businessCategory,
        isVerified: activity.isVerified,
        relatedUser: activity.relatedUser
    }));

    // Calculate financial metrics
    const totalBusinessAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const receivedAmount = transactions
        .filter(t => t.type === "Business Received")
        .reduce((sum, t) => sum + t.amount, 0);
    const givenAmount = transactions
        .filter(t => t.type === "Business Given")
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate net profit/loss
    const netProfit = receivedAmount - givenAmount;
    const profitLossPercentage = givenAmount > 0 ? (netProfit / givenAmount) * 100 : 0;

    // Calculate monthly trends
    const monthlyTransactions = transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.date).toISOString().slice(0, 7); // YYYY-MM format
        if (!acc[month]) {
            acc[month] = {
                received: 0,
                given: 0,
                net: 0,
                count: 0
            };
        }
        if (transaction.type === "Business Received") {
            acc[month].received += transaction.amount;
            acc[month].net += transaction.amount;
        } else {
            acc[month].given += transaction.amount;
            acc[month].net -= transaction.amount;
        }
        acc[month].count++;
        return acc;
    }, {});

    // Sort monthly transactions by date
    const monthlyTrends = Object.entries(monthlyTransactions)
        .map(([month, data]) => ({
            month,
            ...data
        }))
        .sort((a, b) => b.month.localeCompare(a.month));

    // Calculate category-wise breakdown
    const categoryBreakdown = transactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = {
                received: 0,
                given: 0,
                count: 0
            };
        }
        if (transaction.type === "Business Received") {
            acc[category].received += transaction.amount;
        } else {
            acc[category].given += transaction.amount;
        }
        acc[category].count++;
        return acc;
    }, {});

    return {
        summary: {
            totalBusiness,
            businessReceived,
            businessGiven,
            businessRatio: totalBusiness > 0 ? (businessGiven / totalBusiness) * 100 : 0,
            totalAmount: totalBusinessAmount,
            receivedAmount,
            givenAmount,
            netProfit,
            profitLossPercentage
        },
        transactions: {
            recent: transactions.slice(0, 5),
            monthlyTrends: monthlyTrends.slice(0, 6), // Last 6 months
            categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
                category,
                ...data,
                netAmount: data.received - data.given
            }))
        },
        performance: {
            averageTransactionValue: totalBusiness > 0 ? totalBusinessAmount / totalBusiness : 0,
            verifiedTransactions: transactions.filter(t => t.isVerified).length,
            pendingTransactions: transactions.filter(t => t.status === 'pending').length,
            completedTransactions: transactions.filter(t => t.status === 'completed').length,
            cancelledTransactions: transactions.filter(t => t.status === 'cancelled').length
        }
    };
};

// Helper function to calculate network metrics
const calculateNetworkMetrics = (connections, startDate) => {
    const totalConnections = connections.length;
    const activeConnections = connections.filter(conn => 
        conn.lastInteraction && new Date(conn.lastInteraction) >= startDate
    ).length;

    return {
        totalConnections,
        activeConnections,
        activeConnectionRate: totalConnections > 0 ? (activeConnections / totalConnections) * 100 : 0
    };
};

// Helper function to calculate participation metrics
const calculateParticipationMetrics = (meetings, events, meetingAttendance = []) => {
    const now = new Date();
    const pastMeetings = meetings.filter(m => new Date(m.date) <= now);
    const pastEvents = events.filter(e => new Date(e.date) <= now);
    const upcomingMeetings = meetings.filter(m => new Date(m.date) > now);
    const upcomingEvents = events.filter(e => new Date(e.date) > now);

    // Calculate meeting attendance rate based on attendance records
    const meetingAttendanceRate = pastMeetings.length > 0 ? 
        (meetingAttendance.filter(a => 
            pastMeetings.some(m => m._id.equals(a.meeting)) && 
            ['present', 'late'].includes(a.status)
        ).length / pastMeetings.length) * 100 : 0;

    // Calculate upcoming meeting participation
    const upcomingMeetingsJoined = upcomingMeetings.filter(m => m.participants.includes(userId)).length;
    const upcomingMeetingParticipationRate = upcomingMeetings.length > 0 ? 
        (upcomingMeetingsJoined / upcomingMeetings.length) * 100 : 0;

    // For events, we consider participation as attendance since they're in the participants array
    const eventAttendanceRate = pastEvents.length > 0 ? 100 : 0; // If they're in participants, they attended
    const upcomingEventsJoined = upcomingEvents.filter(e => e.participants.includes(userId)).length;
    const upcomingEventParticipationRate = upcomingEvents.length > 0 ? 
        (upcomingEventsJoined / upcomingEvents.length) * 100 : 0;

    return {
        totalParticipation: pastMeetings.length + pastEvents.length,
        meetings: {
            total: pastMeetings.length,
            upcoming: upcomingMeetings.length,
            attendanceRate: meetingAttendanceRate || 0,
            upcomingParticipationRate: upcomingMeetingParticipationRate,
            upcomingJoined: upcomingMeetingsJoined,
            attendanceDetails: {
                present: meetingAttendance.filter(a => a.status === 'present').length,
                late: meetingAttendance.filter(a => a.status === 'late').length,
                absent: meetingAttendance.filter(a => a.status === 'absent').length,
                notRecorded: pastMeetings.length - meetingAttendance.length
            }
        },
        events: {
            total: pastEvents.length,
            upcoming: upcomingEvents.length,
            attendanceRate: eventAttendanceRate,
            upcomingParticipationRate: upcomingEventParticipationRate,
            upcomingJoined: upcomingEventsJoined
        }
    };
};

// Helper function to get date range based on timeRange
const getDateRange = (timeRange) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case 'all':
            startDate = new Date(0); // Beginning of time
            break;
        default:
            startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }

    return { startDate, endDate };
};

// Get network statistics
export const getNetworkStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const timeRange = req.query.timeRange || 'month';

        // Calculate date range based on timeRange
        const dateRange = getDateRange(timeRange);
        const startDate = dateRange.startDate;
        const endDate = dateRange.endDate;

        // Get user's connections
        const userConnections = await Connection.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'accepted'
        }).populate('sender receiver', 'userName userEmail');

        // Get user's activities with connections
        const userActivities = await Activity.find({
            user: userId,
            activityType: 'connection',
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        // Calculate network metrics
        const networkStats = {
            totalConnections: userConnections.length,
            activeConnections: userConnections.filter(conn => 
                conn.lastInteraction && new Date(conn.lastInteraction) >= startDate
            ).length,
            newConnections: userConnections.filter(conn => 
                new Date(conn.createdAt) >= startDate
            ).length,
            recentConnections: userConnections.slice(0, 5).map(conn => ({
                name: conn.sender._id.equals(userId) ? conn.receiver.userName : conn.sender.userName,
                date: conn.createdAt,
                status: conn.status
            })),
            connectionActivity: userActivities.slice(0, 5).map(activity => ({
                type: activity.activityType,
                action: activity.action,
                date: activity.createdAt
            }))
        };

        res.status(200).json({
            success: true,
            data: networkStats
        });

    } catch (error) {
        console.error('Error in getNetworkStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching network statistics',
            error: error.message
        });
    }
};

// Get chapter statistics
export const getChapterStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const timeRange = req.query.timeRange || 'month';

        // Calculate date range based on timeRange
        const dateRange = getDateRange(timeRange);
        const startDate = dateRange.startDate;
        const endDate = dateRange.endDate;

        // Get user's chapters
        const userChapters = await Chapter.find({
            $or: [
                { chapterCreator: userId },
                { members: userId }
            ]
        }).populate('members', 'userName userEmail');

        // Get chapter activities
        const chapterActivities = await Activity.find({
            user: userId,
            activityType: 'chapter',
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });

        // Get chapter meetings
        const chapterMeetings = await Meeting.find({
            chapter: { $in: userChapters.map(ch => ch._id) },
            startTime: { $gte: startDate, $lte: endDate }
        }).sort({ startTime: -1 });

        // Get chapter events
        const chapterEvents = await Event.find({
            chapter: { $in: userChapters.map(ch => ch._id) },
            startDate: { $gte: startDate, $lte: endDate }
        }).sort({ startDate: -1 });

        // Calculate chapter metrics
        const chapterStats = {
            totalChapters: userChapters.length,
            chapters: userChapters.map(chapter => ({
                name: chapter.chapterName,
                status: chapter.status,
                memberCount: chapter.members.length,
                recentActivities: chapterActivities
                    .filter(activity => activity.metadata?.chapterId?.equals(chapter._id))
                    .slice(0, 5)
                    .map(activity => ({
                        type: activity.activityType,
                        action: activity.action,
                        date: activity.createdAt
                    })),
                upcomingMeetings: chapterMeetings
                    .filter(meeting => meeting.chapter.equals(chapter._id) && new Date(meeting.startTime) > new Date())
                    .slice(0, 5)
                    .map(meeting => ({
                        title: meeting.title,
                        date: meeting.startTime,
                        status: meeting.status
                    })),
                upcomingEvents: chapterEvents
                    .filter(event => event.chapter.equals(chapter._id) && new Date(event.startDate) > new Date())
                    .slice(0, 5)
                    .map(event => ({
                        title: event.title,
                        date: event.startDate,
                        status: event.status
                    }))
            })),
            totalActivities: chapterActivities.length,
            totalMeetings: chapterMeetings.length,
            totalEvents: chapterEvents.length
        };

        res.status(200).json({
            success: true,
            data: chapterStats
        });

    } catch (error) {
        console.error('Error in getChapterStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chapter statistics',
            error: error.message
        });
    }
}; 