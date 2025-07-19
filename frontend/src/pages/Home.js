import React, { useEffect } from 'react';
import { useMovies } from '../context/MovieContext';
import MovieCarousel from '../components/MovieCarousel';
import { FeaturedMovieCard } from '../components/MovieCard';
import { FullPageLoading } from '../components/Loading';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import { Link } from 'react-router-dom';

const Home = () => {
  const { 
    popularMovies, 
    genres, 
    loading, 
    error,
    getPopularMovies, 
    getGenres,
    discoverMovies 
  } = useMovies();

  const [genreMovies, setGenreMovies] = React.useState({});
  const [featuredMovie, setFeaturedMovie] = React.useState(null);

  // Load initial data
  useEffect(() => {
    getPopularMovies();
    getGenres();
  }, [getPopularMovies, getGenres]);

  // Set featured movie from popular movies
  useEffect(() => {
    if (popularMovies.length > 0 && !featuredMovie) {
      setFeaturedMovie(popularMovies[0]);
    }
  }, [popularMovies, featuredMovie]);

  // Load movies by genre
  useEffect(() => {
    const loadGenreMovies = async () => {
      if (genres.length > 0) {
        const genrePromises = genres.slice(0, 5).map(async (genre) => {
          try {
            const result = await discoverMovies({ genres: [genre.id] });
            return { [genre.name]: result };
          } catch (error) {
            console.error(`Error loading ${genre.name} movies:`, error);
            return { [genre.name]: [] };
          }
        });

        const results = await Promise.all(genrePromises);
        const genreMoviesData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setGenreMovies(genreMoviesData);
      }
    };

    loadGenreMovies();
  }, [genres, discoverMovies]);

  if (loading && popularMovies.length === 0) {
    return <FullPageLoading message="Loading amazing movies..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-netflix"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section with Featured Movie */}
      {featuredMovie && (
        <section className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdropPath || featuredMovie.posterPath}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex items-center h-full">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {featuredMovie.title}
                </h1>
                
                {featuredMovie.overview && (
                  <p className="text-lg md:text-xl text-gray-300 mb-8 line-clamp-4">
                    {featuredMovie.overview}
                  </p>
                )}

                <div className="flex items-center space-x-4 mb-8">
                  {featuredMovie.rating && (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-lg font-semibold">
                        ★ {featuredMovie.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {featuredMovie.releaseDate && (
                    <span className="text-gray-300">
                      {new Date(featuredMovie.releaseDate).getFullYear()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    to={`/movie/${featuredMovie.id}`}
                    className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <PlayArrowIcon />
                    <span>Watch Now</span>
                  </Link>
                  
                  <Link
                    to={`/movie/${featuredMovie.id}`}
                    className="flex items-center justify-center space-x-2 bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    <InfoIcon />
                    <span>More Info</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Movie Sections */}
      <div className="relative z-20 -mt-32 pb-16">
        <div className="container mx-auto px-4 space-y-12">
          {/* Popular Movies */}
          {popularMovies.length > 0 && (
            <MovieCarousel
              movies={popularMovies}
              title="Popular Movies"
              className="mb-12"
            />
          )}

          {/* Movies by Genre */}
          {Object.entries(genreMovies).map(([genreName, movies]) => (
            movies && movies.length > 0 && (
              <MovieCarousel
                key={genreName}
                movies={movies}
                title={genreName}
                className="mb-12"
              />
            )
          ))}

          {/* Call to Action */}
          <section className="text-center py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Discover Your Next Favorite Movie
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Use our intelligent search and filtering system to find movies you'll love
            </p>
            <Link
              to="/search"
              className="inline-flex items-center space-x-2 btn-netflix text-lg px-8 py-4"
            >
              <span>Start Exploring</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
