
import React from 'react';
import Button from '../ui/Button.tsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

// Define Page type locally or import if it's in a shared types file
type Page = 'home' | 'service' | 'contacts';

interface HeaderProps {
  onNavigate: (page: Page, serviceId?: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => onNavigate('home')}
            aria-label="Go to homepage"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-orange-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-2xl">
              U
            </div>
            <span className="text-xl font-bold text-slate-200">U-Cloud 24</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="hidden sm:block">
              <Button onClick={() => onNavigate('contacts')}> {/* Changed to navigate to contacts */}
                {t('register_cta')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
