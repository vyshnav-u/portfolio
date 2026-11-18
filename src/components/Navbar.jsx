import React from 'react'

function Navbar() {
    return (
        <>
            {/* Navigation */}
            <nav className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-5 py-5 md:px-8">

                <a href="#" className="font-bold text-xl tracking-wide">
                    ysh
                </a>

                <div className="hidden items-center gap-5 text-[10px] md:flex">
                   
                    <a href="#services" className="hover:opacity-50">Work</a>
                    <a href="#about" className="hover:opacity-50">Process</a>
                    <a href="#contact" className="hover:opacity-50">About</a>
                </div>

                <a href="#contact" className="text-[10px] hover:opacity-50">
                    Contact
                </a>
            </nav>
        </>
    )
}

export default Navbar
