import React from 'react'
import Navbar from './Navbar'
import Home_section from './Home_section'
import About from '../About/About'
function Home() {
  return (
    <div>
        <Navbar/>
        <Home_section/>
        <About/>
    </div>
  )
}

export default Home