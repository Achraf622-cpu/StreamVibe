import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage('user', null);
    const [users, setUsers] = useLocalStorage('users_db', []); // Simulated DB of users

    const login = (email, password) => {
        const foundUser = users.find((u) => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return { success: true };
        }
        return { success: false, message: 'Invalid email or password' };
    };

    const register = (userData) => {
        const existingUser = users.find((u) => u.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'User already exists' };
        }
        const newUser = { ...userData, id: Date.now().toString() };
        setUsers([...users, newUser]);
        setUser(newUser);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
