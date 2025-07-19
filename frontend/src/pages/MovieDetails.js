import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';
import MovieCarousel from '../components/MovieCarousel';
import { MovieDetailsSkeleton } from '../components/Loading';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const MovieDetails = () => {
  const { id } = useParams();
  const { 
    currentMovie, 
    recommendations, 
    loading, 
    error,
    getMovieDetails, 
    getRecommendations 
  } = useMovies();

  const [imageLoaded, setImageLoaded] = useState(false);

  // Load movie details and recommendations
  useEffect(() => {
    if (id) {
      getMovieDetails(parseInt(id));
      getRecommendations(parseInt(id));
    }
  }, [id, getMovieDetails, getRecommendations]);

  // Reset image loaded state when movie changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentMovie]);

  if (loading && !currentMovie) {
    return <MovieDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/" className="btn-netflix">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <Link to="/" className="btn-netflix">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src={currentMovie.backdropPath || currentMovie.posterPath}
            alt={currentMovie.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex items-end h-full">
          <div className="container mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="lg:col-span-1">
                <div className="w-64 mx-auto lg:mx-0">
                  <img
                    src={currentMovie.posterPath}
                    alt={currentMovie.title}
                    className="w-full rounded-lg shadow-2xl"
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2 text-center lg:text-left">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {currentMovie.title}
                </h1>

                {currentMovie.tagline && (
                  <p className="text-lg text-gray-300 italic mb-4">
                    "{currentMovie.tagline}"
                  </p>
                )}

                {currentMovie.overview && (
                  <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                    {currentMovie.overview}
                  </p>
                )}

                {/* Movie Stats */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-8">
                  {currentMovie.rating && (
                    <div className="flex items-center space-x-1">
                      <StarIcon className="text-yellow-400" />
                      <span className="text-white font-semibold text-lg">
                        {currentMovie.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400">
                        ({currentMovie.voteCount?.toLocaleString()} votes)
                      </span>
                    </div>
                  )}

                  {currentMovie.releaseDate && (
                    <div className="flex items-center space-x-1">
                      <CalendarTodayIcon className="text-gray-400" />
                      <span className="text-gray-300">
                        {new Date(currentMovie.releaseDate).getFullYear()}
                      </span>
                    </div>
                  )}

                  {currentMovie.runtime && (
                    <div className="flex items-center space-x-1">
                      <AccessTimeIcon className="text-gray-400" />
                      <span className="text-gray-300">
                        {formatRuntime(currentMovie.runtime)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {currentMovie.genres && currentMovie.genres.length > 0 && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                    {currentMovie.genres.map((genre) => (
                      <span key={genre.id} className="genre-badge">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    <PlayArrowIcon />
                    <span>Watch Trailer</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 btn-secondary px-6 py-3">
                    <FavoriteIcon />
                    <span>Add to Favorites</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-2 btn-secondary px-6 py-3">
                    <ShareIcon />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="relative z-20 bg-netflix-black py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2">
              {/* Cast */}
              {currentMovie.credits?.cast && currentMovie.credits.cast.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Cast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {currentMovie.credits.cast.slice(0, 8).map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="aspect-square rounded-full overflow-hidden bg-gray-800 mb-2">
                          {person.profilePath ? (
                            <img
                              src={person.profilePath}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <span className="text-2xl">👤</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-semibold text-sm">
                          {person.name}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {person.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos/Trailers */}
              {currentMovie.videos && currentMovie.videos.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Videos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMovie.videos.slice(0, 2).map((video) => (
                      <div key={video.id} className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.key}`}
                          title={video.name}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Movie Info</h3>
                
                {currentMovie.credits?.director && (
                  <div>
                    <span className="text-gray-400">Director:</span>
                    <span className="text-white ml-2">{currentMovie.credits.director}</span>
                  </div>
                )}

                {currentMovie.originalLanguage && (
                  <div className="flex items-center">
                    <LanguageIcon className="text-gray-400 mr-2" />
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white ml-2">
                      {currentMovie.originalLanguage.toUpperCase()}
                    </span>
                  </div>
                )}

                {currentMovie.budget > 0 && (
                  <div className="flex items-center">
                    <AttachMoneyIcon className="text-gray-400 mr-2" />
                    <span className="text-gray-400">Budget:</span>
                    <span className="text-white ml-2">
                      {formatCurrency(currentMovie.budget)}
                    </span>
                  </div>
                )}

                {currentMovie.revenue > 0 && (
                  <div className="flex items-center">
                    <AttachMoneyIcon className="text-gray-400 mr-2" />
                    <span className="text-gray-400">Revenue:</span>
                    <span className="text-white ml-2">
                      {formatCurrency(currentMovie.revenue)}
                    </span>
                  </div>
                )}

                {currentMovie.status && (
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white ml-2">{currentMovie.status}</span>
                  </div>
                )}

                {currentMovie.homepage && (
                  <div>
                    <a
                      href={currentMovie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-netflix-red hover:text-red-400 underline"
                    >
                      Official Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <MovieCarousel
              movies={recommendations}
              title="You might also like"
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetails;
