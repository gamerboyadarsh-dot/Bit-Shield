import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Printer } from 'lucide-react';
import { Navbar } from './components/Navbar.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { SimulatorPage } from './pages/SimulatorPage.jsx';
import { TheoryPage } from './pages/TheoryPage.jsx';
import { DemoPage } from './pages/DemoPage.jsx';
import { ChannelLabPage } from './pages/ChannelLabPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { SelfTestPage } from './pages/SelfTestPage.jsx';

export function App() {
  const [theme, setTheme] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const qTheme = params.get('theme');
    if (qTheme === 'light' || qTheme === 'dark') return qTheme;
    return 'dark'; // Dark-first aesthetic by default
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs = ['home', 'simulator', 'lab', 'quiz', 'theory', 'demo', 'selftest'];
    return validTabs.includes(hash) ? hash : 'home';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    window.location.hash = newTab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Soft cursor follower on desktop
  const cursorRef = useRef(null);
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateCursor = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX - 160}px, ${currentY - 160}px, 0)`;
      }
      animId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Ambient Cyber Aurora, Grid & Noise Backdrop */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-grid" />
        <div className="ambient-vignette" />
        <div className="ambient-noise" />
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
        <div className="aurora-blob-4" />
      </div>

      {/* Desktop Cursor Glow */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 2,
          filter: 'blur(30px)',
          willChange: 'transform'
        }}
      />

      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && <HomePage onNavigate={handleTabChange} />}
            {activeTab === 'simulator' && <SimulatorPage />}
            {activeTab === 'lab' && <ChannelLabPage />}
            {activeTab === 'quiz' && <QuizPage />}
            {activeTab === 'theory' && <TheoryPage />}
            {activeTab === 'demo' && <DemoPage />}
            {activeTab === 'selftest' && <SelfTestPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Printable Report Pill */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.print()}
        className="floating-report-btn no-print"
        title="Print Academic Lab Report (Ctrl+P)"
        aria-label="Print Academic Lab Report"
      >
        <Printer size={16} strokeWidth={2.2} style={{ color: 'var(--accent-cyan)' }} />
        <span>Print Lab Report</span>
      </motion.button>
    </div>
  );
}

export default App;
