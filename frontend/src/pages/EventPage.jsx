import React from 'react';
import { Calendar, MapPin, Clock, Link, Users, Currency } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
const EventPage = () => {
    // Mock current user - would normally come from auth context/state
    const { currentUser } = useSelector((state) => state.user);
    const [event, setEvent] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const socket = io('http://localhost:5000');

        // ✅ Fetch event when `id` changes
        const fetchEvent = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/events/${id}`);
                const data = await response.json();
                setEvent(data);
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };

        fetchEvent(); // ✅ Call function when component mounts

        // ✅ Listen for attendee updates
        socket.on('updateAttendees', ({ eventId, attendees }) => {
            if (eventId === id) {  // ✅ Only update if it's the same event
                setEvent(prevEvent => ({
                    ...prevEvent,
                    attendees: attendees // ✅ Use updated list from server
                }));
            }
        });

        return () => {
            socket.disconnect(); // ✅ Cleanup on unmount
        };
    }, [id]); // ✅ Runs when `id` changes

    // ✅ Handle Joining Event
    const handleJoinEvent = async () => {
        try {
            await axios.post(`http://localhost:5000/api/events/${id}/join`, {
                token: currentUser.token
            });
        } catch (err) {
            console.error('Error joining event:', err);
        }
    };

    const getButtonStyles = (event) => {
      
        if (event.attendees?.includes(currentUser._id)) {
            return "w-full py-2 px-4 rounded-md border-2 border-blue-500 text-blue-500 font-medium hover:bg-blue-50 transition-colors";
        }
        if (event.attendees?.length >= event.maxAttendees) {
            return "w-full py-2 px-4 rounded-md bg-gray-300 text-gray-600 font-medium cursor-not-allowed";
        }
        return "w-full py-2 px-4 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors";
    };

    // ✅ Derived Computations
    const isCreator = currentUser?._id === event?.createdBy;
    const spotsRemaining = event ? event.maxAttendees - event.attendees.length : 0;
    const isFullyBooked = spotsRemaining <= 0;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {event && <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Event Image */}
                    <div className="relative h-80 w-full mb-6 rounded-xl overflow-hidden">
                        <img
                            src={event.imageUrl ? event.imageUrl : "https://cdn.pixabay.com/photo/2024/03/12/09/28/ai-generated-8628373_640.png"}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {event.title}
                                </h1>
                                <div className="flex items-center space-x-4 mb-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {event.category}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <img
                                            src={event.creatorImage || "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg"}
                                            alt={event.creatorName || "name"}
                                            className="h-6 w-6 rounded-full"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Hosted by {event.creatorName || "name"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Join Button - Only shown if not creator and event not full */}
                            {currentUser && event.createdBy !== currentUser._id && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleJoinEvent(event._id)}
                                        disabled={
                                            event.attendees?.length >= event.maxAttendees ||
                                            event.attendees?.includes(currentUser._id)
                                        }
                                        className={getButtonStyles(event)}
                                    >
                                        {event.attendees?.includes(currentUser._id) ? (
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

                        {/* Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="col-span-2">
                                <h2 className="text-xl font-semibold mb-4">About this event</h2>
                                <p className="text-gray-600 whitespace-pre-wrap mb-6">
                                    {event.description}
                                </p>

                                {/* Date and Time */}
                                <div className="flex items-start space-x-3 mb-4">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="font-medium">{formatDate(event.startDateTime)}</p>
                                        <p className="text-gray-600">
                                            {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start space-x-3 mb-4">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                        <p className="font-medium">Location</p>
                                        <p className="text-gray-600">{event.location}</p>
                                    </div>
                                </div>

                                {/* URL if available */}
                                {event.url && (
                                    <div className="flex items-start space-x-3">
                                        <Link className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="font-medium">Event Website</p>
                                            <a
                                                href={event.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {event.url}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Side Panel */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                {/* Price */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <Currency className="h-5 w-5 text-gray-400" />
                                    <span className="text-xl font-semibold">
                                        {event.isFree ? 'Free' : `$${event.price}`}
                                    </span>
                                </div>

                                {/* Attendee Count */}
                                <div className="flex items-center space-x-2 mb-4">
                                    <Users className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium">{event.attendees.length} attending</p>
                                        <p className="text-sm text-gray-600">
                                            {spotsRemaining} spots remaining
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${(event.attendees.length / event.maxAttendees) * 100}%`,
                                        }}
                                    ></div>
                                </div>

                                {/* Mobile Join Button */}
                                {currentUser && event.createdBy !== currentUser._id && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleJoinEvent(event._id)}
                                            disabled={
                                             
                                                event.attendees?.length >= event.maxAttendees ||
                                                event.attendees?.includes(currentUser._id)
                                            }
                                            className={getButtonStyles(event)}
                                        >
                                            {event.attendees?.includes(currentUser._id) ? (
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
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default EventPage;