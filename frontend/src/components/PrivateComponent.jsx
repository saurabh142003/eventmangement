import React from 'react'
import { useSelector } from 'react-redux'
import { NavLink, Outlet } from 'react-router-dom'

function PrivateComponent() {
  const { currentUser } = useSelector((state) => state.user)

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
      {currentUser ? (
        <Outlet />
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm text-center space-y-6">
          <p className="text-xl font-semibold text-gray-800">
            You need to be signed in to access this content.
          </p>
          <NavLink
            to="/signin"
            className="text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-2 px-6 rounded-md text-lg font-semibold transition-all duration-300 ease-in-out shadow-md hover:shadow-xl"
          >
            Click here to Sign In First
          </NavLink>
        </div>
      )}
    </div>
  )
}

export default PrivateComponent
