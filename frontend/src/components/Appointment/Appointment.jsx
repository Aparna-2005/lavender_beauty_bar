import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import Navbar from '../Dashboard/Navbar'

const API_URL = "http://127.0.0.1:8000/appointments/"

const SERVICES = [
  "Facial & Skin Care",
  "Hair Care & Styling",
  "Bridal Makeup",
  "Makeup & Glamour",
  "Manicure & Pedicure",
  "Waxing & Threading",
  "Hair Colouring",
  "Spa & Relaxation",
  "Saree Pleating",
]

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
]

const formatTime = (t) => {
  const [h, m] = t.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
}

const today = new Date().toISOString().split("T")[0]

const initialForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  date: "",
  time: "",
  message: "",
}

function Appointment() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  // Services page-la irundhu vara service-a auto select pannum
  useEffect(() => {
    const service = searchParams.get("service")
    if (service && SERVICES.includes(service)) {
      setForm((prev) => ({ ...prev, service }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const validate = () => {
    const err = {}
    if (!form.name.trim()) err.name = "Name kudunga"
    if (!/^[6-9]\d{9}$/.test(form.phone)) err.phone = "Valid 10-digit mobile number kudunga"
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Valid email kudunga"
    if (!form.service) err.service = "Service select pannunga"
    if (!form.date) err.date = "Date select pannunga"
    if (!form.time) err.time = "Time select pannunga"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")

    const clientErrors = validate()
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess("Appointment book aagiduchu! Seekiram unga ku confirm panrom.")
        setForm(initialForm)
        setErrors({})
      } else {
        // Django serializer errors -> field-wise show
        const serverErrors = {}
        Object.keys(data).forEach((key) => {
          serverErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key]
        })
        if (serverErrors.non_field_errors) serverErrors.time = serverErrors.non_field_errors
        setErrors(serverErrors)
      }
    } catch (err) {
      setErrors({ server: "Server connect aagala. Konjam neram kazhichu try pannunga." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid py-5">

        {/* <Navbar /> */}
      <div className="container py-5">
        <div className="text-center mx-auto pb-5" style={{ maxWidth: "700px" }}>
          <h1 className="display-5 mb-3">Book Your Appointment</h1>
          <p className="mb-0">Unga details kudunga, naanga ungala confirm pannuvom.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {success && <div className="alert alert-success">{success}</div>}
            {errors.server && <div className="alert alert-danger">{errors.server}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    className={`form-control ${errors.name ? "is-invalid" : ""}`} placeholder="Your name" />
                  <div className="invalid-feedback">{errors.name}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={10}
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`} placeholder="10-digit mobile number" />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email (optional)</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className={`form-control ${errors.email ? "is-invalid" : ""}`} placeholder="you@example.com" />
                  <div className="invalid-feedback">{errors.email}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Service *</label>
                  <select name="service" value={form.service} onChange={handleChange}
                    className={`form-select ${errors.service ? "is-invalid" : ""}`}>
                    <option value="">-- Select service --</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.service}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Date *</label>
                  <input type="date" name="date" min={today} value={form.date} onChange={handleChange}
                    className={`form-control ${errors.date ? "is-invalid" : ""}`} />
                  <div className="invalid-feedback">{errors.date}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Time *</label>
                  <select name="time" value={form.time} onChange={handleChange}
                    className={`form-select ${errors.time ? "is-invalid" : ""}`}>
                    <option value="">-- Select time --</option>
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.time}</div>
                </div>

                <div className="col-12">
                  <label className="form-label">Message (optional)</label>
                  <textarea name="message" rows="4" value={form.message} onChange={handleChange}
                    className="form-control" placeholder="Any special request?" />
                </div>

                <div className="col-12 text-center">
                  <button type="submit" className="btn btn-primary rounded-pill py-2 px-5" disabled={loading}>
                    {loading ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointment