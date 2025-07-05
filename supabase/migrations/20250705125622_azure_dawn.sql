/*
  # Create user watchlist table

  1. New Tables
    - `user_watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `movie_id` (integer, TMDb movie/TV ID)
      - `title` (text, movie/TV title)
      - `poster_path` (text, poster image path)
      - `media_type` (text, 'movie' or 'tv')
      - `added_at` (timestamp)

  2. Security
    - Enable RLS on `user_watchlist` table
    - Add policies for authenticated users to manage their own watchlist
*/

CREATE TABLE IF NOT EXISTS user_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id integer NOT NULL,
  title text NOT NULL,
  poster_path text,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id, media_type)
);

-- Enable RLS
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watchlist"
  ON user_watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist"
  ON user_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own watchlist"
  ON user_watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_added_at ON user_watchlist(added_at DESC);