
import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

// Define Page type locally or import if it's in a shared types file
type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: Page, id?: string | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <Header onNavigate={onNavigate} />
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
