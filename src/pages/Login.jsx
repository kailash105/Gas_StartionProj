import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/dashboard", { replace: true });
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(email, password);
        } catch (err) {
            setError(err.code);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6">SAI BALAJI FILLING STATION</h1>

                {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-4">{error}</div>}

                <input className="w-full p-3 border rounded mb-4"
                    type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />

                <input className="w-full p-3 border rounded mb-6"
                    type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />

                <button disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded font-semibold">
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
