import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { SimulatorPage } from './pages/SimulatorPage.jsx';
import { TheoryPage } from './pages/TheoryPage.jsx';
import { DemoPage } from './pages/DemoPage.jsx';
import { ChannelLabPage } from './pages/ChannelLabPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { SelfTestPage } from './pages/SelfTestPage.jsx';

export function App() {
  const [theme, setTheme] = useState('light');

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

  return (
    <div className="app-container">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
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
    </div>
  );
}
export default App;
