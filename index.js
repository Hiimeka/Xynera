// ==========================================
// Xynera Protocol - Selfbot Version
// Discord.js-selfbot-v13
// ==========================================

const { Client, Intents } = require('discord.js-selfbot-v13');
const chalk = require('chalk');
const figlet = require('figlet');
const gradient = require('gradient-string');
require('dotenv').config();

// ===== KONFIGURASI =====
const config = {
    token: process.env.TOKEN,
    textChannelId: process.env.TEXT_CHANNEL_ID,
    voiceChannelId: process.env.VOICE_CHANNEL_ID,
    
    // Autorisasi - Bisa pilih salah satu
    ownerId: process.env.OWNER_ID,
    roleId: process.env.ROLE_ID,
    roleIds: process.env.ROLE_IDS ? process.env.ROLE_IDS.split(',').map(id => id.trim()) : [],
    
    autoTyping: {
        messages: [
            "Halo semua! 👋",
            "Apa kabar hari ini? 😊",
            "Selamat datang di server! 🎉",
            "Xynera Protocol is online! ⚡",
            "Semoga harimu menyenangkan! 🌟",
            "🚀 Selfbot aktif!",
            "💻 Automation running smoothly",
            "🎵 Voice features ready!"
        ],
        interval: parseInt(process.env.TYPING_INTERVAL) || 10,
        typingDuration: parseInt(process.env.TYPING_DURATION) || 3,
        randomDelay: process.env.RANDOM_DELAY === 'true'
    },
    
    statusRotator: {
        statuses: [
            { type: 'PLAYING', name: '⚡ Xynera Protocol' },
            { type: 'LISTENING', name: '🎵 Lofi Girl' },
            { type: 'WATCHING', name: '📺 System Monitor' },
            { type: 'COMPETING', name: '🏆 Discord Automation' }
        ],
        interval: parseInt(process.env.STATUS_INTERVAL) || 60,
        autoStart: process.env.STATUS_AUTO_START === 'true'
    },
    
    version: '2.0.0'
};

// ===== VARIABEL GLOBAL =====
let autoTypingTask = null;
let statusRotatorTask = null;
let statusRotatorRunning = false;
let statusIndex = 0;
let voiceConnection = null;
let isConnected = false;
let isMuted = false;
let isDeafened = false;
let messageCount = 0;
let isTypingRunning = false;
let ownerInfo = null;

// ===== CLIENT SETUP =====
const client = new Client({
    intents: [
        Intents.GUILDS,
        Intents.GUILD_MESSAGES,
        Intents.MESSAGE_CONTENT,
        Intents.GUILD_VOICE_STATES,
        Intents.DIRECT_MESSAGES
    ]
});

// ===== CONSOLE LOGGER =====
class Logger {
    static timestamp() {
        return chalk.cyan(`[${new Date().toLocaleTimeString()}]`);
    }

    static info(msg) {
        console.log(`${this.timestamp()} ${chalk.white('ℹ️')} ${msg}`);
    }

    static success(msg) {
        console.log(`${this.timestamp()} ${chalk.green('✅')} ${msg}`);
    }

    static error(msg) {
        console.log(`${this.timestamp()} ${chalk.red('❌')} ${msg}`);
    }

    static warn(msg) {
        console.log(`${this.timestamp()} ${chalk.yellow('⚠️')} ${msg}`);
    }

    static voice(msg) {
        console.log(`${this.timestamp()} ${chalk.magenta('🎵')} ${msg}`);
    }

    static status(msg) {
        console.log(`${this.timestamp()} ${chalk.yellow('🔄')} ${msg}`);
    }

    static typing(msg) {
        console.log(`${this.timestamp()} ${chalk.blue('✉️')} ${msg}`);
    }

    static debug(msg) {
        if (process.env.DEBUG === 'true') {
            console.log(`${this.timestamp()} ${chalk.gray('🐛')} ${msg}`);
        }
    }

    static separator() {
        console.log(chalk.cyan('─'.repeat(60)));
    }

    static header(title) {
        console.log(`\n${chalk.magenta('═══')} ${chalk.white(title)} ${chalk.magenta('═══')}`);
    }

