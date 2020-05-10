import axios from 'axios';

export const backendURL = window.location.hostname.includes("localhost") ? "http://localhost:5000" : "/api"

export const backendCall = axios.create({
    baseURL: backendURL
});
