import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import { MovieProvider } from './context/MovieContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <MovieProvider>
        <Router>
          <div className="App min-h-screen bg-netflix-black">
            <Header />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="*" element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                      <p className="text-gray-400 mb-8">Page not found</p>
                      <a href="/" className="btn-netflix">Go Home</a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </MovieProvider>
    </ErrorBoundary>
  );
}

export default App;
