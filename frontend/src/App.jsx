import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import EventDashboard from './pages/EventDashBoard'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import path from 'path';
import EventCreation from './pages/EventCreation';
import EventPage from './pages/EventPage';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store';
import { Provider } from 'react-redux';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Header from './components/Header';
import Profile from './pages/Profile';
import PrivateComponent from './components/PrivateComponent';
import EditEvent from './pages/EditEvent';

function App() {


  return (
    <Provider store={store}>
      <BrowserRouter>

        <PersistGate loading={null} persistor={persistor}>
          <Header/>
          <Routes>
            <Route path='/' element={<EventDashboard />} />
            {/* <Route path='/eventcreate' element={<EventCreation />} /> */}
            <Route path='/event/:id' element={<EventPage />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/signin' element={<SignIn />} />
            {/* <Route path='/profile' element={<Profile />} /> */}
            <Route element={<PrivateComponent/>}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/eventcreate' element={<EventCreation />} />
              <Route path='/editevent/:id' element={<EditEvent />} />
            </Route>
          </Routes>
        </PersistGate>
      </BrowserRouter>
    </Provider>
  )
}

export default App
