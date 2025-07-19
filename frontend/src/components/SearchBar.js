import React, { useState, useRef, useEffect } from 'react';
import { useMovies } from '../context/MovieContext';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import debounce from 'lodash/debounce';

const SearchBar = ({ 
  onFiltersToggle, 
  showFilters = false, 
  className = "",
  placeholder = "Search movies..."
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchMovies, 
    loading, 
    searchHistory 
  } = useMovies();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query) => {
      if (query.trim()) {
        searchMovies(query.trim());
      }
    }, 500)
  ).current;

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    setSearchQuery(value);
    
    if (value.trim()) {
      setShowSuggestions(true);
      debouncedSearch(value.trim());
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      searchMovies(localQuery.trim());
      setShowSuggestions(false);
      searchRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion.query);
    setSearchQuery(suggestion.query);
    searchMovies(suggestion.query);
    setShowSuggestions(false);
  };

  // Clear search
  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with global search query
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex">
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              ref={searchRef}
              type="text"
              placeholder={placeholder}
              value={localQuery}
              onChange={handleInputChange}
              onFocus={() => {
                if (searchHistory.length > 0 && !localQuery) {
                  setShowSuggestions(true);
                }
              }}
              className="search-input pl-12 pr-20 h-12 text-lg"
            />
            
            {/* Clear Button */}
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <ClearIcon />
              </button>
            )}

            {/* Loading Spinner */}
            {loading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="spinner w-5 h-5"></div>
              </div>
            )}
          </div>

          {/* Filter Toggle Button */}
          {onFiltersToggle && (
            <button
              type="button"
              onClick={onFiltersToggle}
              className={`ml-3 px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
                showFilters 
                  ? 'bg-netflix-red border-netflix-red text-white' 
                  : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              <FilterListIcon />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="search-suggestions"
          >
            {localQuery ? (
              <div className="search-suggestion-item">
                <div className="flex items-center">
                  <SearchIcon className="mr-3 text-gray-400" />
                  <span>Search for "{localQuery}"</span>
                </div>
              </div>
            ) : (
              <>
                {searchHistory.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-700">
                      Recent Searches
                    </div>
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="search-suggestion-item flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center">
                          <SearchIcon className="mr-3 text-gray-400" />
                          <span>{item.query}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </>
                )}
                {searchHistory.length === 0 && (
                  <div className="search-suggestion-item text-gray-500 text-center">
                    Start typing to search for movies...
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
