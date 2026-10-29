import { Routes, Route, Navigate ,BrowserRouter} from "react-router-dom";
import Signin from "./components/authentication/Signin";
import Login from "./components/authentication/Login";
import Mfa_otp from "./components/authentication/Mfa_otp";

import "./App.css";
import Home from "./components/Dashboard/Home";
import Home_section from "./components/Dashboard/Home_section";
import About from "./components/About/About";
import Appointment from "./components/Appointment/Appointment";
import Courses from "./components/Courses/Courses";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Mfa_otp" element={<Mfa_otp />} />

        <Route path="*" element={<Navigate to="/signin" replace />}/>

        <Route path="/home"  element={<Home/>}/>
        <Route path="/home_section" element={<Home_section/>}/>

        <Route path='/about' element={<About/>}/>

        <Route path='/appointment' element={<Appointment/>}/>


        <Route path="/courses" element={<Courses/>}/>
      </Routes>
  );
}

export default App;
