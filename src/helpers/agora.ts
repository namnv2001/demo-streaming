import AgoraRTC from 'agora-rtc-sdk-ng'
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng'

// RTC client instance
let client!: IAgoraRTCClient

// Declare variables for local tracks
let localAudioTrack: IMicrophoneAudioTrack | null = null
let localVideoTrack: ICameraVideoTrack | null = null

// Connection parameters
const appId = '968b4222533c4358b9ab80035403f74c'
const channel = 'test'
const token = null
const uid = 0 // User ID

// Initialize the AgoraRTC client
function initializeClient() {
  client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8', role: 'host' })
  setupEventListeners()
}

// Handle client events
function setupEventListeners() {
  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType)
    console.log('subscribe success')

    if (mediaType === 'video') {
      displayRemoteVideo(user)
    }

    if (mediaType === 'audio') {
      user.audioTrack?.play()
    }
  })

  client.on('user-unpublished', async (user) => {
    const remotePlayerContainer = document.getElementById(user.uid.toString())
    remotePlayerContainer?.remove()
  })
}

// Create and publish local tracks
async function createLocalTracks() {
  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
  localVideoTrack = await AgoraRTC.createCameraVideoTrack()
}

// Display local video
function displayLocalVideo() {
  const localPlayerContainer = document.createElement('div')
  localPlayerContainer.id = uid.toString()
  localPlayerContainer.textContent = `Local user ${uid}`
  localPlayerContainer.style.width = '640px'
  localPlayerContainer.style.height = '480px'
  document.body.append(localPlayerContainer)
  localVideoTrack!.play(localPlayerContainer)
}

// Join as a host
async function joinAsHost() {
  await client.join(appId, channel, token, uid)
  // A host can both publish tracks and subscribe to tracks
  client.setClientRole('host')
  // Create and publish local tracks
  await createLocalTracks()
  await publishLocalTracks()
  displayLocalVideo()
  disableJoinButtons()
}

// Join as audience
async function joinAsAudience() {
  await client.join(appId, channel, token, uid)
  // Set low latency level
  const clientRoleOptions = { level: 1 }
  // Audience can only subscribe to tracks
  client.setClientRole('audience', clientRoleOptions)
  disableJoinButtons()
}

// Publish local tracks
async function publishLocalTracks() {
  await client.publish([localAudioTrack!, localVideoTrack!])
}

// Display remote user's video
function displayRemoteVideo(user: IAgoraRTCRemoteUser) {
  const remotePlayerContainer = document.createElement('div')
  remotePlayerContainer.id = user.uid.toString()
  remotePlayerContainer.textContent = `Remote user ${user.uid}`
  remotePlayerContainer.style.width = '640px'
  remotePlayerContainer.style.height = '480px'
  document.body.append(remotePlayerContainer)
  user.videoTrack?.play(remotePlayerContainer)
}

// Leave the channel
async function leaveChannel() {
  if (localAudioTrack) {
    localAudioTrack.close()
    localAudioTrack = null
  }

  if (localVideoTrack) {
    localVideoTrack.close()
    localVideoTrack = null
  }

  const localPlayerContainer = document.getElementById(uid.toString())
  localPlayerContainer?.remove()

  client.remoteUsers.forEach((user) => {
    const playerContainer = document.getElementById(user.uid.toString())
    playerContainer?.remove()
  })

  await client.leave()

  enableJoinButtons()
}

// Disable join buttons
function disableJoinButtons() {
  setDisabled('host-join', true)
  setDisabled('audience-join', true)
}

// Enable join buttons
function enableJoinButtons() {
  setDisabled('host-join', false)
  setDisabled('audience-join', false)
}

// Set up event listeners for buttons
function setupButtonHandlers() {
  setOnClick('host-join', joinAsHost)
  setOnClick('audience-join', joinAsAudience)
  setOnClick('leave', leaveChannel)
}

function setDisabled(id: string, disabled: boolean) {
  const el = document.getElementById(id) as HTMLButtonElement | null
  if (el) {
    el.disabled = disabled
  }
}

function setOnClick(id: string, handler: () => void) {
  const el = document.getElementById(id) as HTMLButtonElement | null
  if (el) {
    el.onclick = handler
  }
}

// Start live streaming
function startBasicLiveStreaming() {
  initializeClient()
  window.onload = setupButtonHandlers
}

startBasicLiveStreaming()
