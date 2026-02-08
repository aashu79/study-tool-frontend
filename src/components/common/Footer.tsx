import { Link } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin, FiHeart } from "react-icons/fi";
import { IoSchool } from "react-icons/io5";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", path: "/#features" },
      { label: "Pricing", path: "/pricing" },
      { label: "FAQ", path: "/faq" },
    ],
    company: [
      { label: "About", path: "/about" },
      { label: "Blog", path: "/blog" },
      { label: "Careers", path: "/careers" },
    ],
    legal: [
      { label: "Privacy", path: "/privacy" },
      { label: "Terms", path: "/terms" },
      { label: "Cookie Policy", path: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: "https://github.com", label: "GitHub" },
    { icon: FiTwitter, href: "https://twitter.com", label: "Twitter" },
    { icon: FiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 border-t border-teal-100/50">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-emerald-200/50 group-hover:shadow-xl group-hover:shadow-teal-300/50 transition-all duration-500 group-hover:rotate-6">
                <IoSchool className="text-2xl text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-orange-600 bg-clip-text text-transparent">
                  StudyAI
                </span>
                <span className="text-xs text-slate-500 -mt-1 tracking-wide">
                  Smart Learning
                </span>
              </div>
            </Link>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-sm">
              Empowering students with AI-driven learning tools. Transform your
              study sessions into engaging, efficient, and personalized
              experiences.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-11 h-11 bg-white rounded-xl border border-teal-100 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-200 transition-all duration-300 hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <social.icon className="text-lg relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-600 hover:text-teal-600 transition-all duration-300 hover:translate-x-1 inline-block font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full" />
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-600 hover:text-teal-600 transition-all duration-300 hover:translate-x-1 inline-block font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-600 hover:text-teal-600 transition-all duration-300 hover:translate-x-1 inline-block font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-teal-100/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 font-medium">
            © {currentYear} StudyAI. All rights reserved.
          </p>

          <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
            Made with
            <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg animate-pulse">
              <FiHeart className="text-white w-4 h-4 fill-white" />
            </span>
            for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
