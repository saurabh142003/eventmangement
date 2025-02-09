import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Search } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

import { Link, useNavigate } from 'react-router-dom';
const EventDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nameFilter, setNameFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [joiningEvent, setJoiningEvent] = useState(null); // Track which event is being joined
    const { currentUser } = useSelector((state) => state.user);
    const categories = ["festival", "technology", "entertainment", "food", "business", "sports"];
    const navigate = useNavigate()
    // Initialize socket connection
    useEffect(() => {
        const socket = io('https://eventmangement.onrender.com');

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('updateAttendees', ({ eventId, attendees }) => {
            setEvents(prevEvents => prevEvents.map(event => {
                if (event._id === eventId) {
                    return { ...event, attendees };
                }
                return event;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            let url = 'https://eventmangement.onrender.com/api/events?';

            if (nameFilter) url += `&title=${nameFilter}`;
            if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;
            if (dateFilter) url += `&date=${dateFilter}`;

            const response = await axios.get(url);
            setEvents(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch events. Please try again later.');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchEvents();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [nameFilter, categoryFilter, dateFilter]);

    const handleJoinEvent = async (eventId) => {
        try {
            setJoiningEvent(eventId);
            const response = await axios.post(`https://eventmangement.onrender.com/api/events/${eventId}/join`, {
                // userId: currentUser._id,
                token: currentUser.token
            });

            // Update local state immediately
            // setEvents(prevEvents => prevEvents.map(event => {
            //     if (event._id === eventId) {
            //         return {
            //             ...event,
            //             attendees: [...event.attendees, currentUser._id]
            //         };
            //     }
            //     return event;
            // }));
        } catch (err) {
            console.error('Error joining event:', err);
            // Handle error (maybe show a toast notification)
        } finally {
            setJoiningEvent(null);
        }
    };

    const getEventStatus = (startDateTime, endDateTime) => {
        const now = new Date();
        const selectedDateTime = dateFilter ? new Date(dateFilter) : now;
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        if (selectedDateTime < startDate) return "upcoming";
        if (selectedDateTime >= startDate && selectedDateTime <= endDate) return "live";
        return "past";
    };

    const filterEvents = (statusType) => {
        return events.filter(event => getEventStatus(event.startDateTime, event.endDateTime) === statusType);
    };

    const upcomingEvents = filterEvents("upcoming");
    const liveEvents = filterEvents("live");
    const pastEvents = filterEvents("past");

    const getButtonStyles = (event) => {
        if (joiningEvent === event._id) {
            return "w-full py-2 px-4 rounded-md bg-blue-400 text-white font-medium cursor-not-allowed opacity-75";
        }
        if (event.attendees?.includes(currentUser._id)) {
            return "w-full py-2 px-4 rounded-md border-2 border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition-colors";
        }
        if (event.attendees?.length >= event.maxAttendees) {
            return "w-full py-2 px-4 rounded-md bg-gray-300 text-gray-600 font-medium cursor-not-allowed";
        }
        return "w-full py-2 px-4 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors";
    };

    const EventList = ({ events }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            ) : error ? (
                <div className="col-span-full text-center py-8 text-red-500">
                    {error}
                </div>
            ) : events.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                    No events found
                </div>
            ) : (
                events
                    .filter(event => categoryFilter === 'all' || event.category === categoryFilter)
                    .map(event => (
                        <Link to={`/event/${event._id}`} key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src={event.imageUrl || '/api/placeholder/400/200'}
                                alt={event.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className='flex justify-between'>
                                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                                    <h5 className="text-base font-semibold mb-2">Created by: <span className='text-blue-800 capitalize'>{event.createdBy.name}</span></h5>

                                </div>

                                <p className="text-gray-600 mb-4">{event.description.length > 31 ? event.description.substring(0, 32) + "..." : event.description}</p>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(event.startDateTime).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {`${new Date(event.startDateTime).toLocaleTimeString()} - ${new Date(event.endDateTime).toLocaleTimeString()}`}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span className={`${event.attendees?.length === event.maxAttendees ? 'text-red-500 font-semibold' : ''
                                            }`}>
                                            {event.attendees?.length || 0} / {event.maxAttendees} attendees
                                        </span>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                                            {event.category}
                                        </span>
                                        <span className={`px-2 py-1 text-sm rounded-full
                                        ${event.isFree ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {event.isFree ? 'Free' : `$${event.price}`}
                                        </span>
                                    </div>
                                    {currentUser && event.createdBy._id !== currentUser._id && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => handleJoinEvent(event._id)}
                                                disabled={
                                                    joiningEvent === event._id ||
                                                    event.attendees?.length >= event.maxAttendees ||
                                                    event.attendees?.includes(currentUser._id)
                                                }
                                                className={getButtonStyles(event)}
                                            >
                                                {joiningEvent === event._id ? (
                                                    <span className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                        Joining...
                                                    </span>
                                                ) : event.attendees?.includes(currentUser._id) ? (
                                                    "Joined"
                                                ) : event.attendees?.length >= event.maxAttendees ? (
                                                    "Event Full"
                                                ) : (
                                                    "Join Event"
                                                )}
                                            </button>

                                        </div>
                                    )}

                                </div>
                            </div>
                          
                            {!currentUser && (
                                <div className="text-base opacity-60 ml-4 mb-4 text-blue-500 font-semibold bg-blue-100 px-4 py-2 rounded-lg shadow-md w-fit">
                                    Sign in to Join the Event
                                </div>
                            )}
                        </Link>
                    ))
            )}
        </div>
    );

    // Rest of your component remains the same...
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold mb-4">EventMaster Dashboard</h1>
                        <p className="text-xl opacity-90">
                            Manage your events with ease. Create, organize, and track all your events in one place.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center space-x-4">
                            <Calendar className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-500">Upcoming Events</p>
                                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center space-x-4">
                            <Users className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-500">Live Events</p>
                                <p className="text-2xl font-bold">{liveEvents.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center space-x-4">
                            <Clock className="h-8 w-8 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-500">Past Events</p>
                                <p className="text-2xl font-bold">{pastEvents.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                    <input
                        type="datetime-local"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Events Tabs Section */}
            <div className="container mx-auto px-4 py-6">
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                        {['upcoming', 'live', 'past'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Events
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    {activeTab === 'upcoming' && <EventList events={upcomingEvents} />}
                    {activeTab === 'live' && <EventList events={liveEvents} />}
                    {activeTab === 'past' && <EventList events={pastEvents} />}
                </div>
            </div>
        </div>
    );
};

export default EventDashboard;