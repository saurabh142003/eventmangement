import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { userDelete, userSignOut } from '../redux/UserSlice';
import { Link } from 'react-router-dom';
import { Edit, Trash, Eye } from "lucide-react";
const Profile = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [events, setEvents] = useState([]);
    const [showNoEvents, setShowNoEvents] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchUserEvents = async () => {
        try {
            const response = await fetch(`https://eventmangement.onrender.com/api/events/user/${currentUser._id}`);
            const data = await response.json();
            console.log(data, "this is data");

            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]);
            }

            if (data.length === 0) {
                setShowNoEvents(true);
                setTimeout(() => setShowNoEvents(false), 3000);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
            setShowNoEvents(true);
            setTimeout(() => setShowNoEvents(false), 3000);
        }
    };

    const handleDeleteUser = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) {
            return; // ❌ Cancel deletion if user clicks "No"
        }
    
        try {
            const response = await fetch(`https://eventmangement.onrender.com/api/auth/user/delete/${currentUser._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${currentUser.token}`, // ✅ Send token for authentication
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to delete event");
            }
    
            // ✅ Remove deleted event from UI
            dispatch(userDelete())
    
            alert("Event deleted successfully!"); // ✅ Success message
            
    
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event. Please try again.");
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) {
            return; // ❌ Cancel deletion if user clicks "No"
        }
    
        try {
            const response = await fetch(`https://eventmangement.onrender.com/api/events/event/delete/${eventId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${currentUser.token}`, // ✅ Send token for authentication
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to delete event");
            }
    
            // ✅ Remove deleted event from UI
            setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    
            alert("Event deleted successfully!"); // ✅ Success message
    
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event. Please try again.");
        }
    };
    

    const handleSignOut = async () => {
        try {
            dispatch(userSignOut());
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (!currentUser) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-xl w-full shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 md:h-48"></div>
                    <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="flex flex-col sm:flex-row items-center">
                            <img
                                src={currentUser.profilePicture || 'https://w7.pngwing.com/pngs/177/551/png-transparent-user-interface-design-computer-icons-default-stephen-salazar-graphy-user-interface-design-computer-wallpaper-sphere-thumbnail.png'}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-white -mt-16 object-cover shadow-lg"
                            />
                            <div className="mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">{currentUser.name}</h1>
                                <p className="text-lg text-gray-600">{currentUser.email}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
                            <button
                                onClick={handleDeleteUser}
                                className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                                Delete Account
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Event Controls */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
                    <button
                        onClick={() => navigate('/eventcreate')}
                        className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        Create Event
                    </button>
                    <button
                        onClick={fetchUserEvents}
                        className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        View Your Events
                    </button>
                </div>

                {/* Events Grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                        events.map(event => (
                            <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl">
                                {/* ✅ Event Image & Title Section */}
                                <div className="relative h-48">
                                    <img
                                        src={event.imageUrl || "https://via.placeholder.com/300"}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                                        <p className="text-gray-200">{new Date(event.startDateTime).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* ✅ Action Buttons */}
                                <div className="p-4 flex justify-between items-center">
                                    {/* 🔵 View Event Button */}
                                    <Link to={`/event/${event._id}`} className="text-blue-500 hover:text-blue-700 transition">
                                        <Eye size={22} />
                                    </Link>

                                    {/* 🟢 Edit Event Button */}
                                    <Link to={`/editevent/${event._id}`} className="text-green-500 hover:text-green-700 transition">
                                        <Edit size={22} />
                                    </Link>

                                    {/* 🔴 Delete Event Button */}
                                    <button onClick={() => handleDelete(event._id)} className="text-red-500 hover:text-red-700 transition">
                                        <Trash size={22} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        showNoEvents && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-xl text-gray-600">You haven't created any events</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;