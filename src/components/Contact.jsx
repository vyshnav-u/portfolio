import React, { useEffect, useRef, useState } from "react";

const BG = "#f8f5ef";
const ACCENT = "#140605";

// Edit these
const EMAIL = "vyshnavuvinay@gmail.com";
const links = [
  { label: "GitHub", href: "https://github.com/vyshnav-u" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vyshnavu-vinay-8b3118424/" },
  { label: "Instagram", href: "https://instagram.com/vysxhn_v" },
  { label: "Download CV", href: "/vyshnavu fullstack.pdf", download: true },
];

function Contact() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  // Reveal animations when the section scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Opens the visitor's email app with the message filled in
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio message from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n${form.name}\n${form.email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const reveal = (delay = 0) => ({
    transitionDelay: visible ? `${delay}ms` : "0ms",
  });
  const fade = visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0";

  const inputClass =
    "w-full border-b bg-transparent py-3 text-sm font-semibold outline-none transition-colors duration-300 placeholder:text-[#140605]/30 focus:border-[#140605]";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&display=swap');
        .contact-font { font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif; }
        .contact-title { font-weight: 700; letter-spacing: -0.055em; line-height: 0.85; }
        @keyframes dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        .dot { animation: dot 1.6s ease-in-out infinite; }
      `}</style>

      <section
        id="contact"
        ref={ref}
        className="contact-font px-4 pb-16 md:px-8 md:pb-24"
        style={{ backgroundColor: BG, color: ACCENT }}
      >
        {/* Top info bar */}
        <div
          className="flex items-center justify-between border-b py-4 text-[11px] font-semibold uppercase tracking-tight md:text-xs"
          style={{ borderColor: `${ACCENT}26` }}
        >
          <span>(06) Contact</span>
          <span className="flex items-center gap-2">
            <span className="dot inline-block h-1.5 w-1.5 rounded-full bg-[#140605]" />
            Available for work
          </span>
        </div>

        {/* Big headline: each line slides up from behind a mask */}
        <h2 className="contact-title py-10 text-[14vw] md:py-16 md:text-[10.5vw]">
          {["LET'S WORK", "TOGETHER."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <span
                className={`block transition-transform duration-1000 ease-out ${
                  visible ? "translate-y-0" : "translate-y-full"
                }`}
                style={reveal(i * 120)}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
          {/* LEFT: form */}
          <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-8 transition-all duration-1000 ease-out ${fade}`}
            style={reveal(300)}
          >
            {[
              { name: "name", label: "Your name", type: "text", ph: "John Doe" },
              { name: "email", label: "Your email", type: "email", ph: "john@email.com" },
            ].map((f) => (
              <label key={f.name} className="block">
                <span className="text-[11px] font-bold uppercase tracking-tight opacity-60">
                  {f.label}
                </span>
                <input
                  required
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.ph}
                  className={inputClass}
                  style={{ borderColor: `${ACCENT}40` }}
                />
              </label>
            ))}

            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-tight opacity-60">
                Message
              </span>
              <textarea
                required
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project..."
                className={`${inputClass} resize-none`}
                style={{ borderColor: `${ACCENT}40` }}
              />
            </label>

            <button
              type="submit"
              className="group flex items-center justify-between border px-5 py-4 text-sm font-bold uppercase tracking-tight transition-colors duration-300 hover:bg-[#140605] hover:text-[#f8f5ef]"
              style={{ borderColor: ACCENT }}
            >
              <span>{sent ? "Opening your email app..." : "Send message"}</span>
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </button>
          </form>

          {/* RIGHT: email + links */}
          <div
            className={`flex flex-col gap-12 transition-all duration-1000 ease-out ${fade}`}
            style={reveal(450)}
          >
            {/* Email with copy button */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-tight opacity-60">
                Or write to me directly
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="contact-title inline-block break-all text-[7vw] underline-offset-8 hover:underline md:text-[2.6vw]"
              >
                {EMAIL}
              </a>
              <button
                onClick={copyEmail}
                className="mt-4 block text-[11px] font-bold uppercase tracking-tight opacity-60 transition-opacity hover:opacity-100"
              >
                {copied ? "Copied ✓" : "Copy email"}
              </button>
            </div>

            {/* Links: rows invert on hover, same as the Work list */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-tight opacity-60">
                Find me online
              </p>
              <div className="border-t" style={{ borderColor: `${ACCENT}26` }}>
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    download={l.download ? true : undefined}
                    className="group flex items-center justify-between border-b px-2 py-4 text-sm font-semibold transition-colors duration-300 hover:bg-[#140605] hover:text-[#f8f5ef]"
                    style={{ borderColor: `${ACCENT}26` }}
                  >
                    <span>{l.label}</span>
                    <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      {l.download ? "↓" : "↗"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;