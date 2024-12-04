import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000', // Ganti dengan URL backend Anda
});

export default API;
