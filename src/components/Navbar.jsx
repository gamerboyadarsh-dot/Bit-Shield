import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, Shield } from 'lucide-react';

export function Navbar({
  activeTab = 'home',
  onTabChange,
  theme = 'dark',
  onThemeToggle
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'lab', label: 'Channel Lab' },
    { id: 'quiz', label: 'Practice Quiz' },
    { id: 'theory', label: 'Theory' },
    { id: 'demo', label: 'Demo' },
    { id: 'selftest', label: 'Self-Test' }
  ];

  const handleSelect = (id) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: '0.75rem',
        zIndex: 100,
        padding: '0 1rem',
        width: '100%',
        maxWidth: '1140px',
        margin: '0 auto'
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '0.45rem 0.85rem 0.45rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36), 0 1px 0 rgba(255,255,255,0.08) inset'
        }}
      >
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem 0',
            outline: 'none'
          }}
          aria-label="BitShield Home"
        >
          {/* Glowing Shield Logo SVG */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '34px',
              flexShrink: 0
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-4px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                filter: 'blur(6px)',
                borderRadius: '50%'
              }}
            />
            <svg
              width="28"
              height="32"
              viewBox="0 0 28 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="60%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <path
                d="M14 2L3 6V15C3 22.5 7.7 29.3 14 31C20.3 29.3 25 22.5 25 15V6L14 2Z"
                fill="var(--bg-surface)"
                stroke="url(#shieldGrad)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text
                x="14"
                y="19"
                textAnchor="middle"
                fill="var(--accent-cyan)"
                fontFamily="var(--font-mono)"
                fontWeight="800"
                fontSize="8.5"
                letterSpacing="-0.5px"
              >
                7,4
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 750,
                fontSize: '1.15rem',
                letterSpacing: '-0.025em',
                color: 'var(--text-main)'
              }}
            >
              Bit<span className="gradient-text-accent">Shield</span>
            </span>

            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 650,
                color: 'var(--text-subtle)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
                letterSpacing: '0.02em'
              }}
            >
              BAMAT205
            </span>
          </div>
        </button>

        {/* Desktop Nav Items with Framer Motion Sliding Pill */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            background: 'var(--bg-glass-input)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                style={{
                  position: 'relative',
                  padding: '0.45rem 0.95rem',
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#ffffff' : 'rgba(148, 163, 184, 0.9)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 650 : 500,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-full)',
                  transition: 'color 0.2s ease',
                  outline: 'none',
                  zIndex: 1
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Sliding indicator */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      boxShadow: '0 2px 16px -2px rgba(99, 102, 241, 0.7), 0 0 8px rgba(99, 102, 241, 0.4)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle & Mobile Menu Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <motion.button
            type="button"
            onClick={onThemeToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-glass-input)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={17} strokeWidth={2} style={{ color: '#fbbf24' }} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={17} strokeWidth={2} style={{ color: '#6366f1' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-glass-input)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-panel"
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              backdropFilter: 'blur(20px)'
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: activeTab === item.id ? 'var(--accent-light)' : 'transparent',
                  color: activeTab === item.id ? 'var(--accent)' : 'var(--text-main)',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

export default Navbar;
