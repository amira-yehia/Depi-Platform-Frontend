import { memo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./PageTransition.css";

function PageTransition({ children }) {
  const location = useLocation();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (prefersReducedMotion) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
  }, [location.pathname, prefersReducedMotion]);

  const transitionClassName = [
    "pageTransition",
    isAnimating ? "pageTransition--animating" : "",
    prefersReducedMotion ? "pageTransition--reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={transitionClassName}
      onAnimationEnd={() => setIsAnimating(false)}
    >
      {children}
    </div>
  );
}

export default memo(PageTransition);
