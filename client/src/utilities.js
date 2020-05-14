import axios from 'axios';
import { theme } from './theme';

export const backendURL = window.location.hostname.includes("localhost") ? "http://localhost:5000" : "/api"

export const backendCall = axios.create({
    baseURL: backendURL
});

export const rgbToHex = (rgb) => {
    let hex = Number(rgb).toString(16);
    return hex.length === 6 ? ( "#" + hex ) : ( "#fff" )
};
