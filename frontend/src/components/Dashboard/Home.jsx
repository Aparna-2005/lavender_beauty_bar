import React from 'react'
import Navbar from './Navbar'
import Home_section from './Home_section'
import About from '../About/About'
import Services from '../Services/Services'
function Home() {
  return (
    <div>
        <Navbar/>
        <Home_section/>
        <About/>
        <Services/>
    </div>
  )
}

export default Home