'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Thread {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newThreadTitle,
          content: newThreadContent,
        }),
      });

      if (response.ok) {
        setNewThreadTitle('');
        setNewThreadContent('');
        fetchThreads();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Discussion Threads</h1>
      
      {/* Create Thread Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Thread</h2>
        <form onSubmit={createThread} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter thread title"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={newThreadContent}
              onChange={(e) => setNewThreadContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter thread content"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Thread
          </button>
        </form>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {threads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No threads yet. Create the first one!
          </div>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Link href={`/thread/${thread.id}`} className="block">
                <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2">
                  {thread.title}
                </h3>
                <p className="text-gray-700 mb-3 line-clamp-3">{thread.content}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(thread.created_at).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
