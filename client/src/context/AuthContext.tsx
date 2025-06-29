import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { getMe, login as loginApi, logout as logoutApi, register as registerApi } from '../api/authApi';
import type { User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    register: (username: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
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

        // Show loading toast
        const loadingToast = toast.loading('Creating your account...', {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });

        try {
            const response = await registerApi({ username, email, password });

            // Server has set the HTTP-only cookie/token
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Success toast
            toast.success(`Welcome, ${response.data.user.username}! 🎉`, {
                id: loadingToast,
                duration: 4000,
                style: {
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                },
            });

            return response.data;
        } catch (error: any) {
            // Error toast
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage, {
                id: loadingToast,
                duration: 5000,
                style: {
                    borderRadius: '10px',
                    background: '#EF4444',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);

        // Show loading toast
        const loadingToast = toast.loading('Signing you in...', {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });

        try {
            const response = await loginApi({ email, password });

            // Server has set the HTTP-only cookie/token
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Success toast
            toast.success(`Welcome back, ${response.data.user.username}! 👋`, {
                id: loadingToast,
                duration: 4000,
                style: {
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                },
            });

            return response.data;
        } catch (error: any) {
            // Error toast
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage, {
                id: loadingToast,
                duration: 5000,
                style: {
                    borderRadius: '10px',
                    background: '#EF4444',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        // Show loading toast
        const loadingToast = toast.loading('Signing you out...', {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });

        try {
            console.log('🔄 Calling logout API...');
            await logoutApi();
            console.log('✅ Logout API call successful');

            // Server has cleared the cookie
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');

            // Success toast
            toast.success('You have been signed out successfully! 👋', {
                id: loadingToast,
                duration: 3000,
                style: {
                    borderRadius: '10px',
                    background: '#6B7280',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#6B7280',
                },
            });

            console.log('✅ Local state cleared');
        } catch (error) {
            console.error("❌ Logout API failed:", error);

            // Even if API fails, clear local state
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');

            // Warning toast
            toast.error('Logout completed (with network error)', {
                id: loadingToast,
                duration: 4000,
                style: {
                    borderRadius: '10px',
                    background: '#F59E0B',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#F59E0B',
                },
            });

            console.log('⚠️ Cleared local state despite API error');
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
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

