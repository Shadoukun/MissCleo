import axios from 'axios';


export const backendCall = axios.create({
    baseURL: window.location.hostname.includes("localhost") ?
        "http://localhost:5000" : "/api"
});

