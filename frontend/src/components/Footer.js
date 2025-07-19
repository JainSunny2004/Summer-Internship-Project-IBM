import React from 'react';
import MovieIcon from '@mui/icons-material/Movie';
import GitHubIcon from '@mui/icons-material/GitHub';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Footer = () => {
  return (
    <footer className="bg-netflix-black border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MovieIcon className="text-netflix-red text-2xl" />
              <span className="text-xl font-bold text-white">MovieFinder</span>
            </div>
            <p className="text-gray-400 mb-4">
              Discover amazing movies with our intelligent recommendation system. 
              Powered by The Movie Database (TMDB) API.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Made with</span>
              <FavoriteIcon className="text-netflix-red mx-1" />
              <span>using the MERN stack</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/search" className="hover:text-white transition-colors">
                  Search Movies
                </a>
              </li>
              <li>
                <a 
                  href="https://www.themoviedb.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  TMDB
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-white font-semibold mb-4">Built With</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>React.js</li>
              <li>Node.js & Express</li>
              <li>MongoDB</li>
              <li>TMDB API</li>
              <li>Tailwind CSS</li>
              <li>Material-UI Icons</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm mb-4 sm:mb-0">
            © 2024 MovieFinder. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="View on GitHub"
            >
              <GitHubIcon />
            </a>
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Powered by TMDB
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
