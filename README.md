# Netflix Clone with TMDb Integration

A modern, responsive Netflix-style web application built with React and TypeScript, featuring comprehensive TMDb API integration for movie data, user favorites, watchlists, and trailer playback.

## 🎬 Features

### Core Functionality
- **User Authentication**: Secure sign-in system with single device limitation using Supabase Auth
- **TMDb Integration**: Full integration with The Movie Database API for movie data and user interactions
- **Trailer Playback**: Play trailers on click for trending content and auto-play featured trailers
- **Search**: Comprehensive search functionality for movies and TV shows
- **Favorites & Watchlists**: Add/remove items from your TMDb favorites and watchlists
- **User Lists**: Dedicated page to view and manage your favorites and watchlists
- **Responsive Design**: Optimized for all screen sizes and devices

### UI & Performance
- **Netflix-Style Interface**: Authentic Netflix UI with modern design patterns
- **Smooth Animations**: GSAP and Framer Motion animations with performance optimizations
- **Lazy Loading**: Images load only when needed for better performance
- **Code Splitting**: Optimized bundle sizes with route-based code splitting
- **CSS Tree-shaking**: Unused styles automatically removed during build

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Netflix-themed components
- **Animations**: Framer Motion & GSAP for smooth, performant animations
- **Authentication**: Supabase Auth for app authentication + TMDb Auth for API features
- **API**: TMDb API v3 for movie data, trailers, and user interactions
- **Routing**: React Router v6 with protected routes
- **State Management**: React Context API
- **Build Tool**: Vite for fast development and optimized builds

## 🚀 Setup and Installation

### Prerequisites
- Node.js 16+ and npm
- TMDb API account
- Supabase project (for authentication)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd netflix-clone
npm install
```

### 2. Get TMDb API Key
1. Visit [The Movie Database (TMDb)](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API → Create API Key
4. Choose "Developer" and fill out the form
5. Copy your API Key (v3 auth)

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# TMDb API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_USERNAME=your_tmdb_username
VITE_TMDB_PASSWORD=your_tmdb_password
```

### 4. Run the Application
```bash
npm start
# or
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 TMDb API Integration Guide

### Authentication Flow
The app uses TMDb's authentication system for favorites and watchlists:

1. **Request Token**: `POST /authentication/token/new`
2. **Validate with Login**: `POST /authentication/token/validate_with_login`
3. **Create Session**: `POST /authentication/session/new`
4. **Get Account Details**: `GET /account`

### Key Endpoints Used

#### User Interactions
```javascript
// Add to favorites
POST /account/{account_id}/favorite
Body: { media_type: 'movie'|'tv', media_id: number, favorite: boolean }

// Add to watchlist  
POST /account/{account_id}/watchlist
Body: { media_type: 'movie'|'tv', media_id: number, watchlist: boolean }
```

#### Retrieve User Lists
```javascript
// Get favorite movies
GET /account/{account_id}/favorite/movies

// Get favorite TV shows
GET /account/{account_id}/favorite/tv

// Get watchlist movies
GET /account/{account_id}/watchlist/movies

// Get watchlist TV shows
GET /account/{account_id}/watchlist/tv
```

#### Search & Content
```javascript
// Search movies and TV shows
GET /search/multi?query={searchTerm}

// Get movie/TV trailers
GET /movie/{movie_id}/videos
GET /tv/{tv_id}/videos
```

### Usage Examples

#### Adding to Favorites
```typescript
import { addFavorite } from './api/tmdbApi';

const handleAddFavorite = async () => {
  try {
    await addFavorite(accountId, sessionId, 'movie', movieId, true);
    console.log('Added to favorites!');
  } catch (error) {
    console.error('Failed to add to favorites:', error);
  }
};
```

#### Searching Content
```typescript
import { searchMulti } from './api/tmdbApi';

const handleSearch = async (query: string) => {
  try {
    const results = await searchMulti(query);
    setSearchResults(results);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

#### Playing Trailers
```typescript
import { fetchVideos, getTrailerUrl } from './api/tmdbApi';

const handlePlayTrailer = async (movieId: number) => {
  try {
    const videos = await fetchVideos(movieId, 'movie');
    const trailerInfo = getTrailerUrl(videos);
    
    if (trailerInfo) {
      setTrailerUrl(trailerInfo.embedUrl);
    }
  } catch (error) {
    console.error('Failed to load trailer:', error);
  }
};
```

## 🎨 Performance Optimizations

### Animation Performance
- **GPU Acceleration**: All animations use `transform` and `opacity` properties
- **Will-Change**: Applied to elements before animation starts
- **Cleanup**: Animations properly cleaned up to prevent memory leaks

### Image Optimization
- **Lazy Loading**: `loading="lazy"` on all dynamic images
- **Responsive Images**: Multiple sizes served based on viewport
- **WebP Support**: Modern image formats when supported

### Bundle Optimization
- **Code Splitting**: Route-based splitting for smaller initial bundles
- **Tree Shaking**: Unused code automatically removed
- **CSS Purging**: Tailwind CSS removes unused styles in production

### Network Optimization
- **API Caching**: Intelligent caching of TMDb API responses
- **Request Batching**: Multiple API calls batched when possible
- **Error Boundaries**: Graceful handling of API failures

## 🔧 Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run clean      # Clean build artifacts
```

## 🗂 Project Structure

```
src/
├── api/                    # API integration
│   ├── tmdbApi.ts         # TMDb API functions
│   ├── tmdbAuth.ts        # TMDb authentication
│   └── supabase.ts        # Supabase client
├── components/            # Reusable components
│   ├── MovieCardActions.tsx
│   ├── TrailerModal.tsx
│   └── ...
├── pages/                 # Route components
│   ├── SearchPage.tsx
│   ├── UserListsPage.tsx
│   └── ...
├── context/              # React Context providers
└── hooks/                # Custom React hooks
```

## 🔒 Security Features

### Authentication
- **Dual Authentication**: Supabase for app access + TMDb for API features
- **Session Management**: Secure session handling with automatic cleanup
- **Protected Routes**: Route-level protection for authenticated features

### Data Protection
- **Row Level Security**: Supabase RLS policies for data isolation
- **API Key Security**: Environment variables for sensitive data
- **Input Validation**: Form validation and sanitization

## 🎯 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, WebP images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TMDb**: For providing the comprehensive movie database API
- **Netflix**: For design inspiration
- **Supabase**: For authentication and database services
- **React Community**: For the amazing ecosystem of tools and libraries

---

**Note**: This is a educational project built for learning purposes. It is not affiliated with Netflix, Inc.