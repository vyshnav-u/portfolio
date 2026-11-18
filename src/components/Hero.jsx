
import React from "react";
import Navbar from "./Navbar";
import AnimatedName from "./AnimatedName";
import DesignShowcase from "./DesignShowcase";

function Hero() {
    return (
        <section className="relative min-h-[80vh] overflow bg-[#f8f5ef] text-[#140605]">

            <Navbar />

            {/* Floating top image */}
            <div className="absolute right-5 top-16 h-16 w-16 overflow-hidden md:right-12 md:top-16 md:h-16 md:w-16">
                <img
                    src="/images/hero-top.jpg"
                    alt="Portfolio visual"
                    className="h-full w-full object-cover grayscale"
                />
            </div>

            {/* Main Heading */}
            <div className="absolute left-1/2 top-[52%] w-full -translate-x-1/2 -translate-y-1/2 px-3">

                <AnimatedName />

                {/* Blur Glass Effect */}
                <div className="w-60 absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 ">
                    <img src="/id.png" alt="" />
                </div>

            </div>

            {/* Floating left image */}
            <div className="absolute bottom-[18%] left-[7%] h-16 w-16 overflow-hidden md:bottom-[18%] md:left-[7%] md:h-16 md:w-16">
                <img
                    src="/images/hero-left.jpg"
                    alt="Portrait"
                    className="h-full w-full object-cover grayscale"
                />
            </div>

            {/* Description */}
            <div className="absolute top-[90%] left-1/2 w-[85%] -translate-x-1/2 text-center md:bottom-[24%] md:w-150">
                <p className="text-[10px] leading-[1.5] tracking-wide md:text-[11px]">
                    Hey, I'm Vyshnav — a developer
                    <br />
                    turning ideas into meaningful digital experiences, building creative solutions and bringing concepts to life
                    <br />
                    Building with creativity, purpose and code.
                </p>
            </div>

            

        </section>

    );
}

export default Hero;
