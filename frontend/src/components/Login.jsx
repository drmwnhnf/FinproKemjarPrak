import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await API.post('/login', { username, password });
            localStorage.setItem('token', response.data.token); // Save token to localStorage
            localStorage.setItem('userId', response.data.userId); // Save userId
            navigate('/home');
        } catch (error) {
            alert('Login failed!');
        }
    };

    return (
        <div className="container">
            <h2 className="header">DVWA - Darmawan Vulnerable Web App</h2>
            <input
                className="input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="button" onClick={handleLogin}>LOGIN</button>
            <br />
            <p>
                Don't have an account?{' '}
                <Link to="/register" className="link">Register Here</Link>
            </p>
        </div>
    );
};

export default Login;
