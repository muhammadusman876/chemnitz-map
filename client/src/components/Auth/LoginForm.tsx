import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password); // use context's login
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <div className="mb-4">
                <label className="block mb-1 font-semibold">Email</label>
                <input
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1 font-semibold">Password</label>
                <input
                    type="password"
                    className="w-full border px-3 py-2 rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
};

export default LoginForm;