import React, { useEffect, useRef } from 'react'

function Home_section() {
  const carouselRef = useRef(null)

  useEffect(() => {
    const $ = window.jQuery
    if (!$ || !$.fn || !$.fn.owlCarousel) {
      console.error('jQuery or Owl Carousel is not loaded')
      return
    }

    const $el = $(carouselRef.current)

    $el.owlCarousel({
      autoplay: true,
      smartSpeed: 1500,
      items: 1,
      dots: true,
      loop: true,
      nav: true,
      navText: [
        '<i class="bi bi-arrow-left"></i>',
        '<i class="bi bi-arrow-right"></i>',
      ],
    })

    // Destroy on unmount (also handles React Strict Mode's double-mount in dev)
    return () => {
      $el.trigger('destroy.owl.carousel')
      $el.removeClass('owl-loaded owl-drag')
    }
  }, [])

  return (

      <div className="header-carousel owl-carousel" ref={carouselRef}>
        {/* Slide 1 */}
        <div className="header-carousel-item">
          <img src="/images/bg1.png" className="img-fluid w-100" alt="Image" />
          <div className="carousel-caption">
            <div className="container">
              <div className="row gy-0 gx-5">
                <div className="col-lg-0 col-xl-5"></div>
                <div className="col-xl-7 animated fadeInLeft">
                  <div className="text-sm-center text-md-end">
                    <h4 className="text-primary text-uppercase fw-bold mb-4">Welcome To Lavender Beauty Bar</h4>
                    <h5 className="display-4 text-uppercase text-white mb-2">
                      REVEAL YOUR BEAUTY, RADIATE CONFIDENCE
                    </h5>
                    <p className="mb-2 fs-5">
                     Indulge in the art of beauty and self-care with our personalized treatments. From glowing skin to stunning makeovers, let us bring out the most beautiful version of you.
                    </p>
                    <div className="d-flex justify-content-center justify-content-md-end flex-shrink-0 mb-4">
                      <a className="btn btn-light rounded-pill py-3 px-4 px-md-5 me-2" href="#">
                        <i className="fas fa-play-circle me-2"></i> Watch Video
                      </a>
                      <a className="btn btn-primary rounded-pill py-3 px-4 px-md-5 ms-2" href="#">
                        Appointment
                      </a>
                    </div>
                    <div className="d-flex align-items-center justify-content-center justify-content-md-end">
                      <h2 className="text-white me-2">Follow Us:</h2>
                      <div className="d-flex justify-content-end ms-2">
                        {/* <a className="btn btn-md-square btn-light rounded-circle me-2" href="#"><i className="fab fa-facebook-f"></i></a> */}
                        {/* <a className="btn btn-md-square btn-light rounded-circle mx-2" href="#"><i className="fab fa-twitter"></i></a> */}
                        <a className="btn btn-md-square btn-light rounded-circle mx-2" href="https://instagram.com/_lavender_beauty_bar?rpxt=YnRiajloaTlraGFy" target="__blank"><i className="fab fa-instagram"></i></a>
                        {/* <a className="btn btn-md-square btn-light rounded-circle ms-2" href="#"><i className="fab fa-linkedin-in"></i></a> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className="header-carousel-item">
          <img src="/images/bg1.png" className="img-fluid w-100" alt="Image" />
          <div className="carousel-caption">
            <div className="container">
              <div className="row g-5">
                <div className="col-12 animated fadeInUp">
                  <div className="text-center">
                    <h4 className="text-primary text-uppercase fw-bold mb-4">WELCOME TO LAVENDER BEAUTY BAR</h4>
                    <h3 className="display-4 text-uppercase text-white mb-4">
                      ENHANCE YOUR BEAUTY, EMBRACE YOUR GLOW
                    </h3>
                    <p className="mb-5 fs-5">
                      Discover the perfect blend of beauty, elegance, and self-care at Lavender Beauty Bar. Experience personalized beauty treatments designed to make you look radiant, feel confident, and shine every day.
                    </p>
                    <div className="d-flex justify-content-center flex-shrink-0 mb-4">
                      {/* <a className="btn btn-light rounded-pill py-3 px-4 px-md-5 me-2" href="#">
                        <i className="fas fa-play-circle me-2"></i> Watch Video
                      </a> */}
                     <a className="btn btn-primary rounded-pill py-3 px-4 px-md-5 ms-2" href="#">
                        Appointment
                      </a>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                      <h2 className="text-white me-2">Follow Us:</h2>
                      <div className="d-flex justify-content-end ms-2">
                        {/* <a className="btn btn-md-square btn-light rounded-circle me-2" href="#"><i className="fab fa-facebook-f"></i></a> */}
                        {/* <a className="btn btn-md-square btn-light rounded-circle mx-2" href="#"><i className="fab fa-twitter"></i></a> */}
                        <a className="btn btn-md-square btn-light rounded-circle mx-2" href="#"><i className="fab fa-instagram"></i></a>
                        {/* <a className="btn btn-md-square btn-light rounded-circle ms-2" href="#"><i className="fab fa-linkedin-in"></i></a> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Home_section