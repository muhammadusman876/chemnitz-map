import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe, login as loginApi, logout as logoutApi, register as registerApi } from '../api/authApi';
import type { User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    register: (username: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>; // <-- Add this line
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // First load from localStorage for immediate UI response
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    // Then verify with the server - this is the source of truth
    useEffect(() => {
        const verifyAuthentication = async () => {
            try {
                setLoading(true);
                // Call the backend to verify if the cookie/token is valid
                const response = await getMe();

                // If successful, update state and localStorage
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } catch (error) {
                // If token verification fails, clear authentication state
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        verifyAuthentication();
    }, []);

    const register = async (username: string, email: string, password: string) => {
        setLoading(true);
        try {
            const response = await registerApi({ username, email, password });
            // Server has set the HTTP-only cookie/token
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await loginApi({ email, password });
            // Server has set the HTTP-only cookie/token
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            ('🔄 Calling logout API...');
            await logoutApi();
            ('✅ Logout API call successful');

            // Server has cleared the cookie
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');

            ('✅ Local state cleared');
        } catch (error) {
            console.error("❌ Logout API failed:", error);

            // Even if API fails, clear local state
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');

            ('⚠️ Cleared local state despite API error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            register,
            login,
            logout,
            isAuthenticated,
            setUser // <-- Provide setUser in the context
        }}>
            {children}
        </AuthContext.Provider>
    );
};

