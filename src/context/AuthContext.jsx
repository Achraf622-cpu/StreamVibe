import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
    auth as firebaseAuth, 
    isFirebaseConfigured 
} from '../services/firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // LocalStorage fallback state
    const [localUser, setLocalUser] = useLocalStorage('user', null);
    const [localUsersDB, setLocalUsersDB] = useLocalStorage('users_db', []);

    // Active User State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseConfigured) {
            const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
                if (firebaseUser) {
                    setUser({
                        id: firebaseUser.uid,
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        avatar: firebaseUser.photoURL
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            // Fallback
            setUser(localUser);
            setLoading(false);
        }
    }, [isFirebaseConfigured, localUser]);

    const login = async (email, password) => {
        if (isFirebaseConfigured) {
            try {
                await signInWithEmailAndPassword(firebaseAuth, email, password);
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        } else {
            const foundUser = localUsersDB.find((u) => u.email === email && u.password === password);
            if (foundUser) {
                setLocalUser(foundUser);
                setUser(foundUser);
                return { success: true };
            }
            return { success: false, message: 'Invalid email or password' };
        }
    };

    const register = async (userData) => {
        if (isFirebaseConfigured) {
            try {
                const userCredential = await createUserWithEmailAndPassword(firebaseAuth, userData.email, userData.password);
                await updateProfile(userCredential.user, {
                    displayName: userData.username
                });
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        } else {
            const existingUser = localUsersDB.find((u) => u.email === userData.email);
            if (existingUser) {
                return { success: false, message: 'User already exists' };
            }
            const newUser = { ...userData, id: Date.now().toString() };
            setLocalUsersDB([...localUsersDB, newUser]);
            setLocalUser(newUser);
            setUser(newUser);
            return { success: true };
        }
    };

    const logout = async () => {
        if (isFirebaseConfigured) {
            try {
                await signOut(firebaseAuth);
            } catch (error) {
                console.error("Logout failed", error);
            }
        } else {
            setLocalUser(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
            {!loading && children}
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
