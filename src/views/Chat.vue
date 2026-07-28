<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-left" @click="goBack">
        <span class="back-icon">←</span>
      </div>
      <div class="header-center">
        <div class="partner-info">
          <div class="partner-name">{{ partnerName }}</div>
          <div class="partner-status">
            <span class="status-dot online"></span>
            <span class="status-text">在线</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button @click="toggleVideoCall" class="call-btn video-btn">
          <span>📹</span>
        </button>
        <button @click="toggleVoiceCall" class="call-btn voice-btn">
          <span>📞</span>
        </button>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message-item', message.isMine ? 'mine' : 'partner']"
      >
        <div class="message-content">
          <template v-if="message.type === 'text'">
            <span>{{ message.content }}</span>
          </template>
          <template v-else-if="message.type === 'voice'">
            <div class="voice-message">
              <button @click="toggleVoicePlay(message)" class="voice-btn">
                <span v-if="!message.isPlaying">▶</span>
                <span v-else>⏸</span>
              </button>
              <div class="voice-wave">
                <span 
                  v-for="i in 5" 
                  :key="i" 
                  :class="['wave-bar', message.isPlaying ? 'playing' : '']"
                  :style="{ animationDelay: `${i * 0.1}s` }"
                ></span>
              </div>
              <span class="voice-duration">{{ message.duration }}"</span>
            </div>
          </template>
          <template v-else-if="message.type === 'image'">
            <img :src="message.content" class="image-message" />
          </template>
        </div>
        <div class="message-time">{{ message.time }}</div>
      </div>
    </div>

    <div v-if="callModal" class="call-modal">
      <div class="call-screen">
        <div class="call-partner-info">
          <div class="call-avatar">
            <img :src="partnerAvatar" />
          </div>
          <div class="call-name">{{ partnerName }}</div>
          <div class="call-status">{{ callType === 'video' ? '视频通话中' : '语音通话中' }}</div>
        </div>
        <div class="call-timer">{{ callDuration }}</div>
        <div class="call-actions">
          <button @click="toggleMute" :class="['call-action-btn', mute ? 'active' : '']">
            <span>{{ mute ? '🔇' : '🔊' }}</span>
          </button>
          <button @click="toggleSpeaker" :class="['call-action-btn', speaker ? 'active' : '']">
            <span>{{ speaker ? '🔈' : '🎧' }}</span>
          </button>
          <button v-if="callType === 'video'" @click="toggleVideo" :class="['call-action-btn', videoOn ? '' : 'active']">
            <span>{{ videoOn ? '📹' : '📷' }}</span>
          </button>
          <button @click="endCall" class="call-action-btn end-btn">
            <span>🔴</span>
          </button>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-actions">
        <button @click="toggleEmoji" class="input-action-btn">
          <span>😊</span>
        </button>
        <button @click="selectImage" class="input-action-btn">
          <span>📷</span>
        </button>
        <button @click="toggleVoiceRecording" class="input-action-btn">
          <span>{{ isRecording ? '⏹' : '🎤' }}</span>
        </button>
      </div>
      <div class="input-wrapper">
        <textarea 
          v-model="inputText" 
          class="message-input" 
          placeholder="输入消息..."
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="!inputText.trim() && !isRecording"
          class="send-btn"
        >
          <span>发送</span>
        </button>
      </div>
      <div v-if="isRecording" class="recording-indicator">
        <span class="recording-dot"></span>
        <span class="recording-text">正在录音... {{ recordingDuration }}"</span>
        <button @click="cancelRecording" class="cancel-btn">取消</button>
      </div>
    </div>

    <div v-if="showEmoji" class="emoji-panel">
      <div class="emoji-grid">
        <button 
          v-for="emoji in emojis" 
          :key="emoji"
          @click="addEmoji(emoji)"
          class="emoji-btn"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const partnerName = ref('小红')
const partnerAvatar = ref('https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20cartoon%20avatar%20of%20a%20young%20woman%20with%20long%20hair%20and%20gentle%20smile%20soft%20pastel%20colors&image_size=square')

const messages = ref([
  { id: 1, type: 'text', content: '亲爱的，今天想我了吗？', time: '10:00', isMine: false },
  { id: 2, type: 'text', content: '当然想啦！特别想你~', time: '10:01', isMine: true },
  { id: 3, type: 'voice', content: '', duration: 5, time: '10:02', isMine: false, isPlaying: false },
  { id: 4, type: 'text', content: '晚上一起去吃饭吧', time: '10:03', isMine: false },
  { id: 5, type: 'text', content: '好呀！想去吃什么？', time: '10:04', isMine: true },
])

const inputText = ref('')
const isRecording = ref(false)
const recordingDuration = ref(0)
const showEmoji = ref(false)
const callModal = ref(false)
const callType = ref('voice')
const callDuration = ref('00:00')
const mute = ref(false)
const speaker = ref(true)
const videoOn = ref(true)
let recordingTimer = null
let callTimer = null

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
  '😚', '😋', '😛', '😝', '🤑', '🤗', '🤭', '🤫',
  '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
  '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '😳',
  '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
  '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤤',
  '😴', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
]

const goBack = () => {
  router.push('/home')
}

