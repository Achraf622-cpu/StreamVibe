import { useEffect, useRef, useState, useCallback } from 'react';

export const useInfiniteScroll = (callback, isLoading) => {
    const observerRef = useRef(null);

    const observerCallback = useCallback(
        (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !isLoading) {
                callback();
            }
        },
        [callback, isLoading]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '100px', // Trigger slightly before bottom
            threshold: 0.1,
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [observerCallback]);

    return observerRef;
};
