import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const app = clientId ? (
    <GoogleOAuthProvider clientId={clientId}>
        <App />
    </GoogleOAuthProvider>
) : (
    <App />
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {app}
    </React.StrictMode>,
)
