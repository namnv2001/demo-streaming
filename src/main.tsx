import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraRTCProvider } from 'agora-rtc-react';
import type { IAgoraRTCClient } from 'agora-rtc-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Create RTC client for live streaming (audience role will be set on join)
const rtcClient = AgoraRTC.createClient({
  mode: 'live',
  codec: 'vp8',
}) as unknown as IAgoraRTCClient;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgoraRTCProvider client={rtcClient}>
      <App />
    </AgoraRTCProvider>
  </StrictMode>,
);
