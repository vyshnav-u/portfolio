import React from "react";

const BG = "#f8f5ef";
const ACCENT = "#140605";

const nav = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { label: "GitHub", href: "https://github.com/your-username" },
  { label: "LinkedIn", href: "https://linkedin.com/in/your-username" },
  { label: "Instagram", href: "https://instagram.com/your-username" },
];

function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&display=swap');
        .footer-font { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; }
        .footer-logo { font-weight: 800; letter-spacing: -0.07em; line-height: 0.75; }
      `}</style>

      {/* Inverted colors: dark background, beige text */}
      <footer
        className="footer-font overflow-hidden px-4 pt-12 md:px-8 md:pt-16"
        style={{ backgroundColor: ACCENT, color: BG }}
      >
        {/* Links row */}
        <div className="flex flex-col gap-10 text-[11px] font-bold uppercase tracking-tight md:flex-row md:justify-between md:text-xs">
          <ul className="flex flex-col gap-2">
            <li className="opacity-50">Menu</li>
            {nav.map((n) => (
              <li key={n.label}>
                <a href={n.href} className="hover:underline underline-offset-4">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="flex flex-col gap-2">
            <li className="opacity-50">Social</li>
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 md:items-end md:text-right">
            <span className="opacity-50">Status</span>
            <span>Open to freelance & internships</span>
            <button
              onClick={toTop}
              className="mt-2 w-fit uppercase underline-offset-4 hover:underline"
            >
              Back to top ↑
            </button>
          </div>
        </div>

        {/* Giant logo: each letter lifts on hover */}
        <div className="mt-16 select-none md:mt-24">
          <div className="footer-logo flex text-[44vw] md:text-[30vw]">
            {["y", "s", "h"].map((ch) => (
              <span
                key={ch}
                className="inline-block transition-transform duration-500 ease-out hover:-translate-y-[4%]"
              >
                {ch}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col gap-1 border-t py-5 text-[11px] font-semibold uppercase tracking-tight md:flex-row md:justify-end"
          style={{ borderColor: `${BG}33` }}
        >
          <span>© {new Date().getFullYear()} Vyshnav. All rights reserved.</span>
          <span className="opacity-60">Designed & built by ysh</span>
        </div>
      </footer>
    </>
  );
}

export default Footer;