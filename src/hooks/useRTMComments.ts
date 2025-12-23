import { useEffect, useState, useRef, useCallback } from 'react';
import AgoraRTM, { type RtmClient, type RtmChannel } from 'agora-rtm-sdk';

export interface Comment {
  text: string;
  userId: string;
  timestamp: number;
}

export function useRTMComments(
  appId: string | undefined,
  channelName: string,
  enabled: boolean,
) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<RtmClient | null>(null);
  const channelRef = useRef<RtmChannel | null>(null);
  const userIdRef = useRef<string>(
    `viewer_${Math.random().toString(36).substring(2, 9)}`,
  );

  // Initialize RTM client and channel
  useEffect(() => {
    if (!enabled || !appId || !channelName) {
      return;
    }

    let mounted = true;

    const initializeRTM = async () => {
      try {
        // Create RTM client
        const client = AgoraRTM.createInstance(appId);
        clientRef.current = client;

        // Login
        await client.login({ uid: userIdRef.current });

        // Create and join channel
        const channel = client.createChannel(channelName);
        channelRef.current = channel;

        // Handle channel messages
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        channel.on('ChannelMessage', (message, _memberId) => {
          if (!mounted) return;
          try {
            // Check if message is a text message
            if ('text' in message && message.text) {
              const data = JSON.parse(message.text);
              if (data.text && data.userId) {
                setComments((prev) => [
                  ...prev,
                  {
                    text: data.text,
                    userId: data.userId,
                    timestamp: data.timestamp || Date.now(),
                  },
                ]);
              }
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        });

        // Join channel
        await channel.join();
        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to initialize RTM:', error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    initializeRTM();

    return () => {
      mounted = false;
      const cleanup = async () => {
        try {
          if (channelRef.current) {
            await channelRef.current.leave();
            channelRef.current = null;
          }
          if (clientRef.current) {
            await clientRef.current.logout();
            clientRef.current = null;
          }
        } catch (error) {
          console.error('Error during RTM cleanup:', error);
        }
      };
      cleanup();
    };
  }, [enabled, appId, channelName]);

  // Send comment
  const sendComment = useCallback(
    async (text: string) => {
      if (!channelRef.current || !isConnected || !text.trim()) {
        return;
      }

      try {
        const message = {
          text,
          userId: userIdRef.current,
          timestamp: Date.now(),
        };

        await channelRef.current.sendMessage({
          text: JSON.stringify(message),
        });

        // Add own comment to local state immediately
        setComments((prev) => [
          ...prev,
          {
            text,
            userId: userIdRef.current,
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        console.error('Failed to send comment:', error);
      }
    },
    [isConnected],
  );

  return {
    comments,
    sendComment,
    isConnected,
    userId: userIdRef.current,
  };
}
