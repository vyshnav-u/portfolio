import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import DesignShowcase from '../components/DesignShowcase'
import Work from '../components/Work'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

function Home() {
  return (
    <div>
      <Hero/>
      <DesignShowcase/>
      <About/>
      <Work/>
      <Contact/>
      <Footer/>
    </div>
  )
}

export default Home
