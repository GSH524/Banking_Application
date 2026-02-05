import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-12 md:pt-16 pb-24 md:pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- DESKTOP ONLY SECTION --- */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* BRAND COLUMN */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Vajra<span className="text-indigo-500">Bank</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              India's most trusted digital bank. Secure, seamless, and
              designed for the modern lifestyle.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: <FaFacebookF size={14}/>, href: "#" },
                { icon: <FaTwitter size={14}/>, href: "#" },
                { icon: <FaInstagram size={14}/>, href: "#" },
                { icon: <FaLinkedinIn size={14}/>, href: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">Company</h4>
            <ul className="space-y-3">
              {["About Us", "Careers", "Press", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* PRODUCTS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">Products</h4>
            <ul className="space-y-3">
              {["Savings", "Cards", "Loans", "Investments"].map((item) => (
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
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">Support</h4>
            <div className="space-y-3 text-sm">
              <p className="text-indigo-400 font-bold">1800-VAJRA-BANK</p>
              <p className="text-slate-400">support@vajrabank.com</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                VajraBank Tower, BKC, <br />
                Hyderabad, India 50001
              </p>
            </div>
          </div>
        </div>

        {/* --- MOBILE & DESKTOP BOTTOM BAR --- */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center">
          
          {/* Mobile Logo (Shown only on small screens) */}
          <div className="md:hidden mb-4">
             <h2 className="text-xl font-black text-white tracking-tight uppercase">
              Vajra<span className="text-indigo-500">Bank</span>
            </h2>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.1em] font-medium">
              © {currentYear} VajraBank. Licensed by the RBI.
            </p>
            
            {/* Minimal Links for Desktop, hidden or very small on mobile */}
            <div className="flex flex-wrap justify-center gap-6">
              {["Privacy", "Terms", "Cookies"].map((policy) => (
                <a key={policy} href="#" className="text-slate-600 hover:text-indigo-400 text-[10px] uppercase font-bold transition-colors">
                  {policy}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}