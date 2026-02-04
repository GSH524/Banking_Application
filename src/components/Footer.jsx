import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* TOP SECTION: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* BRAND COLUMN */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Vajra<span className="text-indigo-500">Bank</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              India's most trusted digital bank. Secure, seamless, and
              designed for the modern lifestyle. Empowering your financial future.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebookF />, href: "https://facebook.com" },
                { icon: <FaTwitter />, href: "https://twitter.com" },
                { icon: <FaInstagram />, href: "https://instagram.com" },
                { icon: <FaLinkedinIn />, href: "https://linkedin.com" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4">
              {["About Us", "Careers", "Press & Media", "Contact"].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().replace(/\s/g, '')}`} className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* PRODUCTS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Products</h4>
            <ul className="space-y-4">
              {["Savings Account", "Credit Cards", "Personal Loans", "Investments", "Insurance"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Get in Touch</h4>
            <div className="space-y-3">
              <p className="text-indigo-400 font-semibold text-sm">📞 1800-VAJRA-BANK</p>
              <p className="text-slate-500 text-xs italic">24/7 Priority Customer Support</p>
              <p className="text-slate-400 text-sm">✉ support@vajrabank.com</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                📍 VajraBank Tower, BKC, <br />
                Hyderabad, India 50001
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs text-center md:text-left">
            © {currentYear} VajraBank. Licensed by the Reserve Bank of India (RBI).
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((policy) => (
              <a key={policy} href="#" className="text-slate-500 hover:text-white text-xs transition-colors">
                {policy}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}