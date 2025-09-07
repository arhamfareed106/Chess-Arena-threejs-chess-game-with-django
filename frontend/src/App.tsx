import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for better performance
const LobbyPage = React.lazy(() => import('@/pages/LobbyPage'));
const CreateGamePage = React.lazy(() => import('@/pages/CreateGamePage'));
const JoinGamePage = React.lazy(() => import('@/pages/JoinGamePage'));
const GamePage = React.lazy(() => import('@/pages/GamePage'));
const ReplayPage = React.lazy(() => import('@/pages/ReplayPage'));

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="loading-spinner mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-white">Loading TI Chess...</h2>
      <p className="text-white/80 mt-2">Preparing your strategic experience</p>
    </div>
  </div>
);

// Error boundary component
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
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
          <div className="text-center text-white p-8 max-w-md">
            <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-lg mb-6 opacity-90">
              We encountered an unexpected error. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left bg-black/20 p-4 rounded">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="text-sm mt-2 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8fa4f3',
      dark: '#4c63d2',
    },
    secondary: {
      main: '#764ba2',
      light: '#9575cd',
      dark: '#5e35b1',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: 600,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Main lobby/home page */}
              <Route path="/" element={<LobbyPage />} />
              
              {/* Game management routes */}
              <Route path="/create" element={<CreateGamePage />} />
              <Route path="/join/:gameId?" element={<JoinGamePage />} />
              
              {/* Game play routes */}
              <Route path="/play/:gameId" element={<GamePage />} />
              <Route path="/replay/:gameId" element={<ReplayPage />} />
              
              {/* Catch-all route for 404s */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center text-white">
                      <h1 className="text-4xl font-bold mb-4">404</h1>
                      <p className="text-xl mb-6">Page not found</p>
                      <a 
                        href="/" 
                        className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                      >
                        Return to Lobby
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </Suspense>
        </Router>

        {/* Global toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#4ecdc4',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff6b6b',
                secondary: '#fff',
              },
            },
          }}
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;