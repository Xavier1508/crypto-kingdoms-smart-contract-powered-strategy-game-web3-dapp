import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Nanti bisa tambah rute lain di sini, misal /leaderboard */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;