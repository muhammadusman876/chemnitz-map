import React from "react";
import LoginForm from "../components/Auth/LoginForm";

const Login: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
                    Welcome Back
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    Please log in to your account to continue
                </p>
                <LoginForm />
                <div className="mt-6 text-center text-gray-600">
                    Don't have an account?{" "}
                    <a
                        href="/register"
                        className="text-indigo-600 hover:underline font-semibold"
                    >
                        Register
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;