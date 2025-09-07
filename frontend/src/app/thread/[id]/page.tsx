'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Thread {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  content: string;
  created_at: string;
  thread_id: number;
}

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!threadId) return;

    const fetchThreadAndPosts = async () => {
      try {
        // Fetch thread details
        const threadResponse = await fetch(`/api/threads/${threadId}`);
        if (threadResponse.ok) {
          const threadData = await threadResponse.json();
          setThread(threadData);
        }

        // Fetch posts for this thread
        const postsResponse = await fetch(`/api/threads/${threadId}/posts`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
      } catch (error) {
        console.error('Error fetching thread and posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreadAndPosts();
  }, [threadId]);

  const refetchData = async () => {
    if (!threadId) return;
    
    try {
      // Fetch thread details
      const threadResponse = await fetch(`/api/threads/${threadId}`);
      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        setThread(threadData);
      }

      // Fetch posts for this thread
      const postsResponse = await fetch(`/api/threads/${threadId}/posts`);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching thread and posts:', error);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPostContent,
          thread_id: parseInt(threadId),
        }),
      });

      if (response.ok) {
        setNewPostContent('');
        refetchData();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Thread not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back to threads link */}
      <Link href="/" className="text-blue-500 hover:text-blue-700 mb-6 inline-block">
        ← Back to all threads
      </Link>

      {/* Thread details */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>
        <p className="text-gray-700 mb-4">{thread.content}</p>
        <p className="text-sm text-gray-500">
          Created: {new Date(thread.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Posts/Replies */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Replies ({posts.length})
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No replies yet. Be the first to reply!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-gray-700 mb-2">{post.content}</p>
                <p className="text-sm text-gray-500">
                  Posted: {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Add a Reply</h3>
        <form onSubmit={createPost} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Your Reply
            </label>
            <textarea
              id="content"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your reply"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Post Reply
          </button>
        </form>
      </div>
    </div>
  );
}
