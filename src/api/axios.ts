import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY || '8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b',
  },
});

export default instance;