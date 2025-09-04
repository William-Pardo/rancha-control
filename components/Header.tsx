import React, { useMemo } from 'react';
import { TABS } from '../constants';
import { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onManageApiKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, currentUser, onLogout, theme, toggleTheme, onManageApiKey }) => {

  const navigationTabs = useMemo(() => {
    const render = (isMobile: boolean = false) => {
      return TABS.map((tab) => {
        const isActive = activeTab === tab;
        const baseClasses = 'px-3 py-2 rounded-md font-medium transition-colors';
        const layoutClasses = isMobile
          ? 'block text-base flex-1 text-center'
          : 'text-sm';
        const stateClasses = isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground';
        
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${baseClasses} ${layoutClasses} ${stateClasses}`}
          >
            {tab}
          </button>
        );
      });
    };
    return {
      desktop: render(false),
      mobile: render(true),
    };
  }, [activeTab, setActiveTab]);
  
  // ...existing code...
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-card shadow-sm">
      <nav className="flex gap-2">
        {navigationTabs.desktop}
      </nav>
      <div className="flex items-center gap-2">
        <span className="font-medium text-muted-foreground mr-2">{currentUser.name}</span>
        <button onClick={onLogout} className="px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors text-xs">Salir</button>
        <button onClick={toggleTheme} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors" aria-label="Cambiar tema">
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 19.778l-.707-.707M21 12h-1M4 12H3m16.485-4.485l-.707-.707M4.222 4.222l-.707.707" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
        <button onClick={onManageApiKey} className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors" aria-label="Gestionar clave de API">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;