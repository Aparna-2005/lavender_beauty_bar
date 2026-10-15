import React from 'react'
import { Link } from 'react-router-dom'

const services = [
  { title: "Facial & Skin Care", img: "service-1.jpg",
    desc: "Pamper your skin with personalized facial treatments that cleanse, nourish, and rejuvenate, leaving your skin radiant and refreshed." },
  { title: "Hair Care & Styling", img: "service-2.jpg",
    desc: "Transform your look with professional haircuts, styling, hair spa, smoothening, and nourishing hair treatments." },
  { title: "Bridal Makeup", img: "service-3.jpg",
    desc: "Look stunning on your special day with elegant bridal makeup tailored to your style, personality, and celebration." },
  { title: "Makeup & Glamour", img: "service-4.jpg",
    desc: "From natural everyday looks to party-ready glam, our makeup services help you shine on every occasion." },
  { title: "Manicure & Pedicure", img: "service-5.jpg",
    desc: "Treat your hands and feet to relaxing care, nail grooming, and beautiful finishes for a polished look." },
  { title: "Waxing & Threading", img: "service-6.jpg",
    desc: "Enjoy smooth skin and perfectly shaped eyebrows with our gentle and professional hair-removal services." },
  { title: "Hair Colouring", img: "service-6.jpg",
    desc: "Refresh your appearance with beautiful hair colours, highlights, and personalized colour styling." },
  { title: "Spa & Relaxation", img: "service-6.jpg",
    desc: "Unwind from your busy routine with soothing beauty treatments designed to help you relax and feel renewed." },
  { title: "Saree Pleating", img: "service-6.jpg",
    desc: "Get perfectly pleated and draped sarees for weddings, functions, and festive occasions." },
]

function Services() {
  return (
    <div className="container-fluid service py-1">
      <div className="container py-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h1 className="display-5 mb-4">We Services provided best offer</h1>
          <p className="mb-0">
            Discover the perfect blend of beauty, care, and relaxation at Lavender Beauty Bar. From rejuvenating
            skincare treatments to glamorous makeovers, our expert beauty services are designed to enhance your
            natural beauty and leave you feeling confident, refreshed, and beautiful.
          </p>
        </div>

        <div className="row g-4">
          {services.map((s, i) => (
            <div key={s.title} className="col-md-6 col-lg-4 wow fadeInUp" data-wow-delay={`${0.2 + (i % 3) * 0.2}s`}>
              <div className="service-item">
                <div className="service-img">
                  <img src={`img/${s.img}`} className="img-fluid rounded-top w-100" alt={s.title} />
                </div>
                <div className="rounded-bottom p-4">
                  <span className="h4 d-inline-block mb-4 text-secondary">{s.title}</span>
                  <p className="mb-4 text-primary">{s.desc}</p>
                  <Link
                    className="btn btn-primary rounded-pill py-2 px-4"
                    to={`/appointment?service=${encodeURIComponent(s.title)}`}
                  >
                    Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Services