const sendMessage = () => {
  if (!inputText.value.trim()) return
  messages.value.push({
    id: Date.now(),
    type: 'text',
    content: inputText.value.trim(),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isMine: true
  })
  inputText.value = ''
  scrollToBottom()
  setTimeout(() => {
    autoReply()
  }, 1000)
}

const autoReply = () => {
  const replies = [
    '好的呢~',
    '我也想你',
    '么么哒 💋',
    '晚上见！',
    '你真可爱 😍',
    '好期待呀！',
    '爱你 ❤️'
  ]
  const randomReply = replies[Math.floor(Math.random() * replies.length)]
  messages.value.push({
    id: Date.now(),
    type: 'text',
    content: randomReply,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isMine: false
  })
  scrollToBottom()
}

const toggleVoiceRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = () => {
  isRecording.value = true
  recordingDuration.value = 0
  recordingTimer = setInterval(() => {
    recordingDuration.value++
  }, 1000)
}

const stopRecording = () => {
  isRecording.value = false
  clearInterval(recordingTimer)
  if (recordingDuration.value > 0) {
    messages.value.push({
      id: Date.now(),
      type: 'voice',
      content: '',
      duration: recordingDuration.value,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      isPlaying: false
    })
    scrollToBottom()
  }
  recordingDuration.value = 0
}

const cancelRecording = () => {
  isRecording.value = false
  clearInterval(recordingTimer)
  recordingDuration.value = 0
}

const toggleVoicePlay = (message) => {
  message.isPlaying = !message.isPlaying
}

const toggleEmoji = () => {
  showEmoji.value = !showEmoji.value
}

const addEmoji = (emoji) => {
  inputText.value += emoji
}

const selectImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        messages.value.push({
          id: Date.now(),
          type: 'image',
          content: event.target.result,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          isMine: true
        })
        scrollToBottom()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const toggleVoiceCall = () => {
  callType.value = 'voice'
  startCall()
}

const toggleVideoCall = () => {
  callType.value = 'video'
  startCall()
}

const startCall = () => {
  callModal.value = true
  callDuration.value = '00:00'
  let seconds = 0
  callTimer = setInterval(() => {
    seconds++
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    callDuration.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, 1000)
}

const endCall = () => {
  callModal.value = false
  clearInterval(callTimer)
  callDuration.value = '00:00'
}

const toggleMute = () => {
  mute.value = !mute.value
}

const toggleSpeaker = () => {
  speaker.value = !speaker.value
}

const toggleVideo = () => {
  videoOn.value = !videoOn.value
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-messages')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  padding-top: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.header-left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.header-center {
  flex: 1;
  text-align: center;
}

.partner-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.partner-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.partner-status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.status-dot.online {
  background: #52c41a;
}

.status-text {
  font-size: 12px;
  color: #999;
}

.header-right {
  display: flex;
  gap: 15px;
}

.call-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.video-btn {
  background: #fff1f0;
}

.voice-btn {
  background: #f6ffed;
}

.call-btn:active {
  transform: scale(0.95);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  max-width: 80%;
}

.message-item.mine {
  align-items: flex-end;
}

.message-item.partner {
  align-items: flex-start;
}

.message-content {
  background: white;
  padding: 12px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  line-height: 1.5;
}

.message-item.mine .message-content {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  border-radius: 20px 4px 20px 20px;
}

.message-item.partner .message-content {
  border-radius: 4px 20px 20px 20px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
}

.message-item.mine .message-time {
  text-align: right;
}

.voice-message {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.voice-message .voice-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-item.partner .voice-message .voice-btn {
  background: #f0f0f0;
  color: #666;
}

.voice-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
}

.wave-bar {
  width: 4px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.message-item.partner .wave-bar {
  background: #ddd;
}

.wave-bar.playing {
  animation: wave 0.5s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}

.voice-duration {
  font-size: 12px;
}

.image-message {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  object-fit: cover;
}

.chat-input-area {
  background: white;
  padding: 15px 20px;
  padding-bottom: 35px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.input-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.input-action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.input-action-btn:active {
  transform: scale(0.95);
  background: #eee;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  height: 45px;
  border: none;
  background: #f5f5f5;
  border-radius: 25px;
  padding: 0 20px;
  font-size: 15px;
  resize: none;
}

.send-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0 25px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.send-btn:active {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.5;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 15px;
  background: #fff1f0;
  border-radius: 25px;
}

.recording-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4d4f;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.recording-text {
  flex: 1;
  font-size: 14px;
  color: #ff4d4f;
}

.cancel-btn {
  color: #ff4d4f;
  font-size: 14px;
  border: none;
  background: none;
}

.emoji-panel {
  background: white;
  padding: 15px;
  border-top: 1px solid #eee;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}

.emoji-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.emoji-btn:active {
  background: #f5f5f5;
  transform: scale(0.95);
}

.call-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.call-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
}

.call-partner-info {
  text-align: center;
  margin-bottom: 30px;
}

.call-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 20px;
}

.call-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.call-name {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
}

.call-status {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.call-timer {
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin-bottom: 40px;
}

.call-actions {
  display: flex;
  gap: 30px;
}

.call-action-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
}

.call-action-btn.active {
  opacity: 0.5;
}

.call-action-btn:not(.end-btn) {
  background: rgba(255, 255, 255, 0.2);
}

.call-action-btn.end-btn {
  background: #ff4d4f;
}

.call-action-btn:active {
  transform: scale(0.95);
}
</style>