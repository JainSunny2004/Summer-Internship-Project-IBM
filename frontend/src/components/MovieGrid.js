import React from 'react';
import MovieCard from './MovieCard';
import { MovieGridSkeleton } from './Loading';

const MovieGrid = ({ 
  movies = [], 
  loading = false, 
  title, 
  showTitle = true,
  className = "",
  cardClassName = "",
  emptyMessage = "No movies found",
  skeletonCount = 20
}) => {
  if (loading && movies.length === 0) {
    return (
      <div className={className}>
        {showTitle && title && (
          <h2 className="section-title">{title}</h2>
        )}
        <MovieGridSkeleton count={skeletonCount} />
      </div>
    );
  }

  if (!loading && movies.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        {showTitle && title && (
          <h2 className="section-title">{title}</h2>
        )}
        <div className="text-gray-400 text-lg">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && title && (
        <h2 className="section-title">{title}</h2>
      )}
      
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            className={cardClassName}
          />
        ))}
        
        {/* Show skeleton cards while loading more */}
        {loading && movies.length > 0 && (
          <MovieGridSkeleton count={4} />
        )}
      </div>
    </div>
  );
};

export default MovieGrid;
