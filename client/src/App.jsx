import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';

const ProtectedRoute = ({ children }) => {
  // Ganti dengan logika cek login Anda
  const isAuthenticated = false; 

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page dengan Auth */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Game Page (Protected) */}
        <Route 
          path="/game" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/test" element={<TestPage />} />
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;