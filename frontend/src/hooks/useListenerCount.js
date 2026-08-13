// src/hooks/useListenerCount.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useRadio } from '../context/RadioContext';

// Generate or retrieve persistent visitor ID for tab deduplication
function getOrCreateVisitorId() {
  let id = localStorage.getItem('radio_visitorId');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('radio_visitorId', id);
  }
  return id;
}

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://127.0.0.1:5001';

export function useListenerCount() {
  const { isPlaying } = useRadio();
  const [listenerCount, setListenerCount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    
    // Connect to WebSocket server with query parameters
    const newSocket = io(SOCKET_URL, {
      query: { visitorId },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Synchronize the current play state immediately on connect/reconnect
      newSocket.emit('playback_state_change', { isPlaying });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setListenerCount(null);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
      setListenerCount(null);
    });

    newSocket.on('listener_count_update', (count) => {
      setListenerCount(count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync play state with backend in real-time
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('playback_state_change', { isPlaying });
    }
  }, [isPlaying, socket, isConnected]);

  return { listenerCount, isConnected };
}
