import { useCallback } from 'react';
import gsap from 'gsap';

export function useNavigate() {
  const navigate = useCallback((path: string) => {
    // Create a page transition animation
    gsap.to('.main', {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        // In a real app, we'd use React Router
        console.log(`Navigating to: ${path}`);
        // For demonstration, we just log the navigation
        // window.location.href = path;
      }
    });
  }, []);

  return navigate;
}