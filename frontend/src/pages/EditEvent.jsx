import React, { useState, useRef,useEffect } from 'react';
import { Calendar, MapPin, Clock, Link, Users, Currency, Image } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const EditEvent = () => {
  const fileInputRef = useRef(null);
  const categories = ["festival", "technology", "entertainment", "food", "business", "sports"];
const {currentUser} = useSelector((state)=>state.user)
const navigate = useNavigate()
  const [formData, setFormData] = useState(null);

  const { id }= useParams();
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`https://eventmangement.onrender.com/api/events/${id}`);
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.startDateTime) newErrors.startDateTime = 'Start date and time is required';
    if (!formData.endDateTime) newErrors.endDateTime = 'End date and time is required';
    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      newErrors.endDateTime = 'End date must be after start date';
    }
    if (!formData.isFree && (!formData.price || formData.price < 0)) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.maxAttendees || formData.maxAttendees < 1) {
      newErrors.maxAttendees = 'Please enter a valid number of attendees';
    }
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.url) {
      newErrors.url = 'Please enter a valid URL';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Ensure form submission is prevented
    
    console.log("Form Submission Triggered!"); // ✅ Debugging
    console.log("Form Data State:", formData);
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
        const formDataToSend = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'imageFile' && formData[key]) {
                console.log("Appending Image:", formData[key]);
                formDataToSend.append('image', formData[key]);
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

     
        // formDataToSend.append('token', currentUser.token);
    
        // ✅ Log FormData Properly
        console.log("FormData Contents:");
        // for (let [key, value] of formDataToSend.entries()) {
        //     console.log(key, value);
        // }

        try {
            const response = await fetch(`https://eventmangement.onrender.com/api/events/event/edit/${id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${currentUser.token}`, // ✅ Send token in headers
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Failed to create event');
            }

            navigate('/profile');
        } catch (error) {
            console.error('Error creating event:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to create event. Please try again.'
            }));
        }
    } else {
        setErrors(newErrors);
    }
};

  

  const InputField = ({ icon: Icon, ...props }) => (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
      <input
        {...props}
        className={`w-full p-2 ${Icon ? 'pl-10' : ''} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[props.name] ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {errors[props.name] && (
        <p className="mt-1 text-sm text-red-500">{errors[props.name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
          
         {formData && <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event location"
                    className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="startDateTime"
                      value={formData.startDateTime}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.startDateTime && (
                    <p className="mt-1 text-sm text-red-500">{errors.startDateTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="endDateTime"
                      value={formData.endDateTime}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.endDateTime && (
                    <p className="mt-1 text-sm text-red-500">{errors.endDateTime}</p>
                  )}
                </div>
              </div>

              {/* Price and Free Event Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <Currency className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={formData.isFree}
                      className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
                <div className="flex items-center mt-8">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    This is a free event
                  </label>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event URL (optional)
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.url && (
                  <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                )}
              </div>

              {/* Max Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    placeholder="Enter maximum number of attendees"
                    className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-500">{errors.maxAttendees}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option className="capitalize" key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Image className="h-5 w-5 mr-2" />
                    Upload Image
                  </button>
                </div>
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                   Submit
                </button>
              </div>
            </div>
          </form>}
        </div>
      </div>
    </div>
  );
};

export default EditEvent;