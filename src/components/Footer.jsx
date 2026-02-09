import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  Headset
} from "react-bootstrap-icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();

  // Scroll to top automatically on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const socialLinks = [
    { icon: <Facebook size={16} />, href: "https://facebook.com" },
    { icon: <Twitter size={16} />, href: "https://twitter.com" },
    { icon: <Instagram size={16} />, href: "https://instagram.com" },
    { icon: <Linkedin size={16} />, href: "https://linkedin.com" },
  ];

  const menuGroups = [
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Press", path: "/press" },
        { name: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Products",
      links: [
        { name: "Savings", path: "/savings" },
        { name: "Cards", path: "/cards" },
        { name: "Loans", path: "/loans" },
        { name: "Investments", path: "/invest" },
      ],
    },
  ];

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* BRAND COLUMN */}
          <div className="space-y-6 text-center md:text-left">
            <Link to="/" className="inline-flex flex-col items-center md:items-start group">
              {/* LOGO IMAGE STYLE */}
              <img
                src="logo.png"
                alt="VajraBank Logo"
                className="h-10 w-auto mb-3 object-contain brightness-110 group-hover:scale-105 transition-transform duration-300"
              />
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                SRK<span className="text-indigo-500">Bank</span>
              </h2>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              India's most trusted digital bank. Secure, seamless, and
              designed for the modern lifestyle.
            </p>
            <div className="flex justify-center md:justify-start space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:-translate-y-1 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* DYNAMIC LINK COLUMNS */}
          {menuGroups.map((group) => (
            <div key={group.title} className="text-center md:text-left">
              <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-indigo-400 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CONTACT & SUPPORT */}
          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">
              Support
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Headset className="text-indigo-500" />
                <span className="text-white font-bold text-sm">1800-SRK-SERVICES</span>
              </div>
              <div className="text-sm space-y-2">
                <p className="text-slate-400">support@srkbank.com</p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  SRK Tower, BKC, <br />
                  Hyderabad, India 50001
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 text-emerald-500/80">
            <ShieldCheck size={14} />
            <span className="text-[10px] uppercase font-black tracking-widest">RBI Regulated Entity</span>
          </div>

          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.1em] font-medium text-center">
              © {currentYear} VajraBank. All Rights Reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((policy) => (
                <Link
                  key={policy}
                  to={`/${policy.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-slate-600 hover:text-indigo-400 text-[10px] uppercase font-bold transition-colors"
                >
                  {policy}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}