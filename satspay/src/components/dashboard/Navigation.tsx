import React from 'react';
import HapticFeedback from '../animations/HapticFeedback';

export type NavigationSection = 'home' | 'pay' | 'transactions' | 'x402';

interface NavigationProps {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const navigationItems: { key: NavigationSection; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'pay', label: 'Pay', icon: '💸' },
    { key: 'transactions', label: 'Transactions', icon: '📊' },
    { key: 'x402', label: 'x402', icon: '⚡' },
  ];

  return (
    <nav className="nav-professional sticky top-0 z-50">
      <div className="container-professional">
        <div className="flex justify-between items-center py-4">
          {/* Professional Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-financial rounded-xl flex items-center justify-center shadow-professional transform-gpu">
                <span className="text-white font-black text-lg">₿</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-secondary-900 text-crisp">
                  SatsPay
                </h1>
                <p className="text-xs text-secondary-500 font-medium">Professional Bitcoin Wallet</p>
              </div>
            </div>
          </div>

          {/* Professional Navigation Buttons - Desktop */}
          <div className="hidden sm:flex space-x-2 bg-secondary-100/80 backdrop-blur-sm rounded-xl p-1.5 shadow-professional">
            {navigationItems.map((item) => (
              <HapticFeedback
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                type="ripple"
              >
                <button
                  className={`
                    px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out
                    flex items-center space-x-2 text-crisp transform-gpu
                    ${
                      activeSection === item.key
                        ? 'bg-white text-primary-700 shadow-professional border border-primary-200 scale-105'
                        : 'text-secondary-600 hover:text-secondary-800 hover:bg-white/60 hover:scale-102'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </HapticFeedback>
            ))}
          </div>

          {/* Professional Navigation Buttons - Mobile */}
          <div className="flex sm:hidden space-x-1 bg-secondary-100/80 backdrop-blur-sm rounded-xl p-1 shadow-professional">
            {navigationItems.map((item) => (
              <HapticFeedback
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                type="scale"
              >
                <button
                  className={`
                    px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 ease-in-out
                    flex flex-col items-center space-y-1 text-crisp transform-gpu min-w-[60px]
                    ${
                      activeSection === item.key
                        ? 'bg-white text-primary-700 shadow-professional border border-primary-200'
                        : 'text-secondary-600 hover:text-secondary-800 hover:bg-white/60'
                    }
                  `}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="leading-none">{item.label}</span>
                </button>
              </HapticFeedback>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;