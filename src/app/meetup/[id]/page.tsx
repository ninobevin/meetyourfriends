'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('@/components/MapComponent').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />
  }
);

interface Message {
  id: number;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface Location {
  id: number;
  participant_id: string;
  participant_name: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

interface Session {
  id: string;
  name: string;
  created_at: string;
}

export default function MeetupPage() {
  const params = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<Location[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [userId] = useState(() => Math.random().toString(36).substring(7));
  const [userName] = useState(() => `User-${Math.random().toString(36).substring(4)}`);
  
  // Watch user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          // TODO: Send location update to server
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions?sessionId=${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch session');
        const data = await response.json();
        setSession(data.session);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, [params.id]);

  // Fetch messages periodically
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?sessionId=${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data.messages);
        setParticipants(data.locations);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [params.id]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.id,
          message: newMessage,
          location: userLocation,
          sender: {
            id: userId,
            name: userName
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, params.id, userLocation, userId, userName]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Session: {session?.name || params.id}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl text-blue font-semibold mb-4">Participant Locations</h2>
            <MapComponent 
              participants={participants.map(p => ({
                id: p.participant_id,
                name: p.participant_name,
                location: {
                  latitude: p.latitude,
                  longitude: p.longitude
                }
              }))}
              userLocation={userLocation}
            />
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col h-[600px]">
            <h2 className="text-xl text-blue font-semibold mb-4">Group Chat</h2>
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    {msg.sender_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-black">{msg.sender_name}</p>
                    <p className="bg-gray-100 rounded-lg p-2 mt-1 text-black">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
