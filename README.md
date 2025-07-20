# 🎬 Movie Recommender - MERN Stack Application

A Netflix-style movie recommendation application built with the MERN stack (MongoDB, Express.js, React, Node.js) and integrated with The Movie Database (TMDB) API.

![Movie Recommender Banner](https://via.placeholder.com/1200x400/141414/E50914?text=🎬+Movie+Recommender)

An intelligent movie discovery and recommendation system featuring:

- Netflix-inspired user interface  
- Real-time movie search and filtering  
- Personalized recommendations based on user preferences  
- Detailed movie information including cast, ratings, and trailers  
- Responsive design for all devices  

---

## 🚀 Features

### Core Functionality

- 🔍 **Movie Search**: Search movies by title with real-time suggestions  
- 🧠 **Advanced Filtering**: Filter by genre, year, rating, and cast  
- 🎥 **Movie Details**: Comprehensive info with cast, crew, and trailers  
- 🤖 **Recommendations**: Smart suggestions based on interactions  
- 🔥 **Popular Movies**: Trending and popular carousels  
- 🎭 **Genre Categories**: Browse by specific genres  

### UI/UX Features

- 🖤 Netflix-style dark theme  
- 🧱 Responsive grid and carousel layouts  
- ✨ Smooth hover effects and transitions  
- 🔁 Infinite scroll for better performance  
- ⏳ Loading states and error handling  
- 🧠 Search history and suggestions  

---

## 🛠 Tech Stack

### Frontend

- `React.js` – UI Library  
- `React Router` – Client-side routing  
- `Tailwind CSS` – Utility-first styling  
- `Material-UI Icons` – Icon components  
- `Axios` – API requests  
- `React Slick` – Carousel  
 
### Backend

- `Node.js` – JS runtime  
- `Express.js` – Web server framework  
- `MongoDB` – NoSQL database (optional)  
- `Mongoose` – ODM for MongoDB  
- `TMDB API` – External movie data  
- `CORS`, `Helmet` – Security  
 
### Dev Tools

- `Nodemon`, `Morgan` – Development + logging  
- `Dotenv` – Env variable management  
- `Express Rate Limit` – API protection  

---

## 📁 Project Structure

```
movie-recommender/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── movieController.js
│   │   ├── models/
│   │   │   ├── SearchHistory.js
│   │   │   └── Recommendation.js
│   │   ├── routes/
│   │   │   ├── movieRoutes.js
│   │   │   └── peopleRoutes.js
│   │   ├── services/
│   │   │   ├── tmdbService.js
│   │   │   └── databaseService.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── app.js
│   ├── config/
│   │   └── database.js
│   ├── tests/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── MovieCard.js
│   │   │   ├── MovieGrid.js
│   │   │   ├── MovieCarousel.js
│   │   │   ├── SearchBar.js
│   │   │   ├── Loading.js
│   │   │   └── ErrorBoundary.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Search.js
│   │   │   └── MovieDetails.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── MovieContext.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (optional)
- TMDB API Key – [Get it here](https://www.themoviedb.org/settings/api)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/movie-recommender.git
cd movie-recommender
```

### 2. Backend Setup

```bash
cd backend
npm install express cors dotenv helmet morgan axios mongoose express-rate-limit express-validator uuid
cp .env.example .env
```

### 3. Configure Environment Variables

Create a `backend/.env` file:

```env
# TMDB Configuration
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500

# Backend Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000

# MongoDB Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/movie-recommender
```

### 4. Frontend Setup

```bash
cd frontend
npm install axios react-router-dom styled-components @mui/material @emotion/react @emotion/styled @mui/icons-material react-slick slick-carousel lodash react-loading-skeleton tailwindcss postcss autoprefixer
```

### 5. Start Development Servers

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

---

## 🌐 API Endpoints

### Movies

- `GET /api/movies/popular` – Get popular movies  
- `GET /api/movies/search?q={query}` – Search movies  
- `GET /api/movies/genres` – Get all genres  
- `GET /api/movies/discover` – Discover movies with filters  
- `GET /api/movies/:id` – Movie details  
- `GET /api/movies/genre/:genreId` – Movies by genre  
- `GET /api/movies/:id/recommendations` – Movie recommendations  

### People

- `GET /api/people/search?q={query}` – Search actors/directors  

### System

- `GET /api/health` – API health check  

---

## 🎨 UI Components

### Core Components

- **Header** – Navigation with search  
- **MovieCard** – Single movie preview  
- **MovieGrid** – Grid layout  
- **MovieCarousel** – Horizontal slider  
- **SearchBar** – Filters + suggestions  
- **Loading** – Skeleton loader  
- **ErrorBoundary** – Error handling  

### Pages

- **Home** – Featured + genres  
- **Search** – Filtered results  
- **MovieDetails** – In-depth movie info  

---

## 🔐 Environment Configuration

| Variable              | Description                   | Example                                 |
|----------------------|-------------------------------|-----------------------------------------|
| `TMDB_API_KEY`       | Your TMDB API key             | abc123def456...                         |
| `TMDB_BASE_URL`      | TMDB API base URL             | https://api.themoviedb.org/3            |
| `TMDB_IMAGE_BASE_URL`| TMDB image base URL           | https://image.tmdb.org/t/p/w500         |
| `PORT`               | Backend server port           | 5000                                    |
| `CLIENT_URL`         | Frontend for CORS             | http://localhost:3000                   |
| `MONGODB_URI`        | MongoDB connection string     | mongodb://localhost:27017/movie-recommender |

---

## 🎯 Current Implementation Status

### ✅ Completed Features

- Project structure setup  
- Express.js backend + TMDB  
- React frontend + Netflix UI  
- Movie search + filtering  
- Movie details + trailers  
- Responsive design  
- Error/loading states  
- API rate limiting  

### 🧪 Known Issues (In Progress)

- Backend route imports not fully linked  
- `/api/movies/genres` and `/discover` return 404  
- Frontend-backend communication errors  
- TMDB API timeout occasionally  

---

## 🚀 Upcoming Features

- User authentication system  
- Favorites and watchlist  
- Enhanced recommendation engine  
- Social sharing  
- Ratings and reviews  
- Production deployment  

---

## 🐛 Common Issues & Troubleshooting

### Backend

- `404` Errors: Check route imports in `app.js`  
- API Timeout: Verify TMDB key + network  
- Env Variables: Ensure correct `.env` format  

### Frontend

- Proxy Errors: Check `package.json` proxy  
- Module Errors: Run `npm install`  
- CORS Issues: Match `CLIENT_URL` in backend  

---

## 📝 Development Guidelines

### Code Style

- Use ES6+  
- Follow React best practices  
- Proper error handling  
- Clear variable naming  
- Comment complex logic  

### Git Workflow

- Use feature branches  
- Write meaningful commits  
- Test before pushing  

---

## 📧 Support

- [Create an issue](https://github.com/yourusername/movie-recommender/issues)  
- Refer to troubleshooting section  
- Check TMDB API documentation  

---



---

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data  
- Netflix for UI/UX inspiration  
- Open-source React & Node communities
