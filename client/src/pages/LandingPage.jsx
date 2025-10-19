import React from 'react';
import AuthSection from '../components/auth/AuthSection';
import { Swords, Shield, Crown } from 'lucide-react';
import heroBg from '/assets/hero-castle.jpg'; 

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Hero Section */}
      <div 
        className="relative flex-1 flex items-center justify-center p-8 lg:p-16 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(18, 24, 34, 0.85), rgba(26, 35, 51, 0.90)), url(${heroBg})`,
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-8 text-center lg:text-left animate-fade-in">
          {/* Logo/Icon Area */}
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-brand-gold/20 rounded-lg backdrop-blur-sm border border-brand-gold/30">
              <Crown className="w-10 h-10 text-brand-gold animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-cinzel font-bold tracking-tight text-brand-gold text-shadow-glow"
          >
            Crypto Kingdoms
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-brand-text font-medium">
            Build, Battle, Conquer.{" "}
            <span className="text-brand-gold font-bold">Fully On-Chain.</span>
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            <div className="flex items-start gap-3 p-4 bg-brand-form/40 backdrop-blur-sm rounded-lg border border-brand-border/30 hover:border-brand-gold/50 transition-smooth">
              <Swords className="w-6 h-6 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-brand-text mb-1">Epic Battles</h3>
                <p className="text-sm text-brand-text-secondary">
                  Command armies in massive strategic warfare
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-brand-form/40 backdrop-blur-sm rounded-lg border border-brand-border/30 hover:border-brand-gold/50 transition-smooth">
              <Shield className="w-6 h-6 text-brand-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-brand-text mb-1">True Ownership</h3>
                <p className="text-sm text-brand-text-secondary">
                  Your assets, secured on blockchain
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div 
            className="absolute top-10 right-10 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl animate-pulse" 
            style={{ animationDuration: '3s' }}
          />
          <div 
            className="absolute bottom-10 left-10 w-40 h-40 bg-brand-blue/5 rounded-full blur-3xl animate-pulse" 
            style={{ animationDuration: '4s', animationDelay: '1s' }} 
          />
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-brand-med">
        <AuthSection />
      </div>
    </div>
  );
};

export default LandingPage;