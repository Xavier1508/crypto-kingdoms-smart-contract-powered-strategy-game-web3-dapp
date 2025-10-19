import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import InGamePage from './pages/InGamePage';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); 

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Landing (Login/Register) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Halaman Dashboard (Setelah Login) */}
        <Route 
          path="/game" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* untuk Peta game */}
        <Route 
          path="/ingame" 
          element={
            <ProtectedRoute>
              <InGamePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Rute Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;