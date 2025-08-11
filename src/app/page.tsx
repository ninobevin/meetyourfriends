'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [meetupName, setMeetupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateMeetup = useCallback(async () => {
    if (!meetupName.trim()) {
      setError('Please enter a meetup name');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Create session ID from meetup name (simplified for demo)
      const sessionId = encodeURIComponent(meetupName.toLowerCase().replace(/\s+/g, '-'));
      router.push(`/meetup/${sessionId}`);
    } catch (err) {
      setError('Failed to create meetup');
    } finally {
      setIsLoading(false);
    }
  }, [meetupName, router]);

  const handleJoinMeetup = useCallback(async () => {
    if (!meetupName.trim()) {
      setError('Please enter a meetup name');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const sessionId = encodeURIComponent(meetupName.toLowerCase().replace(/\s+/g, '-'));
      router.push(`/meetup/${sessionId}`);
    } catch (err) {
      setError('Failed to join meetup');
    } finally {
      setIsLoading(false);
    }
  }, [meetupName, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8 md:pt-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Meet Your Friends
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with friends in real-time and make meetups easier than ever
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="mt-8 md:mt-12 max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter a meetup name"
                value={meetupName}
                onChange={(e) => setMeetupName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateMeetup}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Create Meetup
              </button>
              <button
                onClick={handleJoinMeetup}
                disabled={isLoading}
                className="flex-1 bg-purple-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Join Meetup
              </button>
            </div>
            {isLoading && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please wait while we process your request...
              </p>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3 pb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Image 
                src="/globe.svg" 
                alt="Location icon" 
                width={24} 
                height={24}
                className="text-blue-600"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Location</h3>
            <p className="text-gray-600">Share your location and see where your friends are instantly</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Image 
                src="/window.svg" 
                alt="Chat icon" 
                width={24} 
                height={24}
                className="text-purple-600"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Group Chat</h3>
            <p className="text-gray-600">Chat with your friends and coordinate meetups easily</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Image 
                src="/file.svg" 
                alt="Privacy icon" 
                width={24} 
                height={24}
                className="text-green-600"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">Your data is automatically deleted after 24 hours</p>
          </div>
        </div>
      </div>
    </main>
  );
}
