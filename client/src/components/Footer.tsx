import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#10233F] text-white/80 border-t border-white/10 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        
        {/* Brand */}
        <p className="font-medium tracking-wide">
          © {new Date().getFullYear()} The Residence. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex gap-4">
          <Link to="/PrivacyPolicy" className="hover:text-white transition">
            Privacy Policy
          </Link>

          <Link to="/TermsOfService" className="hover:text-white transition">
            Terms
          </Link>

          <Link to="/Support" className="hover:text-white transition">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
