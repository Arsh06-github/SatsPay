import React, { useState } from 'react';
import Navigation, { NavigationSection } from './Navigation';
import Home from './sections/Home';
import Pay from './sections/Pay';
import Transactions from './sections/Transactions';
import X402 from './sections/X402';
import PageTransition from '../animations/PageTransition';
import FloatingBitcoin from '../animations/FloatingBitcoin';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavigationSection>('home');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home />;
      case 'pay':
        return <Pay />;
      case 'transactions':
        return <Transactions />;
      case 'x402':
        return <X402 />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen gradient-professional relative overflow-hidden">
      {/* Professional background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-bitcoin-50/20 pointer-events-none" />
      
      {/* Floating Bitcoin decorations with professional opacity */}
      <FloatingBitcoin 
        size="sm" 
        className="absolute top-20 left-10 opacity-10" 
        delay={0} 
      />
      <FloatingBitcoin 
        size="md" 
        className="absolute top-40 right-20 opacity-8" 
        delay={1} 
      />
      <FloatingBitcoin 
        size="sm" 
        className="absolute bottom-32 left-1/4 opacity-6" 
        delay={2} 
      />
      
      {/* Professional grid pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <main className="container-professional section-professional relative z-10">
        <div className="animate-professional-fade">
          <PageTransition key={activeSection} type="slide-up" duration="normal">
            {renderActiveSection()}
          </PageTransition>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;