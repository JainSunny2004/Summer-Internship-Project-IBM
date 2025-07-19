import React, { useRef } from 'react';
import Slider from 'react-slick';
import MovieCard, { CompactMovieCard } from './MovieCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
    aria-label="Next movies"
  >
    <ChevronRightIcon />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
    aria-label="Previous movies"
  >
    <ChevronLeftIcon />
  </button>
);

const MovieCarousel = ({ 
  movies = [], 
  title, 
  loading = false,
  className = "",
  compact = false,
  showArrows = true
}) => {
  const sliderRef = useRef(null);

  // Slider settings
  const settings = {
    dots: false,
    infinite: movies.length > 6,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 3,
    arrows: false, // We'll use custom arrows
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // Handle arrow clicks
  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  if (loading) {
    return (
      <div className={className}>
        {title && <h2 className="section-title">{title}</h2>}
        <div className="relative">
          <div className="flex space-x-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="min-w-[200px] aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className={`relative group ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      
      <div className="relative">
        <Slider ref={sliderRef} {...settings}>
          {movies.map((movie) => (
            <div key={movie.id} className="px-2">
              {compact ? (
                <CompactMovieCard movie={movie} />
              ) : (
                <MovieCard movie={movie} />
              )}
            </div>
          ))}
        </Slider>

        {/* Custom Navigation Arrows */}
        {showArrows && movies.length > 6 && (
          <>
            <PrevArrow onClick={goToPrev} />
            <NextArrow onClick={goToNext} />
          </>
        )}
      </div>
    </div>
  );
};

export default MovieCarousel;
