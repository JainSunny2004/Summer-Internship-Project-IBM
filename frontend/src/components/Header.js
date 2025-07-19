import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMovies } from "../context/MovieContext";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import MovieIcon from "@mui/icons-material/Movie";
import debounce from "lodash/debounce";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery, searchMovies, searchHistory, loading } =
    useMovies();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((query) => {
      if (query.trim()) {
        setSearchQuery(query);
        if (location.pathname !== "/search") {
          navigate("/search");
        }
      }
    }, 500)
  ).current;

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);

    if (value.trim()) {
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim());
      searchMovies(localQuery.trim());
      setShowSuggestions(false);
      if (location.pathname !== "/search") {
        navigate("/search");
      }
      searchRef.current?.blur();
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion.query);
    setSearchQuery(suggestion.query);
    searchMovies(suggestion.query);
    setShowSuggestions(false);
    if (location.pathname !== "/search") {
      navigate("/search");
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalQuery("");
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync local query with global search query
  useEffect(() => {
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-netflix-black bg-opacity-95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-netflix-red hover:text-red-400 transition-colors"
          >
            <MovieIcon className="text-3xl" />
            <span className="text-xl font-bold hidden sm:block">
              MovieFinder
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`hover:text-white transition-colors ${
                location.pathname === "/" ? "text-white" : "text-gray-400"
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`hover:text-white transition-colors ${
                location.pathname === "/search" ? "text-white" : "text-gray-400"
              }`}
            >
              Search
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search movies..."
                  value={localQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchHistory.length > 0 && !localQuery) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => setIsSearchFocused(false)}
                  className="search-input pl-10 pr-10"
                />
                {localQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <ClearIcon />
                  </button>
                )}
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="spinner w-4 h-4"></div>
                  </div>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && (
                <div ref={suggestionsRef} className="search-suggestions">
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
                              className="search-suggestion-item flex items-center justify-between"
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
                          No recent searches
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
