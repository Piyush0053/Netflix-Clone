declare module 'movie-trailer' {
  /**
   * Get the YouTube trailer URL for a movie
   * @param movieName - The name of the movie to get the trailer for
   * @param options - Options for the movie trailer
   * @returns A promise that resolves with the YouTube URL string
   */
  function movieTrailer(movieName?: string, options?: Record<string, any>): Promise<string>;
  
  export = movieTrailer;
}
