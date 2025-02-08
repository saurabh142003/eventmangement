// features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';
const initialState= {
    currentUser: null,
    loading: false,
    response: ""
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        success:(state,action)=>{
            state.currentUser = action.payload
            state.loading = false
            state.response = `Logged in successfully`
        },
        failure:(state,action)=> {
            state.response=action.payload
        },
        userDelete:(state)=>{
            state.currentUser=null
            state.loading = false
        },
        userSignOut:(state)=>{
            state.currentUser=null
            state.loading=false
        }


    }
});

export const { setLoading, success, failure,userDelete ,userSignOut} = userSlice.actions;

export default userSlice.reducer;
