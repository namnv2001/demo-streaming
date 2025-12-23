import { useMemo, useEffect } from 'react';
import {
  RemoteUser,
  useJoin,
  useRemoteUsers,
  useRTCClient,
} from 'agora-rtc-react';
import { useRTMComments } from './hooks/useRTMComments';
import { CommentSection } from './components/CommentSection';
import './App.css';

function App() {
  const appId = (import.meta.env.VITE_AGORA_APPID ??
    import.meta.env.AGORA_APPID) as string | undefined;
  const defaultChannel = (import.meta.env.VITE_AGORA_CHANNEL ?? '') as string;
  const defaultToken = (import.meta.env.VITE_AGORA_TOKEN ?? null) as
    | string
    | null;

  // Auto-join as audience - no manual controls needed
  const joinArgs = useMemo(
    () => ({
      appid: appId ?? '',
      channel: defaultChannel,
      token: defaultToken ?? null,
    }),
    [appId, defaultChannel, defaultToken],
  );

  // Auto-join when appId and channel are available
  const shouldJoin = Boolean(appId && defaultChannel);
  const { isConnected } = useJoin(joinArgs, shouldJoin);
  const client = useRTCClient();

  // Set client role to audience after joining
  useEffect(() => {
    if (isConnected && client) {
      const setAudienceRole = async () => {
        try {
          await client.setClientRole('audience', { level: 1 });
        } catch (error) {
          console.error('Failed to set audience role:', error);
        }
      };
      setAudienceRole();
    }
  }, [isConnected, client]);

  const remoteUsers = useRemoteUsers();
  const selectedRemote = useMemo(() => remoteUsers[0], [remoteUsers]);

  // RTM comments - only enable when RTC is connected
  const {
    comments,
    sendComment,
    isConnected: isRTMConnected,
    viewerCount,
  } = useRTMComments(appId, defaultChannel, isConnected && shouldJoin);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          background: '#111',
          borderBottom: '1px solid #222',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          Agora Live Streaming Demo
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 13,
          }}
        >
          {isRTMConnected && viewerCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#fff',
              }}
            >
              <span style={{ fontWeight: 600 }}>Viewers:</span>
              <span style={{ color: '#4caf50' }}>{viewerCount}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isConnected ? '#4caf50' : '#888',
              }}
            />
            <span style={{ color: isConnected ? '#4caf50' : '#888' }}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          gap: 16,
          padding: 16,
        }}
      >
        {/* Video stream area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          {selectedRemote ? (
            <div
              style={{
                flex: 1,
                background: '#111',
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  background: '#222',
                  borderBottom: '1px solid #333',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Live Stream - Host {String(selectedRemote.uid)}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#000',
                  position: 'relative',
                }}
              >
                <RemoteUser
                  user={selectedRemote}
                  playVideo
                  playAudio
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#111',
                borderRadius: 8,
                color: '#888',
                fontSize: 16,
              }}
            >
              {!shouldJoin
                ? 'Missing configuration. Please set VITE_AGORA_APPID and VITE_AGORA_CHANNEL.'
                : !isConnected
                ? 'Waiting for stream...'
                : 'No active stream'}
            </div>
          )}

          {/* Additional remote users (if any) */}
          {remoteUsers.length > 1 && (
            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
              }}
            >
              {remoteUsers.slice(1).map((user) => (
                <div
                  key={String(user.uid)}
                  style={{
                    background: '#111',
                    borderRadius: 8,
                    overflow: 'hidden',
                    aspectRatio: '16 / 9',
                  }}
                >
                  <div
                    style={{
                      padding: 8,
                      color: '#fff',
                      fontSize: 11,
                      background: '#222',
                    }}
                  >
                    Host {String(user.uid)}
                  </div>
                  <div style={{ width: '100%', height: '100%' }}>
                    <RemoteUser
                      user={user}
                      playVideo
                      playAudio
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments sidebar */}
        <div
          style={{
            width: 360,
            minWidth: 360,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CommentSection
            comments={comments}
            onSendComment={sendComment}
            isConnected={isRTMConnected}
          />
        </div>
      </div>

      {/* Error message */}
      {!appId && (
        <div
          style={{
            padding: '12px 24px',
            background: '#b00020',
            color: '#fff',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Missing `VITE_AGORA_APPID` in environment. Add it to your `.env`.
        </div>
      )}
    </div>
  );
}

export default App;
