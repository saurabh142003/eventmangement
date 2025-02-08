import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { setLoading,success,failure } from '../redux/UserSlice';


function SignIn() {
   
    const [formData, setFormData] = useState({ email: '', password: '' });
    // const [response, setResponse] = useState(null);
    // const [loading, setLoading] = useState(false);
    const userr = useSelector((state) => state.user);
    const dispatch = useDispatch();
     
    const navigate = useNavigate();

    function changeHandler(e) {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    }

    async function submitHandler(e) {
        e.preventDefault();
        const { email, password } = formData;

        if (!email || !password) {
            dispatch(failure("Please fill in all fields."));
            return;
        }

        
        try {
            dispatch(setLoading(true));
            const result = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
          

            });
            const data = await result.json();
            dispatch(success(data))
            setTimeout(() => {
                navigate('/');
            }, 500);
            dispatch(setLoading(false));
        } catch (err) {
            dispatch(setLoading(false));
            console.log('Error:', err);
            dispatch(failure("An error occurred. Please try again."));
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <form onSubmit={submitHandler} className='w-full max-w-md p-6 bg-white shadow-2xl rounded-md flex flex-col items-center gap-4 sm:p-8'>
                <div className='w-full'>
                    <input type="email" onChange={changeHandler} placeholder='Your E-mail' id='email' className='w-full text-base mt-3 outline-none border border-gray-300 rounded-md p-4 focus:border-blue-500' />
                </div>
                <div className='w-full'>
                    <input type="password" onChange={changeHandler} placeholder='Your Password' id='password' className='w-full text-base mt-3 outline-none border border-gray-300 rounded-md p-4 focus:border-blue-500' />
                </div>
                <div className='w-full'>
                    <button className='w-full uppercase bg-blue-800 p-3 mt-4 text-white rounded-md shadow-lg hover:bg-blue-700'>{userr.loading ? "Loading..." : "Sign In"}</button>
                </div>
         
                <div className='flex gap-2 mt-5'>
                    <p className="text-base font-thin">If you are a new user?</p>
                    <NavLink className="text-blue-800 underline hover:text-blue-600" to="/signup">Sign Up</NavLink>
                </div>
               
               
            </form>
        </div>
    );
}

export default SignIn;

