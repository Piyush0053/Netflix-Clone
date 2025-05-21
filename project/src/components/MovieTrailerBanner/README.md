# Movie Trailer Banner Component

A full-width movie trailer banner component for the Netflix clone homepage. This component features a background video with a dark overlay gradient, movie information, and action buttons.

## Features

- Background video that plays automatically (muted, autoplay, loop, and inline)
- Dark overlay gradient for better text readability
- Movie title, description, and genre tags overlaid on the left
- Two action buttons: 'Play' and 'More Info' with respective icons
- Mobile responsive design (stacked layout with centered text on small screens)
- Smooth fade-in animations for all elements using Framer Motion

## Usage

```tsx
import MovieTrailerBanner from './components/MovieTrailerBanner/MovieTrailerBanner';

const HomePage: React.FC = () => {
  return (
    <div>
      <MovieTrailerBanner
        videoSrc="/path/to/trailer-video.mp4"
        title="Movie Title"
        description="Movie description text goes here..."
        genres={['Action', 'Adventure', 'Sci-Fi']}
        onPlayClick={() => console.log('Play clicked')}
        onMoreInfoClick={() => console.log('More Info clicked')}
      />
      {/* Other components */}
    </div>
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `videoSrc` | string | Path to the video file to be used as background |
| `title` | string | Movie or show title |
| `description` | string | Short description or synopsis |
| `genres` | string[] | Array of genre names to display as tags |
| `onPlayClick` | () => void | Optional callback function when Play button is clicked |
| `onMoreInfoClick` | () => void | Optional callback function when More Info button is clicked |

## Responsive Behavior

- On larger screens, content is aligned to the left with more horizontal spacing
- On smaller screens (mobile), the layout adjusts to be more compact with centered text and stacked buttons
- Text size and spacing are optimized for different screen sizes

## Dependencies

- React
- Framer Motion (for animations)
- Lucide React (for icons)
- TailwindCSS (for styling)