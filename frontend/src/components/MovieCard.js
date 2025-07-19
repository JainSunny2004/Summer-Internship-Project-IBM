import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ImageIcon from '@mui/icons-material/Image';

const MovieCard = ({ movie, showDetails = true, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format rating to stars (out of 5)
  const renderStars = (rating) => {
    const stars = Math.round((rating / 10) * 5);
    return (
      <div className="rating-stars">
        {Array.from({ length: 5 }).map((_, index) => (
          index < stars ? (
            <StarIcon key={index} className="rating-star text-yellow-400" />
          ) : (
            <StarBorderIcon key={index} className="rating-star empty" />
          )
        ))}
        <span className="ml-1 text-sm text-gray-400">
          {rating ? rating.toFixed(1) : 'N/A'}
        </span>
      </div>
    );
  };

  // Format release year
  const getReleaseYear = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className={`movie-card group ${className}`}>
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
          {/* Movie Poster */}
          {!imageError && movie.posterPath ? (
            <img
              src={movie.posterPath}
              alt={movie.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                !imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <ImageIcon className="text-gray-500 text-4xl" />
            </div>
          )}

          {/* Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="spinner w-6 h-6"></div>
            </div>
          )}

          {/* Overlay with basic info */}
          {showDetails && (
            <div className="movie-overlay">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                {movie.title}
              </h3>
              {movie.rating && (
                <div className="flex items-center mb-1">
                  {renderStars(movie.rating)}
                </div>
              )}
              {movie.releaseDate && (
                <div className="flex items-center text-xs text-gray-300">
                  <CalendarTodayIcon className="w-3 h-3 mr-1" />
                  {getReleaseYear(movie.releaseDate)}
                </div>
              )}
            </div>
          )}

          {/* Rating badge */}
          {movie.rating && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">
              {movie.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Details below image (for grid layouts) */}
        {showDetails && (
          <div className="mt-3 space-y-1">
            <h3 className="font-semibold text-white text-sm line-clamp-2">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{getReleaseYear(movie.releaseDate)}</span>
              {movie.rating && (
                <span className="flex items-center">
                  <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};

// Compact version for carousels
export const CompactMovieCard = ({ movie, className = "" }) => {
  return <MovieCard movie={movie} showDetails={false} className={className} />;
};

// Large version for featured content
export const FeaturedMovieCard = ({ movie, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Link to={`/movie/${movie.id}`} className="block group">
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Backdrop Image */}
          {!imageError && movie.backdropPath ? (
            <img
              src={movie.backdropPath}
              alt={movie.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                !imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <ImageIcon className="text-gray-500 text-6xl" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {movie.title}
            </h2>
            {movie.overview && (
              <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-4 max-w-2xl">
                {movie.overview}
              </p>
            )}
            <div className="flex items-center space-x-4">
              {movie.rating && (
                <div className="flex items-center">
                  <StarIcon className="text-yellow-400 mr-1" />
                  <span className="text-white font-semibold">
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {movie.releaseDate && (
                <span className="text-gray-300">
                  {new Date(movie.releaseDate).getFullYear()}
                </span>
              )}
            </div>
          </div>

          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="spinner w-8 h-8"></div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
