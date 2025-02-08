import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const {currentUser} = useSelector((state)=>state.user);
  const navigate = useNavigate();

  

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-gray-800">
              EventApp
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
            ) : (
              <button
                onClick={() => navigate('/signin')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
export default Header;