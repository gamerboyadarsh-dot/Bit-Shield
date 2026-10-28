import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

export function Navbar({
  activeTab = 'home',
  onTabChange,
  theme = 'light',
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
        top: 0,
        zIndex: 100,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color 0.15s ease, border-color 0.15s ease'
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="BitShield Home"
        >
          {/* SVG Shield Logo Mark with "7,4" */}
          <svg
            width="28"
            height="32"
            viewBox="0 0 28 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M14 2L3 6V15C3 22.5 7.7 29.3 14 31C20.3 29.3 25 22.5 25 15V6L14 2Z"
              fill="var(--accent-light)"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <text
              x="14"
              y="19"
              textAnchor="middle"
              fill="var(--accent)"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              fontSize="9"
              letterSpacing="-0.5px"
            >
              7,4
            </text>
          </svg>

          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '1.125rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-main)'
            }}
          >
            Bit<span style={{ color: 'var(--accent)' }}>Shield</span>
          </span>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-subtle)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--radius-sm)',
              marginLeft: '0.25rem'
            }}
          >
            BAMAT205
          </span>
        </button>

        {/* Desktop Nav Items */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            height: '100%'
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
                  padding: '0.5rem 0.75rem',
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color 0.15s ease',
                  outline: 'none'
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-12px',
                      left: '0.75rem',
                      right: '0.75rem',
                      height: '2px',
                      background: 'var(--accent)',
                      borderRadius: '1px'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action: Theme Toggle & Mobile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onThemeToggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {theme === 'dark' ? (
              <Sun size={18} strokeWidth={1.75} />
            ) : (
              <Moon size={18} strokeWidth={1.75} />
            )}
          </button>

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
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '1rem 1.5rem',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              style={{
                textAlign: 'left',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: activeTab === item.id ? 'var(--accent-light)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent)' : 'var(--text-main)',
                fontWeight: activeTab === item.id ? 600 : 500,
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 780px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
