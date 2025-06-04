import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar.js';
import config from '../../config/config.js';
import {
    FiTrendingUp,
    FiUsers,
    FiDollarSign,
    FiCalendar,
    FiClock,
    FiActivity,
    FiMessageSquare,
    FiBriefcase,
    FiUserPlus,
    FiStar,
    FiMapPin
} from 'react-icons/fi';

// Helper function for date formatting
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Helper function for full date formatting
const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const PlatformReport = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [userMembership, setUserMembership] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Check membership tier when component mounts
    useEffect(() => {
        const checkMembership = async () => {
            try {
                const response = await axios.get(
                    `${config.API_BASE_URL}/api/membership/verify`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (!response.data.hasActiveMembership || 
                    (response.data.membership.tier !== "Professional" && 
                     response.data.membership.tier !== "Enterprise")) {
                    toast.error("Upgrade to Professional tier to access platform reports");
                    navigate('/profile');
                    return;
                }

                setUserMembership(response.data.membership);
            } catch (error) {
                console.error('Error checking membership:', error);
                toast.error("Error verifying membership status");
                navigate('/profile');
            }
        };

        checkMembership();
    }, [token, navigate]);

    const fetchPlatformStats = useCallback(async () => {
        // Remove redundant membership check since we already verified in useEffect
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.API_BASE_URL}/api/reports/platform-stats?timeRange=${timeRange}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setStats(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching platform stats:', err);
            setError(err.response?.data?.message || 'Error fetching platform statistics');
        } finally {
            setLoading(false);
        }
    }, [timeRange, token]); // Remove userMembership from dependencies since we don't need it here

    useEffect(() => {
        if (userMembership) {
            fetchPlatformStats();
        }
    }, [fetchPlatformStats, userMembership]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
                    <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
                        <div className="flex justify-center items-center min-h-[60vh]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
                    <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
                        <div className="flex justify-center items-center min-h-[60vh]">
                            <div className="text-red-500 bg-white/30 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!stats) return null;

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className={`p-2 bg-${color}-100/50 rounded-lg`}>
                    <Icon className={`text-2xl text-${color}-600`} />
                </div>
            </div>
            <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
        </div>
    );

    const getActivityIcon = (type) => {
        switch (type) {
            case 'investment':
                return <FiDollarSign className="text-yellow-600" />;
            case 'meeting':
                return <FiCalendar className="text-blue-600" />;
            case 'event':
                return <FiStar className="text-purple-600" />;
            case 'connection':
                return <FiUserPlus className="text-green-600" />;
            case 'business':
                return <FiBriefcase className="text-indigo-600" />;
            case 'post':
                return <FiMessageSquare className="text-pink-600" />;
            default:
                return <FiActivity className="text-gray-600" />;
        }
    };

    const getActivityTitle = (item) => {
        if (item.type === 'investment') {
            return `Investment: ${item.title}`;
        } else if (item.type === 'meeting') {
            return `Meeting: ${item.title}`;
        } else if (item.type === 'event') {
            return `Event: ${item.title}`;
        } else if (item.type === 'connection') {
            return `Connected with ${item.name}`;
        } else if (item.type === 'business') {
            return `Business: ${item.title}`;
        } else if (item.type === 'post') {
            return `Post: ${item.title}`;
        }
        return item.title || item.name || item.type || item.action;
    };

    const getActivityStatus = (item) => {
        // For meetings, show simple attendance status
        if (item.type === 'meeting') {
            if (item.attendance) {
                if (['present', 'late'].includes(item.attendance.status)) {
                    return { text: 'Attended', color: 'green' };
                } else {
                    return { text: 'Not Attended', color: 'red' };
                }
            }
            if (item.isUpcoming) {
                return { text: 'Not Joined', color: 'gray' };
            }
            return { text: 'Not Recorded', color: 'gray' };
        }
        
        // For events, show simple booking status
        if (item.type === 'event') {
            if (item.booking) {
                if (item.booking.status === 'confirmed') {
                    return { text: 'Booked', color: 'green' };
                } else {
                    return { text: 'Not Booked', color: 'red' };
                }
            }
            if (item.isUpcoming) {
                return { text: 'Not Booked', color: 'gray' };
            }
            return { text: 'Not Recorded', color: 'gray' };
        }

        // For other activities, keep existing status logic
        if (item.status === 'completed') {
            return { text: 'Completed', color: 'green' };
        } else if (item.status === 'pending') {
            return { text: 'Pending', color: 'yellow' };
        } else if (item.status === 'cancelled') {
            return { text: 'Cancelled', color: 'red' };
        } else if (item.status === 'upcoming') {
            return { text: 'Upcoming', color: 'blue' };
        }
        return null;
    };

    const RecentActivityCard = ({ title, items = [], icon: Icon, color }) => (
        <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className={`p-2 bg-${color}-100/50 rounded-lg`}>
                    <Icon className={`text-2xl text-${color}-600`} />
                </div>
            </div>
            <div className="space-y-4">
                {items && items.length > 0 ? (
                    items.map((item, index) => {
                        const status = getActivityStatus(item);
                        return (
                            <div key={index} className="border-b border-white/20 last:border-0 pb-4 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {getActivityIcon(item.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-800">
                                                {getActivityTitle(item)}
                                            </h4>
                                            {status && (
                                                <span className={`px-2 py-1 text-xs rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                                                    {status.text}
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                        )}
                                        {item.amount && (
                                            <p className="text-sm font-medium text-gray-700 mt-1">
                                                Amount: ${item.amount.toLocaleString()}
                                            </p>
                                        )}
                                        {item.location && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                <FiMapPin className="inline mr-1" /> {item.location}
                                            </p>
                                        )}
                                        {item.type === 'meeting' && item.attendance && item.attendance.status === 'present' && (
                                            <div className="mt-2 space-y-1">
                                                {item.attendance.joinTime && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FiClock className="text-gray-400" />
                                                        Attended at: {new Date(item.attendance.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                                {item.attendance.duration > 0 && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FiClock className="text-gray-400" />
                                                        Duration: {Math.round(item.attendance.duration)} minutes
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {item.type === 'event' && item.booking && item.booking.status === 'confirmed' && (
                                            <div className="mt-2 space-y-1">
                                                {item.booking.bookingDate && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FiClock className="text-gray-400" />
                                                        Booked on: {new Date(item.booking.bookingDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <FiClock className="text-gray-400" />
                                            {new Date(item.date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-center py-4">No activities to display</p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
                <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
                    <div className="p-3 lg:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Platform Report</h1>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-white/20 bg-white/30 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="month">Last Month</option>
                                <option value="quarter">Last Quarter</option>
                                <option value="year">Last Year</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        {/* User Info */}
                        <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 mb-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{stats.user.name}</h2>
                                    <p className="text-gray-600">
                                        {stats.user.industry && `${stats.user.industry} • `}
                                        {stats.user.location && `${stats.user.location} • `}
                                        Member since {formatFullDate(stats.user.joinDate)}
                                    </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full font-medium ${
                                    stats.user.role === 'creator' 
                                        ? 'bg-purple-100/50 text-purple-800'
                                        : 'bg-blue-100/50 text-blue-800'
                                }`}>
                                    {stats.user.role === 'creator' ? 'Chapter Creator' : stats.user.role}
                                </span>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Engagement Score"
                                value={stats.performance.engagementScore}
                                icon={FiActivity}
                                color="blue"
                            />
                            <StatCard
                                title="Total Activities"
                                value={stats.performance.activityBreakdown.total}
                                icon={FiTrendingUp}
                                color="green"
                            />
                            <StatCard
                                title="Business Ratio"
                                value={`${Math.round(stats.performance.businessMetrics.businessRatio)}%`}
                                icon={FiDollarSign}
                                color="yellow"
                            />
                            <StatCard
                                title="Network Size"
                                value={stats.performance.networkMetrics.totalConnections}
                                icon={FiUsers}
                                color="purple"
                            />
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Business Performance */}
                            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Business Performance</h3>
                                    <div className="p-2 bg-yellow-100/50 rounded-lg">
                                        <FiDollarSign className="text-2xl text-yellow-600" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">Total Business</p>
                                            <p className="text-sm text-gray-600">Combined business activities</p>
                                        </div>
                                        <p className="text-lg font-semibold text-yellow-600">{stats.performance.businessMetrics.totalBusiness}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">Business Received</p>
                                            <p className="text-sm text-gray-600">Business opportunities received</p>
                                        </div>
                                        <p className="text-lg font-semibold text-green-600">{stats.performance.businessMetrics.businessReceived}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">Business Given</p>
                                            <p className="text-sm text-gray-600">Business opportunities shared</p>
                                        </div>
                                        <p className="text-lg font-semibold text-blue-600">{stats.performance.businessMetrics.businessGiven}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Network Growth */}
                            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Network Growth</h3>
                                    <div className="p-2 bg-purple-100/50 rounded-lg">
                                        <FiUsers className="text-2xl text-purple-600" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">Total Connections</p>
                                            <p className="text-sm text-gray-600">Total network connections</p>
                                        </div>
                                        <p className="text-lg font-semibold text-purple-600">{stats.performance.networkMetrics.totalConnections}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">Recent Interactions</p>
                                            <p className="text-sm text-gray-600">Connections with recent activity</p>
                                        </div>
                                        <p className="text-lg font-semibold text-green-600">{stats.performance.networkMetrics.activeConnections}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">Interaction Rate</p>
                                            <p className="text-sm text-gray-600">% of connections with recent activity</p>
                                        </div>
                                        <p className="text-lg font-semibold text-blue-600">{Math.round(stats.performance.networkMetrics.activeConnectionRate)}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Participation Stats */}
                            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Participation Stats</h3>
                                    <div className="p-2 bg-green-100/50 rounded-lg">
                                        <FiCalendar className="text-2xl text-green-600" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">Total Participation</p>
                                            <p className="text-sm text-gray-600">Combined meetings and events</p>
                                        </div>
                                        <p className="text-lg font-semibold text-green-600">{stats.performance.participationMetrics.totalParticipation}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/20 pb-4">
                                        <div>
                                            <p className="font-medium text-gray-800">Meeting Attendance</p>
                                            <p className="text-sm text-gray-600">% of meetings attended</p>
                                        </div>
                                        <p className="text-lg font-semibold text-blue-600">{Math.round(stats.performance.participationMetrics.meetings.attendanceRate)}%</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">Event Attendance</p>
                                            <p className="text-sm text-gray-600">% of events attended</p>
                                        </div>
                                        <p className="text-lg font-semibold text-yellow-600">{Math.round(stats.performance.participationMetrics.events.attendanceRate)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed Section - Masonry Grid */}
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {/* Recent Activity Feed */}
                            <div className="break-inside-avoid">
                                <RecentActivityCard
                                    title="Recent Activity Feed"
                                    items={stats?.recentActivity?.activities || []}
                                    icon={FiActivity}
                                    color="blue"
                                />
                            </div>

                            {/* Upcoming Meetings */}
                            <div className="break-inside-avoid">
                                <RecentActivityCard
                                    title="Upcoming Meetings"
                                    items={stats?.recentActivity?.meetings || []}
                                    icon={FiClock}
                                    color="yellow"
                                />
                            </div>

                            {/* Upcoming Events */}
                            <div className="break-inside-avoid">
                                <RecentActivityCard
                                    title="Upcoming Events"
                                    items={stats?.recentActivity?.events || []}
                                    icon={FiCalendar}
                                    color="green"
                                />
                            </div>

                            {/* Recent Connections */}
                            <div className="break-inside-avoid">
                                <RecentActivityCard
                                    title="Recent Connections"
                                    items={stats?.recentActivity?.connections || []}
                                    icon={FiUsers}
                                    color="purple"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlatformReport; 