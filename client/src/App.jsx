import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import halaman-halaman Anda
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
const ProtectedRoute = ({ children }) => {
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
        {/* Rute Halaman Login/Registrasi (Halaman utama) */}
        <Route path="/" element={<AuthPage />} />
        <Route 
          path="/game" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;