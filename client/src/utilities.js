import React, { useEffect, useRef } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./context/Auth";
import axios from 'axios';

export const backendURL = window.location.hostname.includes("localhost") ? "http://localhost:10000" : "/api"

export const backendCall = axios.create({
  baseURL: backendURL
});


export const getParams = (location) => {
  return new URLSearchParams(location.search || "")
}

// custom hook for getting previous value
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


export const rgbToHex = (rgb) => {
  let hex = Number(rgb).toString(16);
  return hex.length === 6 ? ("#" + hex) : ("#fff")
};


