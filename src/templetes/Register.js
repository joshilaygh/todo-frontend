import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const registerUser = async () => {
        if (!email || !username || !password) {
            setError("Email, Username, and Password are required.");
            return;
        }

        try {
            await axios.post("http://127.0.0.1:8000/api/auth/register/", {
                email, // Include email
                username,
                password
            });

            alert("Registration successful! Please login.");
            navigate("/login"); // Redirect to login after successful registration
        } catch (err) {
            console.error("Registration error:", err.response ? err.response.data : err);
            setError("Registration failed. Try again.");
        }
    };

    return (
        <div className="container">
            <div className="todo-app">
                <h2>Register</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button onClick={registerUser}>Register</button>

                <p>
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </div>
        </div>
    );
}
