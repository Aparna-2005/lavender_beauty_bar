import React, { useRef } from "react";
import Navbar from './Navbar'
import Home_section from './Home_section'
import About from '../About/About'
import Services from '../Services/Services'
import Courses from '../Courses/Courses'
import Contact from "../Contact/Contact";
function Home() {
   const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const galleryRef = useRef(null);
  const appointmentRef = useRef(null);
  const coursesRef = useRef(null);
  const contactRef = useRef(null);

  const refs = {
    homeRef,
    aboutRef,
    servicesRef,
    galleryRef,
    appointmentRef,
    coursesRef,
    contactRef,
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <Navbar
        scrollToSection={scrollToSection}
        refs={refs}
      />

      <div ref={homeRef} id="home">
        <Home_section/>
      </div>

      <div ref={aboutRef} id="about">
        <About/>
      </div>

      <div ref={servicesRef} id="services">
        <Services/>
      </div>

      <div ref={galleryRef} id="gallery">
        {/* Your Gallery component */}
      </div>

      <div ref={appointmentRef} id="appointment">
        {/* Your Appointment component */}
      </div>

      <div ref={coursesRef} id="courses">
        <Courses/>
      </div>

      <div ref={contactRef} id="contact">
        <Contact/>
      </div>
    </>
  );
}

export default Home