    static async showBanner() {
        try {
            const banner = figlet.textSync('Xynera Protocol', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            });
            console.log(gradient.pastel(banner));
            console.log(gradient.cristal('✦ Advanced Discord Automation Suite ✦'));
            console.log(chalk.cyan(`v${config.version} • By Xynera Team`));
            console.log(chalk.cyan('═'.repeat(60)));
        } catch (error) {
            console.log(chalk.magenta('⚡ Xynera Protocol ⚡'));
            console.log(chalk.cyan('Advanced Discord Automation Suite'));
        }
    }

    static async loadingAnimation(duration = 2) {
        const chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        console.log(chalk.cyan('  Initializing Xynera Protocol...'));
        for (let i = 0; i < duration * 10; i++) {
            process.stdout.write(`\r${chalk.cyan('  ' + chars[i % chars.length])} ${chalk.white('Loading...')} ${chalk.magenta('█'.repeat(i % 20) + '░'.repeat(20 - (i % 20)))}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log(`\n${chalk.green('  ✅ Initialization Complete!')}\n`);
    }
}

// ===== AUTORISASI FUNCTION =====
async function isAuthorized(message) {
    // Jika tidak ada autorisasi, izinkan semua (warning akan muncul)
    if (!config.ownerId && !config.roleId && (!config.roleIds || config.roleIds.length === 0)) {
        return true;
    }

    try {
        // Cek Owner ID
        if (config.ownerId && config.ownerId !== 'masukkan_user_id_owner') {
            if (message.author.id === config.ownerId) {
                return true;
            }
        }

        // Cek Role ID (Single)
        if (config.roleId && config.roleId !== 'masukkan_role_id') {
            try {
                const member = await message.guild?.members.fetch(message.author.id);
                if (member && member.roles.cache.has(config.roleId)) {
                    return true;
                }
            } catch (error) {
                // Member tidak ditemukan di guild
            }
        }

        // Cek Multiple Role IDs
        if (config.roleIds && config.roleIds.length > 0) {
            try {
                const member = await message.guild?.members.fetch(message.author.id);
                if (member) {
                    const hasRole = config.roleIds.some(roleId => 
                        roleId && roleId !== 'masukkan_role_id' && member.roles.cache.has(roleId)
                    );
                    if (hasRole) {
                        return true;
                    }
                }
            } catch (error) {
                // Member tidak ditemukan di guild
            }
        }

        return false;
    } catch (error) {
        Logger.debug(`Authorisasi error: ${error.message}`);
        return false;
    }
}

// ===== AUTO-TYPING FUNCTION =====
async function startAutoTyping() {
    if (isTypingRunning) {
        Logger.warn('Auto-typing already running!');
        return false;
    }

    const channel = client.channels.cache.get(config.textChannelId);
    if (!channel) {
        Logger.error(`Text channel ${config.textChannelId} not found!`);
        return false;
    }

    Logger.typing('Auto-typing thread started');
    isTypingRunning = true;

    async function sendMessage() {
        try {
            const messages = config.autoTyping.messages;
            const message = messages[Math.floor(Math.random() * messages.length)];

            // Efek typing
            await channel.sendTyping();
            const typingDuration = Math.max(
                config.autoTyping.typingDuration,
                message.length * 0.05
            );
            await new Promise(resolve => setTimeout(resolve, typingDuration * 1000));

            // Kirim pesan
            await channel.send(message);
            messageCount++;
            Logger.typing(`Sent: ${chalk.white(message.substring(0, 30) + (message.length > 30 ? '...' : ''))} (#${messageCount})`);

            // Hitung interval
            let interval = config.autoTyping.interval;
            if (config.autoTyping.randomDelay) {
                const variation = (Math.random() - 0.5) * 0.6;
                interval = interval * (1 + variation);
                interval = Math.max(1, interval);
            }

            autoTypingTask = setTimeout(sendMessage, interval * 1000);

        } catch (error) {
            if (error.code === 429) {
                Logger.warn(`Rate limited! Retry after ${error.retryAfter}s`);
                autoTypingTask = setTimeout(sendMessage, (error.retryAfter || 10) * 1000);
            } else {
                Logger.error(`Auto-typing error: ${error.message}`);
                autoTypingTask = setTimeout(sendMessage, 10000);
            }
        }
    }

    sendMessage();
    return true;
}

function stopAutoTyping() {
    if (autoTypingTask) {
        clearTimeout(autoTypingTask);
        autoTypingTask = null;
        isTypingRunning = false;
        Logger.typing('Auto-typing stopped');
        return true;
    }
    Logger.warn('Auto-typing is not running');
    return false;
}

// ===== STATUS ROTATOR =====
async function startStatusRotator() {
    if (statusRotatorRunning) {
        Logger.warn('Status rotator already running!');
        return false;
    }

    if (!config.statusRotator.statuses.length) {
        Logger.error('No statuses configured!');
        return false;
    }

    Logger.status('Status rotator thread started');
    statusRotatorRunning = true;

    async function rotateStatus() {
        try {
            const statuses = config.statusRotator.statuses;
            const status = statuses[statusIndex % statuses.length];
            
            // Mapping type
            const typeMap = {
                'PLAYING': 0,
                'STREAMING': 1,
                'LISTENING': 2,
                'WATCHING': 3,
                'COMPETING': 5
            };

            const activity = {
                name: status.name,
                type: typeMap[status.type] || 0
            };

            if (status.type === 'STREAMING' && status.url) {
                activity.url = status.url;
            }

            await client.user.setPresence({
                activities: [activity],
                status: 'online'
            });

            Logger.status(`Rotated: ${status.type} ${chalk.white(status.name)} (#${statusIndex + 1})`);
            statusIndex++;

            if (statusRotatorRunning) {
                statusRotatorTask = setTimeout(rotateStatus, config.statusRotator.interval * 1000);
            }

        } catch (error) {
            Logger.error(`Status rotator error: ${error.message}`);
            if (statusRotatorRunning) {
                statusRotatorTask = setTimeout(rotateStatus, 10000);
            }
        }
    }

    rotateStatus();
    return true;
}

function stopStatusRotator() {
    if (statusRotatorTask) {
        clearTimeout(statusRotatorTask);
        statusRotatorTask = null;
        statusRotatorRunning = false;
        Logger.status('Status rotator stopped');
        return true;
    }
    Logger.warn('Status rotator is not running');
    return false;
}

// ===== VOICE FUNCTIONS =====
async function connectVoice(voiceChannelId) {
    try {
        const voiceChannel = client.channels.cache.get(voiceChannelId);
        if (!voiceChannel) {
            Logger.error(`Voice channel ${voiceChannelId} not found!`);
            return false;
        }

        if (voiceConnection) {
            Logger.warn('Already connected to voice');
            return true;
        }

        Logger.voice(`Connecting to ${voiceChannel.name}...`);
        voiceConnection = await voiceChannel.join();
        isConnected = true;
        Logger.voice(`Connected to ${voiceChannel.name} ✅`);
        return true;
    } catch (error) {
        Logger.error(`Voice connect failed: ${error.message}`);
        return false;
    }
}

async function disconnectVoice() {
    try {
        if (voiceConnection) {
            Logger.voice('Disconnecting from voice...');
            await voiceConnection.disconnect();
            voiceConnection = null;
            isConnected = false;
            isMuted = false;
            isDeafened = false;
            Logger.voice('Disconnected from voice ✅');
            return true;
        }
        Logger.warn('Not connected to voice');
        return false;
    } catch (error) {
        Logger.error(`Voice disconnect failed: ${error.message}`);
        return false;
    }
}

async function setVoiceState(mute = null, deafen = null) {
    try {
        if (!voiceConnection) {
            Logger.error('Not connected to voice');
            return false;
        }

        if (mute === null) mute = !isMuted;
        if (deafen === null) deafen = !isDeafened;

        await voiceConnection.guild.me.voice.setMute(mute);
        await voiceConnection.guild.me.voice.setDeafen(deafen);

        isMuted = mute;
        isDeafened = deafen;

        Logger.voice(`Voice state updated: ${mute ? 'MUTED' : 'UNMUTED'}, ${deafen ? 'DEAFENED' : 'UNDEAFENED'}`);
        return true;
    } catch (error) {
        Logger.error(`Voice state update failed: ${error.message}`);
        return false;
    }
}

// ===== COMMAND HANDLER =====
client.on('messageCreate', async (message) => {
    // Ignore pesan sendiri
    if (message.author.id === client.user.id) return;
    
    // Cek autorisasi
    const authorized = await isAuthorized(message);
    if (!authorized) return;
    
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        switch (command) {
            // ===== AUTO-TYPING COMMANDS =====
            case 'start':
            case 'typing': {
                const success = await startAutoTyping();
                await message.reply(success ? '✅ Auto-typing started!' : '❌ Failed to start auto-typing');
                break;
            }

            case 'stop': {
                const success = stopAutoTyping();
                await message.reply(success ? '⏹️ Auto-typing stopped' : '⚠️ Auto-typing is not running');
                break;
            }

            case 'interval': {
                const seconds = parseInt(args[0]);
                if (!seconds || seconds < 1) {
                    await message.reply('⚠️ Please provide a valid interval (seconds)');
                    return;
                }
                config.autoTyping.interval = seconds;
                if (isTypingRunning) {
                    stopAutoTyping();
                    await startAutoTyping();
                }
                await message.reply(`⏱️ Interval changed to ${seconds}s`);
                break;
            }

            case 'addmsg': {
                const msg = args.join(' ');
                if (!msg) {
                    await message.reply('⚠️ Please provide a message');
                    return;
                }
                config.autoTyping.messages.push(msg);
                await message.reply(`✅ Message added: ${msg}`);
                break;
            }

            case 'listmsg': {
                const msgs = config.autoTyping.messages.map((m, i) => `${i + 1}. ${m}`).join('\n');
                await message.reply(`**📋 Message List:**\n${msgs}`);
                break;
            }

            case 'delmsg': {
                const index = parseInt(args[0]);
                if (!index || index < 1 || index > config.autoTyping.messages.length) {
                    await message.reply('⚠️ Invalid index');
                    return;
                }
                const removed = config.autoTyping.messages.splice(index - 1, 1);
                await message.reply(`🗑️ Message removed: ${removed[0]}`);
                break;
            }

            // ===== STATUS ROTATOR COMMANDS =====
            case 'statusstart': {
                const success = await startStatusRotator();
                await message.reply(success ? '🔄 Status rotator started!' : '❌ Failed to start status rotator');
                break;
            }

            case 'statusstop': {
                const success = stopStatusRotator();
                await message.reply(success ? '⏹️ Status rotator stopped' : '⚠️ Status rotator is not running');
                break;
            }

            case 'setstatus': {
                const type = args[0]?.toUpperCase();
                const name = args.slice(1).join(' ');
                if (!type || !name) {
                    await message.reply('⚠️ Usage: !setstatus <type> <name>\nTypes: PLAYING, LISTENING, WATCHING, COMPETING, STREAMING');
                    return;
                }
                const validTypes = ['PLAYING', 'LISTENING', 'WATCHING', 'COMPETING', 'STREAMING'];
                if (!validTypes.includes(type)) {
                    await message.reply(`⚠️ Type must be one of: ${validTypes.join(', ')}`);
                    return;
                }
                if (statusRotatorRunning) stopStatusRotator();
                
                const typeMap = {
                    'PLAYING': 0,
                    'STREAMING': 1,
                    'LISTENING': 2,
                    'WATCHING': 3,
                    'COMPETING': 5
                };

                await client.user.setPresence({
                    activities: [{
                        name: name,
                        type: typeMap[type] || 0
                    }],
                    status: 'online'
                });
                await message.reply(`✅ Status changed: ${type} ${name}`);
                break;
            }

            case 'statusadd': {
                const type = args[0]?.toUpperCase();
                const name = args.slice(1).join(' ');
                if (!type || !name) {
                    await message.reply('⚠️ Usage: !statusadd <type> <name>');
                    return;
                }
                const validTypes = ['PLAYING', 'LISTENING', 'WATCHING', 'COMPETING', 'STREAMING'];
                if (!validTypes.includes(type)) {
                    await message.reply(`⚠️ Type must be one of: ${validTypes.join(', ')}`);
                    return;
                }
                config.statusRotator.statuses.push({ type, name });
                await message.reply(`✅ Status added: ${type} ${name}`);
                break;
            }

            case 'statuslist': {
                const list = config.statusRotator.statuses.map((s, i) => `${i + 1}. ${s.type} ${s.name}`).join('\n');
                await message.reply(`**📋 Status List:**\n${list}`);
                break;
            }

            case 'statusremove': {
                const index = parseInt(args[0]);
                if (!index || index < 1 || index > config.statusRotator.statuses.length) {
                    await message.reply('⚠️ Invalid index');
                    return;
                }
                const removed = config.statusRotator.statuses.splice(index - 1, 1);
                await message.reply(`🗑️ Status removed: ${removed[0].type} ${removed[0].name}`);
                break;
            }

            case 'statusinterval': {
                const seconds = parseInt(args[0]);
                if (!seconds || seconds < 5) {
                    await message.reply('⚠️ Minimum interval is 5 seconds');
                    return;
                }
                config.statusRotator.interval = seconds;
                if (statusRotatorRunning) {
                    stopStatusRotator();
                    await startStatusRotator();
                }
                await message.reply(`⏱️ Status interval changed to ${seconds}s`);
                break;
            }

            // ===== VOICE COMMANDS =====
            case 'connect':
            case 'join': {
                const channelId = args[0] || config.voiceChannelId;
                const success = await connectVoice(channelId);
                await message.reply(success ? `🔊 Connected to voice channel <#${channelId}>` : '❌ Failed to connect');
                break;
            }

            case 'disconnect':
            case 'leave': {
                const success = await disconnectVoice();
                await message.reply(success ? '🔇 Disconnected from voice channel' : '❌ Failed to disconnect');
                break;
            }

            case 'mute': {
                const success = await setVoiceState(true, null);
                await message.reply(success ? '🔇 Mic muted' : '❌ Failed to mute');
                break;
            }

            case 'unmute': {
                const success = await setVoiceState(false, null);
                await message.reply(success ? '🔊 Mic unmuted' : '❌ Failed to unmute');
                break;
            }

            case 'deafen': {
                const success = await setVoiceState(null, true);
                await message.reply(success ? '🔇 Deafen activated' : '❌ Failed to deafen');
                break;
            }

            case 'undeafen': {
                const success = await setVoiceState(null, false);
                await message.reply(success ? '🔊 Undeafen activated' : '❌ Failed to undeafen');
                break;
            }

            case 'toggle': {
                const success = await setVoiceState(!isMuted, null);
                await message.reply(success ? `✅ ${isMuted ? '🔇 Muted' : '🔊 Unmuted'}` : '❌ Failed to toggle');
                break;
            }

            case 'voicestate': {
                const statusMsg = `🎵 **Voice State**
━━━━━━━━━━━━━━━━━━
📌 **Status:** ${isConnected ? '🟢 Connected' : '🔴 Disconnected'}
🔇 **Mute:** ${isMuted ? 'Yes' : 'No'}
🔊 **Deafen:** ${isDeafened ? 'Yes' : 'No'}
━━━━━━━━━━━━━━━━━━`;
                await message.reply(statusMsg);
                break;
            }

            case 'vcmove': {
                const channelId = args[0];
                if (!channelId) {
                    await message.reply('⚠️ Please provide a voice channel ID');
                    return;
                }
                if (!voiceConnection) {
                    await message.reply('❌ Not connected to voice');
                    return;
                }
                const channel = client.channels.cache.get(channelId);
                if (!channel) {
                    await message.reply('❌ Channel not found');
                    return;
                }
                await voiceConnection.guild.me.voice.setChannel(channel);
                await message.reply(`🔄 Moved to ${channel.name}`);
                break;
            }

            case 'vcping': {
                if (!voiceConnection) {
                    await message.reply('❌ Not connected to voice');
                    return;
                }
                const ping = Math.round(voiceConnection.ping);
                await message.reply(`📶 Voice latency: ${ping}ms`);
                break;
            }

            // ===== UTILITY COMMANDS =====
            case 'help':
            case 'h': {
                const helpMsg = `📚 **Xynera Protocol - Command List**
━━━━━━━━━━━━━━━━━━

✉️ **Auto-Typing Commands**
\`!start\`, \`!stop\`, \`!interval <detik>\`
\`!addmsg <pesan>\`, \`!listmsg\`, \`!delmsg <nomor>\`

🔄 **Status Commands**
\`!statusstart\`, \`!statusstop\`
\`!setstatus <type> <name>\`
\`!statusadd <type> <name>\`
\`!statuslist\`, \`!statusremove <nomor>\`
\`!statusinterval <detik>\`

🎵 **Voice Commands**
\`!connect [id]\`, \`!disconnect\`
\`!mute\`, \`!unmute\`, \`!deafen\`, \`!undeafen\`
\`!toggle\`, \`!voicestate\`, \`!vcmove <id>\`, \`!vcping\`

📊 **Utility Commands**
\`!info\`, \`!ping\`

━━━━━━━━━━━━━━━━━━
⚡ Type \`!info\` for system status`;
                await message.reply(helpMsg);
                break;
            }

            case 'ping': {
                const ping = Math.round(client.ws.ping);
                const status = ping < 50 ? '🟢 Excellent' : ping < 150 ? '🟡 Good' : '🔴 Poor';
                await message.reply(`🏓 **Pong!**
━━━━━━━━━━━━━━━━━━
📶 **Latency:** ${ping}ms
📊 **Status:** ${status}`);
                break;
            }

            case 'info': {
                const infoMsg = `📊 **Xynera Protocol - System Status**
━━━━━━━━━━━━━━━━━━

🖥️ **System**
User: ${client.user.tag}
ID: ${client.user.id}
Servers: ${client.guilds.cache.size}

🎵 **Voice**
Status: ${isConnected ? '🟢 Connected' : '🔴 Disconnected'}
Mute: ${isMuted ? '🔇' : '🔊'}
Deafen: ${isDeafened ? '🔇' : '🔊'}

✉️ **Auto-Typing**
Status: ${isTypingRunning ? '🟢 Active' : '🔴 Inactive'}
Interval: ${config.autoTyping.interval}s
Messages: ${config.autoTyping.messages.length}

🔄 **Status Rotator**
Status: ${statusRotatorRunning ? '🟢 Active' : '🔴 Inactive'}
Interval: ${config.statusRotator.interval}s
Total: ${config.statusRotator.statuses.length}

⚡ **Performance**
Latency: ${Math.round(client.ws.ping)}ms
━━━━━━━━━━━━━━━━━━
⚠️ For educational purposes only`;
                await message.reply(infoMsg);
                break;
            }

            default: {
                break;
            }
        }
    } catch (error) {
        Logger.error(`Command error: ${error.message}`);
        await message.reply(`❌ Error: ${error.message}`);
    }
});

