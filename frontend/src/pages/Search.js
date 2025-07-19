import React, { useState, useEffect } from 'react';
import { useMovies } from '../context/MovieContext';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { SearchSkeleton } from '../components/Loading';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

// Filter Component
const FilterPanel = ({ isOpen, onClose, genres = [] }) => {
  const { currentFilters, updateFilter, clearFilters } = useMovies();
  
  const [localFilters, setLocalFilters] = useState(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    updateFilter(key, value);
  };

  const handleGenreToggle = (genreId) => {
    const currentGenres = localFilters.genres || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter(id => id !== genreId)
      : [...currentGenres, genreId];
    
    handleFilterChange('genres', newGenres);
  };

  const handleClearAll = () => {
    clearFilters();
    setLocalFilters({
      genres: [],
      year: '',
      minRating: '',
      maxRating: '',
      sortBy: 'popularity.desc'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-netflix-gray p-6 overflow-y-auto lg:relative lg:w-full lg:h-auto lg:bg-gray-900 lg:rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={localFilters.sortBy || 'popularity.desc'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select w-full"
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="popularity.asc">Least Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="vote_average.asc">Lowest Rated</option>
            <option value="release_date.desc">Newest</option>
            <option value="release_date.asc">Oldest</option>
            <option value="title.asc">A-Z</option>
            <option value="title.desc">Z-A</option>
          </select>
        </div>

        {/* Release Year */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Release Year
          </label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={localFilters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="filter-select w-full"
            placeholder="Any year"
          />
        </div>

        {/* Rating Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={localFilters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="filter-select w-full"
                placeholder="Min"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={localFilters.maxRating || ''}
                onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                className="filter-select w-full"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Genres
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {genres.map((genre) => (
              <label
                key={genre.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={(localFilters.genres || []).includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                  className="checkbox-netflix"
                />
                <span className="text-gray-300">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={handleClearAll}
          className="w-full btn-secondary"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

const Search = () => {
  const { 
    searchQuery, 
    searchResults, 
    movies,
    genres,
    loading, 
    error, 
    hasMore,
    totalResults,
    searchMovies, 
    getGenres,
    discoverMovies,
    loadMoreMovies,
    isSearching
  } = useMovies();

  const [showFilters, setShowFilters] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load genres on mount
  useEffect(() => {
    getGenres();
  }, [getGenres]);

  // Initialize with popular movies if no search query
  useEffect(() => {
    if (!hasInitialized && !searchQuery) {
      discoverMovies();
      setHasInitialized(true);
    }
  }, [hasInitialized, searchQuery, discoverMovies]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
        && hasMore && !loading
      ) {
        loadMoreMovies();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMoreMovies]);

  const displayMovies = isSearching ? searchResults : movies;
  const showResults = displayMovies.length > 0;

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container mx-auto px-4 pt-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {isSearching ? 'Search Results' : 'Discover Movies'}
          </h1>
          
          <SearchBar
            onFiltersToggle={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            className="mb-6"
          />

          {/* Results Summary */}
          {showResults && (
            <div className="flex items-center justify-between text-gray-400 mb-4">
              <span>
                {isSearching 
                  ? `Found ${totalResults} results for "${searchQuery}"`
                  : `Showing ${totalResults} movies`
                }
              </span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-1 text-gray-400 hover:text-white"
              >
                <FilterListIcon />
                <span>Filters</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="hidden lg:block">
              <FilterPanel
                isOpen={true}
                onClose={() => {}}
                genres={genres}
              />
            </div>
            
            {/* Mobile Filter Modal */}
            <FilterPanel
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              genres={genres}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading && displayMovies.length === 0 ? (
              <SearchSkeleton />
            ) : error ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Something went wrong
                </h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-netflix"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <MovieGrid
                movies={displayMovies}
                loading={loading && displayMovies.length > 0}
                emptyMessage={
                  isSearching 
                    ? `No movies found for "${searchQuery}"`
                    : "No movies found with current filters"
                }
                showTitle={false}
                skeletonCount={8}
              />
            )}

            {/* Load More Button */}
            {hasMore && showResults && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreMovies}
                  className="btn-secondary px-8 py-3"
                >
                  Load More Movies
                </button>
              </div>
            )}

            {/* Loading More Indicator */}
            {loading && showResults && (
              <div className="text-center mt-8">
                <div className="spinner w-8 h-8 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading more movies...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
