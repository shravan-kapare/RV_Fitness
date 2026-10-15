import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Menu, X, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Memberships', path: '/memberships' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Trainers', path: '/trainers' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Offers', path: '/offers' },
    { name: 'Contact', path: '/contact' },
  ];

  const getPortalLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/dashboard';
    if (user.role === 'TRAINER') return '/trainer';
    return '/member';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-md bg-[#FFC21A] flex items-center justify-center text-black font-black shadow-md shadow-[#FFC21A]/20 transition-transform group-hover:scale-105">
              <Dumbbell className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black tracking-wide text-[#F5F5F5] uppercase">
                RV <span className="text-[#FFC21A]">FITNESS</span>
              </span>
              <span className="block text-[9px] tracking-widest text-[#888888] uppercase font-mono leading-none">
                NARSOBAWADI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[13px] font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-[#FFC21A] font-semibold'
                      : 'text-[#9CA3AF] hover:text-[#F5F5F5]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={getPortalLink()}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#292929] text-[#F5F5F5] text-xs font-semibold transition"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#FFC21A]" />
                <span>Portal ({user?.role})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#A5A5A5] hover:text-[#F5F5F5] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/memberships"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#FFC21A] hover:bg-[#e5ad16] text-black text-xs font-extrabold shadow-sm shadow-[#FFC21A]/20 transition transform hover:-translate-y-0.5"
                >
                  <span>Join Today</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#171717]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111111] border-b border-[#292929] px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-[#171717] text-[#FFC21A]'
                  : 'text-[#A5A5A5] hover:bg-[#171717] hover:text-[#F5F5F5]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#292929] space-y-2">
            {isAuthenticated ? (
              <Link
                to={getPortalLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-[#171717] border border-[#292929] text-[#F5F5F5] font-semibold"
              >
                <UserIcon className="w-4 h-4 text-[#FFC21A]" />
                <span>Go to Portal ({user?.role})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 text-sm font-semibold text-[#A5A5A5] hover:text-[#F5F5F5]"
                >
                  Member Sign In
                </Link>
                <Link
                  to="/memberships"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#FFC21A] text-black font-bold"
                >
                  <span>Join Today</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