// ===== CLIENT EVENTS =====
client.once('ready', async () => {
    Logger.separator();
    await Logger.showBanner();
    Logger.separator();

    // System Info
    Logger.header('SYSTEM INFORMATION');
    Logger.info(`Bot Name: ${chalk.green(client.user.tag)}`);
    Logger.info(`Bot ID: ${chalk.cyan(client.user.id)}`);
    Logger.info(`Account Created: ${chalk.yellow(client.user.createdAt.toLocaleString())}`);

    // Guild Info
    const guilds = client.guilds.cache;
    Logger.info(`Total Servers: ${chalk.cyan(guilds.size)}`);
    if (guilds.size > 0) {
        let index = 0;
        guilds.forEach((guild) => {
            if (index < 5) {
                Logger.info(`  ├─ Server ${index + 1}: ${chalk.white(guild.name)} (${chalk.cyan(guild.id)})`);
            }
            index++;
        });
        if (guilds.size > 5) {
            Logger.info(`  └─ ... dan ${chalk.yellow(guilds.size - 5)} server lainnya`);
        }
    }

    // Channel Info
    Logger.header('CHANNEL CONFIGURATION');
    const textChannel = client.channels.cache.get(config.textChannelId);
    const voiceChannel = client.channels.cache.get(config.voiceChannelId);
    Logger.info(`Text Channel: ${chalk.green(textChannel?.name || '❌ NOT FOUND')} (ID: ${config.textChannelId})`);
    Logger.info(`Voice Channel: ${chalk.green(voiceChannel?.name || '❌ NOT FOUND')} (ID: ${config.voiceChannelId})`);

    // Autorisasi Info
    Logger.header('AUTHORIZATION CONFIGURATION');
    
    let hasAuth = false;
    
    // Cek Owner ID
    if (config.ownerId && config.ownerId !== 'masukkan_user_id_owner') {
        try {
            const owner = await client.users.fetch(config.ownerId);
            Logger.success(`✅ Owner ID: ${chalk.green(owner.tag)} (${chalk.cyan(owner.id)})`);
            hasAuth = true;
        } catch {
            Logger.warn(`⚠️ Owner ID ${chalk.yellow(config.ownerId)} tidak ditemukan`);
        }
    }

    // Cek Role ID
    if (config.roleId && config.roleId !== 'masukkan_role_id') {
        Logger.success(`✅ Role ID: ${chalk.cyan(config.roleId)}`);
        Logger.info(`  └─ Siapapun dengan role ini bisa menggunakan commands`);
        hasAuth = true;
    }

    // Cek Multiple Role IDs
    if (config.roleIds && config.roleIds.length > 0) {
        const validRoles = config.roleIds.filter(id => id && id !== 'masukkan_role_id');
        if (validRoles.length > 0) {
            Logger.success(`✅ Multiple Role IDs: ${chalk.cyan(validRoles.length)} roles`);
            validRoles.forEach((roleId, i) => {
                Logger.info(`  ├─ Role ${i + 1}: ${chalk.cyan(roleId)}`);
            });
            hasAuth = true;
        }
    }

    if (!hasAuth) {
        Logger.warn('⚠️ TIDAK ADA AUTORISASI!');
        Logger.warn('Semua orang bisa menggunakan commands!');
        Logger.info('Untuk mengatur autorisasi, isi OWNER_ID atau ROLE_ID di .env');
    }

    // Feature Status
    Logger.header('FEATURE STATUS');

    // Auto-Typing
    Logger.success(`Auto-Typing: ${chalk.green('ENABLED')} | Interval: ${config.autoTyping.interval}s`);
    Logger.info(`  ├─ Messages: ${chalk.cyan(config.autoTyping.messages.length)} messages`);
    Logger.info(`  └─ Random Delay: ${chalk.green(config.autoTyping.randomDelay ? 'ON' : 'OFF')}`);

    // Status Rotator
    const statusText = config.statusRotator.autoStart ? chalk.green('AUTO-START') : chalk.yellow('MANUAL');
    Logger.success(`Status Rotator: ${statusText} | Interval: ${config.statusRotator.interval}s`);
    Logger.info(`  └─ Status List: ${chalk.cyan(config.statusRotator.statuses.length)} statuses`);

    // Voice Features
    Logger.success(`Voice Features: ${chalk.green('ENABLED')}`);
    Logger.info(`  ├─ Auto-Connect: ${chalk.yellow('DISABLED')} (manual via !connect)`);
    Logger.info(`  ├─ Mute/Deafen: ${chalk.green('AVAILABLE')}`);
    Logger.info(`  └─ Voice State: ${chalk.yellow('DISCONNECTED')}`);

    Logger.separator();
    Logger.header('🚀 SYSTEM READY');

    // Loading animation
    for (let i = 0; i <= 10; i++) {
        const bar = '█'.repeat(i) + '░'.repeat(10 - i);
        process.stdout.write(`\r${chalk.green(`  [${bar}]`)} ${chalk.cyan(`${i * 10}%`)}`);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log(`\n${chalk.green('  ✅ Xynera Protocol is now ONLINE!')}\n`);
    Logger.separator();

    console.log(chalk.magenta('╔══════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.magenta('║  ') + chalk.white('💡 Type ') + chalk.cyan('!help') + chalk.white(' in Discord for command list  ') + chalk.magenta('║'));
    console.log(chalk.magenta('║  ') + chalk.white('📊 Type ') + chalk.cyan('!info') + chalk.white(' to see system status            ') + chalk.magenta('║'));
    console.log(chalk.magenta('╚══════════════════════════════════════════════════════════════════╝'));
    Logger.separator();

    // Auto-start features
    if (config.statusRotator.autoStart) {
        Logger.status('Status rotator auto-starting...');
        await startStatusRotator();
    }

    Logger.typing('Auto-typing ready (use !start to begin)');
    Logger.success('All systems operational!');
    Logger.separator();
});

// ===== ERROR HANDLING =====
client.on('error', (error) => {
    Logger.error(`Client error: ${error.message}`);
});

process.on('unhandledRejection', (error) => {
    Logger.error(`Unhandled rejection: ${error.message}`);
});

process.on('SIGINT', async () => {
    Logger.warn('\nShutting down Xynera Protocol...');
    if (voiceConnection) {
        await disconnectVoice();
    }
    if (autoTypingTask) clearTimeout(autoTypingTask);
    if (statusRotatorTask) clearTimeout(statusRotatorTask);
    process.exit(0);
});

// ===== START =====
async function main() {
    try {
        await Logger.loadingAnimation(2);
        Logger.info('Connecting to Discord...');
        
        if (!config.token || config.token === 'masukkan_token_anda_disini') {
            Logger.error('❌ Token tidak ditemukan!');
            Logger.error('Pastikan TOKEN diisi di file .env');
            process.exit(1);
        }
        
        Logger.info(`Token length: ${chalk.cyan(config.token.length)} characters`);
        await client.login(config.token);
    } catch (error) {
        if (error.message?.includes('token') || error.message?.includes('auth')) {
            Logger.error('❌ Token tidak valid!');
            Logger.error('Pastikan token benar dan masih aktif');
        } else {
            Logger.error(`❌ Failed to start: ${error.message}`);
        }
        process.exit(1);
    }
}

main();