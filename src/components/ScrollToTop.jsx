import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ smooth = false, behavior = 'auto' }) => {
  const { pathname, key } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only scroll if the pathname has actually changed
    if (prevPathname.current !== pathname) {
      const scrollOptions = {
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : behavior
      };

      // Modern scroll API with fallback
      try {
        window.scrollTo(scrollOptions);
      } catch (e) {
        // Fallback for older browsers
        window.scrollTo(0, 0);
      }

      // Update the previous pathname
      prevPathname.current = pathname;
    }
  }, [pathname, key, smooth, behavior]);

  return null;
};

export default ScrollToTop;