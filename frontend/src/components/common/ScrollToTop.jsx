import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly scroll window and main scrollable containers to top
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;