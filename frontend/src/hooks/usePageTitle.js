import { useEffect } from "react";

/**
 * Custom hook to dynamically update the browser tab title
 * @param {string} title - The page title to display
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    const baseTitle = "AI Icon Generator – Create Professional Icons with AI";
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = baseTitle;
    };
  }, [title]);
};
