
import React, { useState } from 'react';
import Button from '../ui/Button.tsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import { SERVICES } from '../../constants.ts';

// Define Page type locally or import if it's in a shared types file
type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

interface HeaderProps {
  onNavigate: (page: Page, serviceId?: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const handleNavClick = (page: Page, serviceId?: string | null) => {
    onNavigate(page, serviceId);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => handleNavClick('home')}
            aria-label="Go to homepage"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-orange-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-2xl">
              U
            </div>
            <span className="text-xl font-bold text-slate-200">U-Cloud 24</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('home')}
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium"
            >
              {t('home')}
            </button>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium flex items-center space-x-1"
              >
                <span>{t('services')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Services Menu */}
              <div className="absolute left-0 mt-0 w-56 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleNavClick('service', service.id)}
                    className="w-full px-4 py-2 text-left text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 transition-colors duration-200 text-sm font-medium flex items-center space-x-2"
                  >
                    <service.icon className="w-4 h-4" />
                    <span>{t(service.titleKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleNavClick('blog')}
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium"
            >
              {t('blog')}
            </button>

            <button
              onClick={() => handleNavClick('contacts')}
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium"
            >
              {t('contacts_title')}
            </button>
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <Button onClick={() => handleNavClick('contacts')}>
              {t('register_cta')}
            </Button>
          </div>

          {/* Mobile Right Side */}
          <div className="flex md:hidden items-center space-x-3">
            <LanguageSwitcher />
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                // Close icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2 px-4 py-4">
              <button
                onClick={() => handleNavClick('home')}
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium py-2 text-left"
              >
                {t('home')}
              </button>

              {/* Mobile Services Section */}
              <div>
                <button
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium py-2 text-left flex items-center justify-between w-full"
                >
                  <span>{t('services')}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      servicesDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {servicesDropdownOpen && (
                  <div className="bg-slate-700/30 rounded-lg mt-2 py-2 px-2 space-y-1">
                    {SERVICES.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleNavClick('service', service.id)}
                        className="w-full px-3 py-2 text-left text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 transition-colors duration-200 text-sm font-medium flex items-center space-x-2 rounded"
                      >
                        <service.icon className="w-4 h-4" />
                        <span>{t(service.titleKey)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('blog')}
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium py-2 text-left"
              >
                Blog
              </button>

              <button
                onClick={() => handleNavClick('contacts')}
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 text-sm font-medium py-2 text-left"
              >
                {t('contacts_title')}
              </button>

              <div className="pt-2 border-t border-slate-700/50">
                <Button
                  onClick={() => handleNavClick('contacts')}
                  className="w-full"
                >
                  {t('register_cta')}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
