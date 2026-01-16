import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function Root() {
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('entered_app');
    if (hasVisited === 'true') {
      setShowApp(true);
    }
  }, []);

  const handleEnterApp = () => {
    sessionStorage.setItem('entered_app', 'true');
    setShowApp(true);
  };

  if (showApp) {
    return <App />;
  }

  return <LandingPage onEnterApp={handleEnterApp} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);
