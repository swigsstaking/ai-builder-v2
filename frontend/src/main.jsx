import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { initPostHog } from './lib/posthog';

initPostHog();

const GOOGLE_CLIENT_ID = '189258755312-e5qvv3oeq0d3o9q9180o5htabjh1u9mp.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} scriptSrc="https://accounts.google.com/gsi/client?hl=fr">
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
