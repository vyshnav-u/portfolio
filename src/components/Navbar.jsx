import React from 'react'

function Navbar() {
    return (
        <>
            {/* Navigation */}
            <nav className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-5 py-5 md:px-8">

                <a href="#" className="font-bold text-md md:text-3xl tracking-iwde">
                    ysh.
                </a>

                <div className="hidden items-center text-sm  gap-5  md:flex">
                    <a href="#Home" className="hover:opacity-50">Home</a>
                    <a href="#work" className="hover:opacity-50">Projects</a>
                    <a href="#about" className="hover:opacity-50">About</a>
                </div>

                <a href="#contact" className="font-bold text-sm md:text-lg hover:opacity-50">
                    Contact ↓
                </a>
            </nav>
        </>
    )
}

export default Navbar
