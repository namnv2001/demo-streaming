import { useState, useEffect, useRef } from 'react';
import type { Comment } from '../hooks/useRTMComments';

interface CommentSectionProps {
  comments: Comment[];
  onSendComment: (text: string) => void;
  isConnected: boolean;
}

export function CommentSection({
  comments,
  onSendComment,
  isConnected,
}: CommentSectionProps) {
  const [inputText, setInputText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isConnected) {
      onSendComment(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1a1a1a',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: '#222',
          borderBottom: '1px solid #333',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Comments {!isConnected && '(Connecting...)'}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {comments.length === 0 ? (
          <div
            style={{
              color: '#888',
              fontSize: 13,
              textAlign: 'center',
              padding: '20px',
            }}
          >
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={`${comment.userId}-${comment.timestamp}-${index}`}
              style={{
                padding: '8px 12px',
                background: '#252525',
                borderRadius: 6,
                border: '1px solid #333',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    color: '#4caf50',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {comment.userId}
                </span>
                <span
                  style={{
                    color: '#888',
                    fontSize: 11,
                  }}
                >
                  {formatTime(comment.timestamp)}
                </span>
              </div>
              <div
                style={{
                  color: '#fff',
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {comment.text}
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px',
          borderTop: '1px solid #333',
          background: '#1a1a1a',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? 'Type a comment...' : 'Connecting...'}
            disabled={!isConnected}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: '#252525',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            style={{
              padding: '10px 20px',
              background: isConnected && inputText.trim() ? '#4caf50' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isConnected && inputText.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

