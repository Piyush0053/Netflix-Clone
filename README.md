# Netflix Clone

A modern web application replicating Netflix's core features, built with React and TypeScript, integrated with Supabase for authentication and database management, and utilizing the TMDB API for movie and trailer data.

## Features
- **User Authentication**: Secure sign-in system with single device limitation using Supabase Auth.
- **Trailer Playback**: Play trailers on click for trending content and auto-play featured trailers on the home page.
- **Content Display**: Fetches and displays trending movies and shows from TMDB API.
- **Protected Routes**: Access to certain sections restricted to authenticated users.
- **Responsive Design**: Optimized for various screen sizes and devices.

## Tech Stack
- **React with TypeScript**: For building the user interface with type safety.
- **Supabase**: Handles authentication, user data, and session management.
- **TMDB API**: Source for movie data, images, and trailer URLs.

## Setup and Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd Netflix-Clone
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   - Create a `.env` file in the root directory.
   - Add Supabase URL and Anon Key:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_project_url
     REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
     REACT_APP_TMDB_API_KEY=your_tmdb_api_key
     ```
4. **Run the Application**:
   ```bash
   npm start
   ```

## Database Schema
- **profiles**: Stores user information.
- **signin_attempts**: Tracks login attempts for security.
- **security_audit_log**: Logs security-related actions.
- **active_sessions**: Manages active user sessions for single device sign-in enforcement.

## Security Features
- **Single Device Sign-in**: Limits user sessions to one device at a time using device fingerprinting.
- **RLS Policies**: Row-Level Security policies configured in Supabase for data protection.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.