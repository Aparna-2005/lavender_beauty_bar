
import React from 'react';

function About() {
  return (
    <div className="container-fluid about py-6">
      <div className="container py-3">
        <div className="row g-5 align-items-center">

          {/* About Content */}
          <div
            className="col-xl-7 wow fadeInLeft"
            data-wow-delay="0.2s"
          >
            <div>
              {/* <h4 className="text-primary">About Us</h4> */}

              <h1 className="display-5 mb-4">
                Your Beauty, Our Passion
              </h1>

              <p className="mb-4">
                Welcome to Lavender Beauty Bar, where beauty meets
                elegance and self-care becomes a beautiful experience.
                We are dedicated to helping you look beautiful, feel
                confident, and enjoy a relaxing beauty experience
                in a warm and welcoming atmosphere.
              </p>

              <div className="row g-4">

                {/* Our Mission */}
                <div className="col-md-6 col-lg-6 col-xl-6">
                  <div className="d-flex">
                    <div>
                      <i className="fas fa-heart fa-3x text-secondary"></i>
                    </div>

                    <div className="ms-4">
                      <h4>Our Mission</h4>
                      <p>
                        Our mission is to enhance your natural beauty
                        through personalized care, quality beauty
                        services, and a comfortable environment where
                        every customer feels special.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Our Promise */}
                <div className="col-md-6 col-lg-6 col-xl-6">
                  <div className="d-flex">
                    <div>
                      <i className="fas fa-spa fa-3x text-secondary"></i>
                    </div>

                    <div className="ms-4">
                      <h4>Our Promise</h4>
                      <p>
                        Inspired by the soothing beauty of lavender,
                        we focus on comfort, attention to detail,
                        and a refreshing beauty experience that helps
                        you feel confident and radiant.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Discover Button */}
                <div className="col-sm-6">
                  <a
                    href="/services"
                    className="btn btn-primary rounded-pill py-3 px-5 flex-shrink-0"
                  >
                    Discover Our Services
                  </a>
                </div>

                {/* Contact */}
                <div className="col-sm-6">
                  <div className="d-flex">
                    <i className="fas fa-phone-alt fa-2x text-secondary me-4"></i>

                    <div>
                      <h4>Get In Touch</h4>
                      <p className="mb-0">
                        We'd love to hear from you!
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* About Images */}
          <div
            className="col-xl-5 wow fadeInRight"
            data-wow-delay="0.2s"
          >
            <div className="bg-primary rounded position-relative overflow-hidden">

              <img
                src="/images/about_image.jpeg"
                className="img-fluid rounded w-100"
                alt="Lavender Beauty Bar"
              />

              <div
                style={{
                  position: "absolute",
                  top: "-15px",
                  right: "-15px"
                }}
              >
                {/* <img
                  src="/images/about-3.png"
                  className="img-fluid"
                  style={{
                    width: "150px",
                    height: "150px",
                    opacity: "0.7"
                  }}
                  alt="Beauty decoration"
                /> */}
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "10px",
                  transform: "rotate(90deg)"
                }}
              >
                {/* <img
                  src="/images/about-4.png"
                  className="img-fluid"
                  style={{
                    width: "100px",
                    height: "150px",
                    opacity: "0.9"
                  }}
                  alt="Lavender decoration"
                /> */}
              </div>

              <div className="rounded-bottom">
                {/* <img
                  src="/images/about-5.jpg"
                  className="img-fluid rounded-bottom w-100"
                  alt="Beauty and self-care"
                /> */}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default About;
