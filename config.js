// ==========================================
// Xynera Protocol - Configuration
// ==========================================

require('dotenv').config();

module.exports = {
    // Token & IDs
    token: process.env.TOKEN,
    textChannelId: process.env.TEXT_CHANNEL_ID,
    voiceChannelId: process.env.VOICE_CHANNEL_ID,
    ownerId: process.env.OWNER_ID,

    // Auto-Typing Config
    autoTyping: {
        messages: [
            "Halo semua! 👋",
            "Apa kabar hari ini? 😊",
            "Selamat datang di server! 🎉",
            "Xynera Protocol is online! ⚡",
            "Semoga harimu menyenangkan! 🌟",
            "🚀 Selfbot aktif!",
            "💻 Automation running smoothly",
            "🎵 Voice features ready!",
            "✨ Powered by Xynera Team",
            "🤖 Selfbot v2.0.0"
        ],
        interval: parseInt(process.env.TYPING_INTERVAL) || 10,
        typingDuration: parseInt(process.env.TYPING_DURATION) || 3,
        randomDelay: process.env.RANDOM_DELAY === 'true'
    },

    // Status Rotator Config
    statusRotator: {
        statuses: [
            { type: 'Playing', name: '⚡ Xynera Protocol' },
            { type: 'Listening', name: '🎵 Lofi Girl' },
            { type: 'Watching', name: '📺 System Monitor' },
            { type: 'Competing', name: '🏆 Discord Automation' },
            { type: 'Streaming', name: '🎥 Xynera Live', url: 'https://twitch.tv/xynera' }
        ],
        interval: parseInt(process.env.STATUS_INTERVAL) || 60,
        autoStart: process.env.STATUS_AUTO_START === 'true'
    },

    // Voice Config
    voice: {
        autoConnect: false
    },

    // System
    debug: false,
    version: '2.0.0'
};