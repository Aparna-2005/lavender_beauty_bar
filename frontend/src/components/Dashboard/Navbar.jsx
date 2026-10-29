import React from 'react'

function Navbar({ scrollToSection, refs }) {
  return (
    <>
      <div className="container-fluid topbar bg-light px-3 d-none d-lg-block">
        <div className="row gx-0 align-items-center">
          <div className="col-lg-8 text-center text-lg-start mb-2 mb-lg-0">
            <div className="d-flex flex-wrap text-primary">
              {/* <a href="#" className="text-muted small me-4"><i className="fas fa-map-marker-alt text-primary me-2"></i>Find A Location</a> */}
              <a href="tel:+91 7550046735" className="text-muted small me-4 "><i className="fas fa-phone-alt text-primary me-2"></i>+91 7550046735</a>
              <a href="mailto:aanathiselvi32@gmail.com" className="text-muted small me-0"><i className="fas fa-envelope text-primary me-2"></i>aanathiselvi32@gmail.com</a>
            </div>
          </div>
          <div className="col-lg-4 text-center text-lg-end ">
            <div className="d-inline-flex align-items-center" style={{ height: '45px' }}>
              <a href="#"><small className="me-3 text-dark"><i className="fa fa-user text-primary me-2"></i></small></a>
              <a href="#"><small className="me-3 text-dark"><i className="fa fa-sign-in-alt text-primary me-2"></i>Login</small></a>
              <div className="dropdown">
                <a href="#" className="dropdown-toggle text-dark" data-bs-toggle="dropdown"><small><i className="fa fa-home text-primary me-2"></i> My Dashboard</small></a>
                <div className="dropdown-menu rounded">
                  <a href="#" className="dropdown-item"><i className="fas fa-user-alt me-2"></i> My Profile</a>
                  <a href="#" className="dropdown-item"><i className="fas fa-comment-alt me-2"></i> Inbox</a>
                  <a href="#" className="dropdown-item"><i className="fas fa-bell me-2"></i> Notifications</a>
                  <a href="#" className="dropdown-item"><i className="fas fa-cog me-2"></i> Account Settings</a>
                  <a href="#" className="dropdown-item"><i className="fas fa-power-off me-2"></i> Log Out</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid position-relative p-0">
        <nav className="navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
          <a href="#home" className="navbar-brand p-0"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(refs.homeRef);
            }}>
            <h1 className="text-primary">
              <img src="images/logo.png" alt="Logo" />
              Lavender
            </h1>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="fa fa-bars"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto py-0">

              <a href="#home" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.homeRef);
                }}>
                Home
              </a>

              <a href="#about" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.aboutRef);
                }}>
                About
              </a>

              <a href="#services" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.servicesRef);
                }}>
                Services
              </a>

              <a href="#gallery" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.galleryRef);
                }}>
                Gallery
              </a>

              <a href="#appointment" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.appointmentRef);
                }}>
                Appointment
              </a>

              <a href="#courses" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.coursesRef);
                }}>
                Courses
              </a>

              <a href="#contact" className="nav-item nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(refs.contactRef);
                }}>
                Contact Us
              </a>

            </div>
          </div>
        </nav>
        {/* <!-- Header Start --> */}
        {/* <div className="header-carousel owl-carousel">
                <div className="container text-center py-5" >
                    <h4 className="text-white display-4 mb-4 wow fadeInDown" data-wow-delay="0.1s">Contact Us</h4>
                    <ol className="breadcrumb d-flex justify-content-center mb-0 wow fadeInDown" data-wow-delay="0.3s">
                        <li className="breadcrumb-item"><a href="index.html">Home</a></li>
                        <li className="breadcrumb-item"><a href="#">Pages</a></li>
                        <li className="breadcrumb-item active text-primary">Contact</li>
                    </ol>    
                </div>
            </div> */}
        {/* <!-- Header End --> */}
      </div>

    </>

  )
}

export default Navbar