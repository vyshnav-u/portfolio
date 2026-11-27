import React from "react";
import Navbar from "./Navbar";
import AnimatedName from "./AnimatedName";
import DesignShowcase from "./DesignShowcase";
import TiltImage from "./TiltImage";

const GRID_SIZE = 56; // px, size of each square
const GRID_COLOR = "rgba(20, 6, 5, 0.12)"; // grid line color

// The beige background and the red scribbles now live in <ScribbleBackground>,
// which wraps Hero and About so the lines can flow from one into the other.
function Hero() {
    return (
        <section className="relative overflow-hidden text-[#140605]">
            {/* Grid background: fades out into the beige */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100%]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${GRID_COLOR} 1px, transparent 1px),
                        linear-gradient(to bottom, ${GRID_COLOR} 1px, transparent 1px)
                    `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                    WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                    maskImage:
                        "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
                }}
            />

            {/* Hero content: this wrapper keeps the original height, so all the
                absolute positions below behave exactly as before. */}
            <div className="relative min-h-[48vh] md:min-h-[80vh]">
                <Navbar />

                {/* Floating top image */}
                <div className="absolute hidden  w-100 overflow -right-60 md:-right-100 top-16 md:w-200 rotate-[40deg]">
                    <img
                        src="/spike1.png"
                        alt="Portfolio visual"
                        className="object-contain"
                    />
                </div>

                {/* Main Heading */}
                <div className="absolute left-1/2 top-35 z-100 md:top-[45%] w-full -translate-x-1/2 -translate-y-1/2 px-3">

                    <AnimatedName />

                    {/* Main Image */}
                    <div className="w-35 md:w-57 overflow absolute left-1/2 top-35 md:top-[75%] -translate-x-1/2 -translate-y-1/2 rotate-[-5deg]">
                       <TiltImage src="/id.png" backSrc="/id-back.png" alt="Vyshnav ID card" />
                    </div>

                </div>

                {/* Floating left image */}
                <div className="absolute hidden w-100 overflow -left-60 bottom-[30%] md:-left-100 md:w-200 rotate-[60deg]">
                    <img
                        src="/spike1.png"
                        alt="Portrait"
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Film strip: transparent, so it sits on the shared beige and grid */}
            <div className="absolute inset-x-0 top-70 md:top-100"><DesignShowcase /></div>
            <div className="h-40 md:h-60"></div>
        </section>
    );
}

export default Hero;
