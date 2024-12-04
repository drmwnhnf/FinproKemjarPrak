import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';  // Pastikan path-nya benar
import './index.css';  // Jika Anda menggunakan file CSS

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
