import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SplashPage from './components/SplashPage';

// Error boundary for catching runtime errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#fff', background: '#1e293b' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <pre style={{ background: '#0f172a', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Root with splash screen */
const RootWithSplash: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <>
      {showSplash && <SplashPage onComplete={() => setShowSplash(false)} />}
      <div
        className={`flex flex-col h-screen w-screen ${!showSplash ? 'app-revealed' : ''}`}
        style={{
          opacity: showSplash ? 0 : 1,
          transition: 'opacity 0.8s ease-out',
        }}
      >
        <App />
      </div>
    </>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <RootWithSplash />
    </ErrorBoundary>
  </React.StrictMode>
);