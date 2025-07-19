import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Main loading component
export const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <span className="text-gray-400">{text}</span>}
    </div>
  );
};

// Movie card skeleton
export const MovieCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="movie-card">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse">
            <Skeleton 
              height="100%" 
              baseColor="#374151" 
              highlightColor="#4B5563" 
            />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton 
              height={16} 
              baseColor="#374151" 
              highlightColor="#4B5563" 
            />
            <Skeleton 
              height={14} 
              width="60%" 
              baseColor="#374151" 
              highlightColor="#4B5563" 
            />
          </div>
        </div>
      ))}
    </>
  );
};

// Movie grid skeleton
export const MovieGridSkeleton = ({ count = 20 }) => {
  return (
    <div className="movie-grid">
      <MovieCardSkeleton count={count} />
    </div>
  );
};

// Movie details skeleton
export const MovieDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero section skeleton */}
      <div className="relative h-96 bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <Skeleton 
            height={40} 
            width="40%" 
            baseColor="#374151" 
            highlightColor="#4B5563" 
            className="mb-4"
          />
          <Skeleton 
            height={20} 
            count={3} 
            baseColor="#374151" 
            highlightColor="#4B5563" 
            className="mb-2"
          />
          <div className="flex space-x-4 mt-4">
            <Skeleton 
              height={44} 
              width={120} 
              baseColor="#374151" 
              highlightColor="#4B5563" 
            />
            <Skeleton 
              height={44} 
              width={100} 
              baseColor="#374151" 
              highlightColor="#4B5563" 
            />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Skeleton 
                height={24} 
                width="30%" 
                baseColor="#374151" 
                highlightColor="#4B5563" 
                className="mb-4"
              />
              <Skeleton 
                height={16} 
                count={4} 
                baseColor="#374151" 
                highlightColor="#4B5563" 
                className="mb-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton 
              height={20} 
              width="50%" 
              baseColor="#374151" 
              highlightColor="#4B5563" 
            />
            <Skeleton 
              height={16} 
              count={6} 
              baseColor="#374151" 
              highlightColor="#4B5563" 
              className="mb-1"
            />
          </div>
        </div>

        {/* Recommendations skeleton */}
        <div className="mt-12">
          <Skeleton 
            height={32} 
            width="25%" 
            baseColor="#374151" 
            highlightColor="#4B5563" 
            className="mb-6"
          />
          <MovieGridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
};

// Search results skeleton
export const SearchSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton 
          height={24} 
          width="30%" 
          baseColor="#374151" 
          highlightColor="#4B5563" 
        />
        <Skeleton 
          height={16} 
          width="15%" 
          baseColor="#374151" 
          highlightColor="#4B5563" 
        />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton 
            key={index}
            height={40} 
            width={120} 
            baseColor="#374151" 
            highlightColor="#4B5563" 
          />
        ))}
      </div>

      {/* Results skeleton */}
      <MovieGridSkeleton count={20} />
    </div>
  );
};

// Full page loading
export const FullPageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center">
      <div className="text-center">
        <div className="spinner w-12 h-12 mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
};

// Inline loading for buttons
export const ButtonLoading = ({ size = 'small' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5'
  };

  return <div className={`spinner ${sizeClasses[size]}`}></div>;
};

export default Loading;
