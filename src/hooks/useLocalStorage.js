import { useState, useCallback } from 'react';

/**
 * A custom hook to manage state synchronized with localStorage.
 * @param {string} key The key to store the data under in localStorage.
 * @param {any} initialValue The initial value if no data exists in localStorage.
 * @returns {[any, Function]} The current value and a setter function.
 */
export function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored json or return initialValue
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setStoredValue = useCallback((valueToStore) => {
        try {
            setValue(patternValue => {
                const valueToSave =
                    valueToStore instanceof Function ? valueToStore(patternValue) : valueToStore;

                // Save to local storage
                window.localStorage.setItem(key, JSON.stringify(valueToSave));

                return valueToSave;
            });
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    return [value, setStoredValue];
}
