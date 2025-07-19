import React, { useEffect } from 'react';
import { useMovies } from '../context/MovieContext';
import Loading from './Loading';

const TestAPI = () => {
  const { 
    popularMovies, 
    genres, 
    loading, 
    error, 
    getPopularMovies, 
    getGenres 
  } = useMovies();

  useEffect(() => {
    getPopularMovies();
    getGenres();
  }, [getPopularMovies, getGenres]);

  if (loading) {
    return <Loading text="Testing API connection..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">API Test Failed</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">API Test Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">
            Popular Movies ({popularMovies.length})
          </h3>
          <div className="space-y-2">
            {popularMovies.slice(0, 5).map((movie) => (
              <div key={movie.id} className="p-2 bg-gray-800 rounded text-white">
                <p className="font-medium">{movie.title}</p>
                <p className="text-sm text-gray-400">Rating: {movie.rating}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">
            Genres ({genres.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 10).map((genre) => (
              <span 
                key={genre.id} 
                className="genre-badge"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAPI;
