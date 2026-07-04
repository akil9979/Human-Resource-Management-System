import { useEffect } from 'react';

/**
 * Sets the document.title reactively whenever the given title changes.
 * Falls back to the base app name when title is empty.
 */
const BASE_TITLE = 'HRMS — Human Resource Management';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title ? `${title} | HRMS` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
};

export default usePageTitle;
