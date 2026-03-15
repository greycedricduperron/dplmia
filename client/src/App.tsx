import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ClassPage from './pages/ClassPage';
import ConnectionPage from './pages/ConnectionPage';
import GalleryPage from './pages/GalleryPage';
import AudioPage from './pages/AudioPage';
import HangmanPage from './pages/HangmanPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/class" element={<ClassPage />} />
            <Route path="/connections" element={<ConnectionPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/audio" element={<AudioPage />} />
            <Route path="/hangman" element={<HangmanPage />} />
            <Route path="/" element={<Navigate to="/feed" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
