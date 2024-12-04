import React, { useState, useEffect } from 'react';
import API from '../api/api';

const Home = () => {
    const userId = localStorage.getItem('userId');
    const [diary, setDiary] = useState([]);
    const [content, setContent] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchDiary();
    }, []);

    const fetchDiary = async () => {
        const response = await API.get(`/diary/${userId}`);
        setDiary(response.data);
    };

    const addDiary = async () => {
        await API.post('/diary', { userId, content });
        setContent('');
        fetchDiary();
    };

    const deleteDiary = async (id) => {
        await API.delete(`/diary/${id}`);
        fetchDiary();
    };

    const changePassword = async () => {
        await API.post('/change-password', { userId, newPassword });
        alert('Password changed successfully');
        setNewPassword('');
    };

    return (
        <div className="container">
            <h2 className="header">Welcome to Your Diary</h2>
            <input
                className="input"
                placeholder="Write something..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button className="button" onClick={addDiary}>Add</button>
            <ul className="diaryList">
                {diary.map((entry) => (
                    <li key={entry.id} className="diaryItem">
                        {entry.content} <button className="button" onClick={() => deleteDiary(entry.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <input
                className="input"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="button" onClick={changePassword}>Change Password</button>
        </div>
    );
};

export default Home;
