import { useEffect } from 'react';

/**
 * Custom hook to manage the document title.
 * Updates the title on mount/change and optionally restores it on unmount.
 * 
 * @param title - The new document title
 * @param restoreOnUnmount - Whether to restore the original title when the component unmounts
 */
export const useDocumentTitle = (title: string, restoreOnUnmount: boolean = true) => {
    useEffect(() => {
        const previousTitle = document.title;

        if (title) {
            document.title = title;
        }

        return () => {
            if (restoreOnUnmount) {
                document.title = previousTitle;
            }
        };
    }, [title, restoreOnUnmount]);
};
