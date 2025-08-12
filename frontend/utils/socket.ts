"use client"
import { io } from 'socket.io-client';

const URL = 'https://argumint-3y9b.onrender.com';

export const socket = io(URL, {
    autoConnect: false,
  transports: ['websocket'],
});