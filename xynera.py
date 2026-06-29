import discord
from discord.ext import commands
import asyncio
import random
import sys
import time
from datetime import datetime

# Import config
from config import *

# ===== COLORAMA SETUP =====
try:
    from colorama import init, Fore, Style, Back
    init(autoreset=True)
    COLORS = True
except ImportError:
    COLORS = False
    # Fallback jika colorama tidak ada
    class Fore:
        RED = '\033[91m'
        GREEN = '\033[92m'
        YELLOW = '\033[93m'
        BLUE = '\033[94m'
        MAGENTA = '\033[95m'
        CYAN = '\033[96m'
        WHITE = '\033[97m'
        RESET = '\033[0m'
    class Style:
        RESET_ALL = '\033[0m'
    class Back:
        pass

# ===== ASCII ART =====
ASCII_BANNER = f"""
{Fore.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
{Fore.CYAN}║                                                                              ║
{Fore.MAGENTA}║    ██╗  ██╗██╗   ██╗███╗   ██╗███████╗██████╗  █████╗     ██████╗ ██████╗  ║
{Fore.MAGENTA}║    ╚██╗██╔╝╚██╗ ██╔╝████╗  ██║██╔════╝██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗ ║
{Fore.MAGENTA}║     ╚███╔╝  ╚████╔╝ ██╔██╗ ██║█████╗  ██████╔╝███████║    ██████╔╝██████╔╝ ║
{Fore.MAGENTA}║     ██╔██╗   ╚██╔╝  ██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║    ██╔═══╝ ██╔══██╗ ║
{Fore.MAGENTA}║    ██╔╝ ██╗   ██║   ██║ ╚████║███████╗██║  ██║██║  ██║    ██║     ██║  ██║ ║
{Fore.MAGENTA}║    ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ║
{Fore.CYAN}║                                                                              ║
{Fore.CYAN}╚══════════════════════════════════════════════════════════════════════════════╝
{Fore.YELLOW}╔══════════════════════════════════════════════════════════════════════════════╗
{Fore.YELLOW}║                    {Fore.WHITE}✦ {Fore.RED}Xynera {Fore.MAGENTA}Protocol {Fore.WHITE}✦                    ║
{Fore.YELLOW}║                  {Fore.CYAN}Advanced Discord Automation Suite                  ║
{Fore.YELLOW}║                       {Fore.GREEN}v{Fore.WHITE}2.0.0 {Fore.BLUE}• {Fore.WHITE}By {Fore.RED}Xynera{Fore.WHITE} Team                       ║
{Fore.YELLOW}╚══════════════════════════════════════════════════════════════════════════════╝
{Fore.RESET}"""

# ===== LOGGER CLASS =====
class ConsoleLogger:
    """Custom logger dengan warna"""
    
    @staticmethod
    def _timestamp():
        return f"{Fore.CYAN}[{time.strftime('%H:%M:%S')}]{Fore.RESET}"
    
    @staticmethod
    def info(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.WHITE}ℹ️  {msg}{Fore.RESET}")
    
    @staticmethod
    def success(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.GREEN}✅ {msg}{Fore.RESET}")
    
    @staticmethod
    def error(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.RED}❌ {msg}{Fore.RESET}")
    
    @staticmethod
    def warning(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.YELLOW}⚠️  {msg}{Fore.RESET}")
    
    @staticmethod
    def debug(msg):
        if DEBUG_MODE:
            print(f"{ConsoleLogger._timestamp()} {Fore.BLUE}🐛 {msg}{Fore.RESET}")
    
    @staticmethod
    def voice(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.MAGENTA}🎵 {msg}{Fore.RESET}")
    
    @staticmethod
    def status(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.YELLOW}🔄 {msg}{Fore.RESET}")
    
    @staticmethod
    def typing(msg):
        print(f"{ConsoleLogger._timestamp()} {Fore.BLUE}✉️  {msg}{Fore.RESET}")
    
    @staticmethod
    def separator():
        print(f"{Fore.CYAN}─" * 60 + f"{Fore.RESET}")
    
    @staticmethod
    def header(title):
        print(f"\n{Fore.MAGENTA}═══ {Fore.WHITE}{title} {Fore.MAGENTA}═══{Fore.RESET}")
    
    @staticmethod
    def ascii_banner():
        print(ASCII_BANNER)
    
    @staticmethod
    def loading_animation(duration=2):
        """Animasi loading keren"""
        chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        print(f"{Fore.CYAN}  Initializing Xynera Protocol...{Fore.RESET}")
        for i in range(duration * 10):
            sys.stdout.write(f"\r{Fore.CYAN}  {chars[i % len(chars)]} {Fore.WHITE}Loading... {Fore.MAGENTA}{'█' * (i % 20)}{'░' * (20 - i % 20)}{Fore.RESET}")
            sys.stdout.flush()
            time.sleep(0.1)
        print(f"\n{Fore.GREEN}  ✅ Initialization Complete!{Fore.RESET}\n")

# Inisialisasi logger
log = ConsoleLogger()

# ===== INISIALISASI BOT =====
# Gunakan intents yang diperlukan untuk selfbot
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.voice_states = True

# Buat bot dengan self_bot=True
bot = commands.Bot(
    command_prefix='!', 
    self_bot=True, 
    intents=intents,
    help_command=None  # Matikan help bawaan
)

# ===== EVENT HANDLERS =====

@bot.event
async def on_ready():
    """Event saat bot siap"""
    log.separator()
    log.ascii_banner()
    log.separator()
    
    # System Info
    log.header("SYSTEM INFORMATION")
    log.info(f"Bot Name: {Fore.GREEN}{bot.user.name}{Fore.RESET}")
    log.info(f"Bot ID: {Fore.CYAN}{bot.user.id}{Fore.RESET}")
    log.info(f"Account Created: {Fore.YELLOW}{bot.user.created_at.strftime('%Y-%m-%d %H:%M:%S')}{Fore.RESET}")
    
    # Guild Info
    guilds = bot.guilds
    log.info(f"Total Servers: {Fore.CYAN}{len(guilds)}{Fore.RESET}")
    if guilds:
        for i, guild in enumerate(guilds[:5], 1):
            log.info(f"  ├─ Server {i}: {Fore.WHITE}{guild.name}{Fore.RESET} ({Fore.CYAN}{guild.id}{Fore.RESET})")
        if len(guilds) > 5:
            log.info(f"  └─ ... dan {Fore.YELLOW}{len(guilds) - 5}{Fore.RESET} server lainnya")
    
    # Channel Info
    log.header("CHANNEL CONFIGURATION")
    text_ch = bot.get_channel(CHANNEL_ID)
    voice_ch = bot.get_channel(VOICE_CHANNEL_ID)
    
    log.info(f"Text Channel: {Fore.GREEN}{text_ch.name if text_ch else '❌ NOT FOUND'}{Fore.RESET} (ID: {CHANNEL_ID})")
    log.info(f"Voice Channel: {Fore.GREEN}{voice_ch.name if voice_ch else '❌ NOT FOUND'}{Fore.RESET} (ID: {VOICE_CHANNEL_ID})")
    
    # Feature Status
    log.header("FEATURE STATUS")
    
    # Auto-Typing
    log.success(f"Auto-Typing: {Fore.GREEN}ENABLED{Fore.RESET} | Interval: {INTERVAL_DETIK}s")
    log.info(f"  ├─ Messages: {Fore.CYAN}{len(PESAN)}{Fore.RESET} messages")
    log.info(f"  └─ Random Delay: {Fore.GREEN}{'ON' if RANDOM_DELAY else 'OFF'}{Fore.RESET}")
    
    # Status Rotator
    status_text = f"{Fore.GREEN}AUTO-START{Fore.RESET}" if STATUS_ROTATOR_AUTO_START else f"{Fore.YELLOW}MANUAL{Fore.RESET}"
    log.success(f"Status Rotator: {status_text} | Interval: {STATUS_INTERVAL}s")
    log.info(f"  └─ Status List: {Fore.CYAN}{len(statuses)}{Fore.RESET} statuses")
    
    # Voice Features
    log.success(f"Voice Features: {Fore.GREEN}ENABLED{Fore.RESET}")
    log.info(f"  ├─ Auto-Connect: {Fore.YELLOW}DISABLED{Fore.RESET} (manual via !connect)")
    log.info(f"  ├─ Mute/Deafen: {Fore.GREEN}AVAILABLE{Fore.RESET}")
    log.info(f"  └─ Voice State: {Fore.YELLOW}DISCONNECTED{Fore.RESET}")
    
    log.separator()
    log.header("🚀 SYSTEM READY")
    
    # Loading bar efek
    for i in range(10):
        bar = '█' * i + '░' * (10 - i)
        sys.stdout.write(f"\r{Fore.GREEN}  [{bar}] {Fore.CYAN}{i * 10}%{Fore.RESET}")
        sys.stdout.flush()
        await asyncio.sleep(0.05)
    print(f"\n{Fore.GREEN}  ✅ Xynera Protocol is now ONLINE!{Fore.RESET}\n")
    log.separator()
    
    # Start tasks
    if STATUS_ROTATOR_AUTO_START:
        log.status("Status rotator auto-starting...")
        bot.loop.create_task(status_rotator())
    
    log.typing("Auto-typing starting...")
    bot.loop.create_task(auto_typing())
    
    log.success("All systems operational!")
    log.separator()
    print(f"{Fore.MAGENTA}╔══════════════════════════════════════════════════════════════════╗")
    print(f"{Fore.MAGENTA}║  {Fore.WHITE}💡 Type {Fore.CYAN}!help{Fore.WHITE} in Discord for command list  {Fore.MAGENTA}║")
    print(f"{Fore.MAGENTA}║  {Fore.WHITE}📊 Type {Fore.CYAN}!info{Fore.WHITE} to see system status            {Fore.MAGENTA}║")
    print(f"{Fore.MAGENTA}╚══════════════════════════════════════════════════════════════════╝{Fore.RESET}")
    log.separator()

# ===== AUTO-TYPING =====

async def auto_typing():
    """Auto-typing dengan efek mengetik"""
    global auto_task
    await bot.wait_until_ready()
    log.typing("Auto-typing thread started")
    
    message_count = 0
    while True:
        try:
            channel = bot.get_channel(CHANNEL_ID)
            if not channel:
                log.error(f"Channel {CHANNEL_ID} not found!")
                await asyncio.sleep(10)
                continue
            
            pesan = random.choice(PESAN)
            
            # Efek typing
            async with channel.typing():
                durasi_typing = max(TYPING_DURATION, len(pesan) * 0.05)
                await asyncio.sleep(durasi_typing)
            
            # Kirim pesan
            await channel.send(pesan)
            message_count += 1
            log.typing(f"Sent: {Fore.WHITE}{pesan[:30]}{'...' if len(pesan) > 30 else ''}{Fore.RESET} (#{message_count})")
            
            # Hitung interval
            interval = INTERVAL_DETIK
            if RANDOM_DELAY:
                variasi = random.uniform(-0.3, 0.3)
                interval = INTERVAL_DETIK * (1 + variasi)
                interval = max(1, interval)
            
            await asyncio.sleep(interval)
            
        except discord.HTTPException as e:
            if e.status == 429:  # Rate limit
                retry_after = e.retry_after if hasattr(e, 'retry_after') else 10
                log.warning(f"Rate limited! Waiting {retry_after:.1f}s")
                await asyncio.sleep(retry_after)
            else:
                log.error(f"HTTP Error: {e}")
                await asyncio.sleep(5)
        except Exception as e:
            log.error(f"Auto-typing error: {e}")
            await asyncio.sleep(5)

# ===== VOICE FUNCTIONS =====

async def connect_voice(voice_channel_id):
    """Connect ke voice channel"""
    global voice_client, is_connected
    
    try:
        voice_channel = bot.get_channel(voice_channel_id)
        if not voice_channel:
            log.error(f"Voice channel {voice_channel_id} not found!")
            return False
        
        if voice_client and voice_client.is_connected():
            log.warning("Already connected to voice")
            return True
        
        log.voice(f"Connecting to {voice_channel.name}...")
        voice_client = await voice_channel.connect()
        is_connected = True
        log.voice(f"Connected to {voice_channel.name} ✅")
        return True
        
    except Exception as e:
        log.error(f"Voice connect failed: {e}")
        return False

async def disconnect_voice():
    """Disconnect dari voice channel"""
    global voice_client, is_connected, is_muted, is_deafened
    
    try:
        if voice_client and voice_client.is_connected():
            log.voice("Disconnecting from voice...")
            await voice_client.disconnect()
            voice_client = None
            is_connected = False
            is_muted = False
            is_deafened = False
            log.voice("Disconnected from voice ✅")
            return True
        else:
            log.warning("Not connected to voice")
            return False
    except Exception as e:
        log.error(f"Voice disconnect failed: {e}")
        return False

async def set_voice_state(mute: bool = None, deafen: bool = None):
    """Set voice state (mute/deafen)"""
    global voice_client, is_muted, is_deafened
    
    try:
        if not voice_client or not voice_client.is_connected():
            log.error("Not connected to voice")
            return False
        
        if mute is None:
            mute = not is_muted
        if deafen is None:
            deafen = not is_deafened
        
        await voice_client.guild.change_voice_state(
            channel=voice_client.channel,
            self_mute=mute,
            self_deafen=deafen
        )
        
        is_muted = mute
        is_deafened = deafen
        
        status_mute = "MUTED" if mute else "UNMUTED"
        status_deaf = "DEAFENED" if deafen else "UNDEAFENED"
        log.voice(f"Voice state updated: {status_mute}, {status_deaf}")
        return True
        
    except Exception as e:
        log.error(f"Voice state update failed: {e}")
        return False

# ===== STATUS ROTATOR =====

async def status_rotator():
    """Rotate status secara periodik"""
    global status_index, status_rotator_running
    
    await bot.wait_until_ready()
    status_rotator_running = True
    log.status("Status rotator thread started")
    
    rotation_count = 0
    while status_rotator_running:
        try:
            if not statuses:
                log.warning("No statuses in list!")
                await asyncio.sleep(30)
                continue
            
            status = statuses[status_index % len(statuses)]
            activity = create_activity(status)
            
            await bot.change_presence(activity=activity)
            rotation_count += 1
            log.status(f"Rotated: {status['type']} {Fore.WHITE}{status['name']}{Fore.RESET} (#{rotation_count})")
            
            status_index = (status_index + 1) % len(statuses)
            await asyncio.sleep(STATUS_INTERVAL)
            
        except Exception as e:
            log.error(f"Status rotator error: {e}")
            await asyncio.sleep(5)

def create_activity(status):
    """Create activity object dari dictionary"""
    activity_type = status.get('type', 'playing')
    name = status.get('name', '')
    
    type_map = {
        'playing': discord.ActivityType.playing,
        'listening': discord.ActivityType.listening,
        'watching': discord.ActivityType.watching,
        'competing': discord.ActivityType.competing,
        'streaming': discord.ActivityType.streaming,
    }
    
    activity_type_enum = type_map.get(activity_type, discord.ActivityType.playing)
    
    if activity_type == 'streaming':
        return discord.Streaming(
            name=name,
            url=status.get('url', 'https://twitch.tv/yourchannel')
        )
    else:
        return discord.Activity(
            type=activity_type_enum,
            name=name
        )

# ===== COMMANDS =====

# --- Help Command ---

@bot.command(name="help", aliases=["h"])
async def cmd_help(ctx):
    """Tampilkan semua command"""
    embed = discord.Embed(
        title="📚 Xynera Protocol - Command List",
        description="Selfbot automation suite by Xynera Team",
        color=0x9b59b6,
        timestamp=datetime.now()
    )
    
    embed.add_field(
        name="🎵 Voice Commands",
        value="`!connect`, `!disconnect`, `!mute`, `!unmute`, `!deafen`, `!undeafen`, `!toggle`, `!voicestate`",
        inline=False
    )
    
    embed.add_field(
        name="🔄 Status Commands",
        value="`!statusstart`, `!statusstop`, `!setstatus`, `!statusadd`, `!statusremove`, `!statuslist`, `!statusinterval`",
        inline=False
    )
    
    embed.add_field(
        name="✉️ Auto-Typing Commands",
        value="`!start`, `!stop`, `!interval`, `!addmsg`, `!listmsg`, `!delmsg`",
        inline=False
    )
    
    embed.add_field(
        name="📊 Utility Commands",
        value="`!info`, `!ping`",
        inline=False
    )
    
    embed.set_footer(text="Xynera Protocol v2.0 | Use with caution ⚠️")
    await ctx.send(embed=embed)

# --- Ping Command ---

@bot.command(name="ping")
async def cmd_ping(ctx):
    """Cek latency bot"""
    latency = round(bot.latency * 1000)
    
    if latency < 50:
        color = 0x00ff00
        status = "🟢 Excellent"
    elif latency < 150:
        color = 0xffff00
        status = "🟡 Good"
    else:
        color = 0xff0000
        status = "🔴 Poor"
    
    embed = discord.Embed(
        title="🏓 Pong!",
        color=color,
        timestamp=datetime.now()
    )
    embed.add_field(name="Latency", value=f"{latency}ms", inline=True)
    embed.add_field(name="Status", value=status, inline=True)
    embed.set_footer(text="Xynera Protocol")
    await ctx.send(embed=embed)

# --- Voice Commands ---

@bot.command(name="connect", aliases=["join"])
async def cmd_connect(ctx, channel_id: int = None):
    """Connect ke voice channel\n!connect [channel_id]"""
    global VOICE_CHANNEL_ID
    if channel_id:
        VOICE_CHANNEL_ID = channel_id
    success = await connect_voice(VOICE_CHANNEL_ID)
    if success:
        await ctx.send(f"🔊 Connected to voice channel <#{VOICE_CHANNEL_ID}>")
    else:
        await ctx.send("❌ Failed to connect to voice channel")

@bot.command(name="disconnect", aliases=["leave"])
async def cmd_disconnect(ctx):
    """Disconnect dari voice channel"""
    success = await disconnect_voice()
    if success:
        await ctx.send("🔇 Disconnected from voice channel")
    else:
        await ctx.send("❌ Failed to disconnect")

@bot.command(name="mute")
async def cmd_mute(ctx):
    """Mute mic di voice channel"""
    success = await set_voice_state(mute=True, deafen=None)
    if success:
        await ctx.send("🔇 Mic muted")
    else:
        await ctx.send("❌ Failed to mute")

@bot.command(name="unmute")
async def cmd_unmute(ctx):
    """Unmute mic di voice channel"""
    success = await set_voice_state(mute=False, deafen=None)
    if success:
        await ctx.send("🔊 Mic unmuted")
    else:
        await ctx.send("❌ Failed to unmute")

@bot.command(name="deafen")
async def cmd_deafen(ctx):
    """Deafen (matikan suara) di voice channel"""
    success = await set_voice_state(mute=None, deafen=True)
    if success:
        await ctx.send("🔇 Deafen activated")
    else:
        await ctx.send("❌ Failed to deafen")

@bot.command(name="undeafen")
async def cmd_undeafen(ctx):
    """Undeafen (nyalakan suara) di voice channel"""
    success = await set_voice_state(mute=None, deafen=False)
    if success:
        await ctx.send("🔊 Undeafen activated")
    else:
        await ctx.send("❌ Failed to undeafen")

@bot.command(name="toggle")
async def cmd_toggle(ctx):
    """Toggle mute state"""
    global is_muted
    success = await set_voice_state(mute=not is_muted, deafen=None)
    if success:
        status = "🔇 Muted" if is_muted else "🔊 Unmuted"
        await ctx.send(f"✅ {status}")
    else:
        await ctx.send("❌ Failed to toggle")

@bot.command(name="voicestate")
async def cmd_voicestate(ctx):
    """Cek status voice saat ini"""
    if not is_connected:
        await ctx.send("❌ Not connected to voice channel")
        return
    
    embed = discord.Embed(
        title="🎵 Voice State",
        color=0x00ff00 if is_connected else 0xff0000,
        timestamp=datetime.now()
    )
    embed.add_field(name="Status", value="🟢 Connected" if is_connected else "🔴 Disconnected")
    embed.add_field(name="Mute", value="🔇 Yes" if is_muted else "🔊 No")
    embed.add_field(name="Deafen", value="🔇 Yes" if is_deafened else "🔊 No")
    embed.add_field(name="Channel", value=f"<#{VOICE_CHANNEL_ID}>")
    embed.set_footer(text="Xynera Protocol")
    await ctx.send(embed=embed)

# --- Status Rotator Commands ---

@bot.command(name="statusstart")
async def cmd_statusstart(ctx):
    """Mulai status rotator"""
    global status_rotator_running, status_index
    
    if status_rotator_running:
        await ctx.send("⚠️ Status rotator is already running!")
        return
    
    if not statuses:
        await ctx.send("⚠️ No statuses! Add one with !statusadd")
        return
    
    status_index = 0
    bot.loop.create_task(status_rotator())
    await ctx.send(f"🔄 Status rotator started! Interval: {STATUS_INTERVAL}s")

@bot.command(name="statusstop")
async def cmd_statusstop(ctx):
    """Hentikan status rotator"""
    global status_rotator_running
    
    if not status_rotator_running:
        await ctx.send("⚠️ Status rotator is not running!")
        return
    
    status_rotator_running = False
    await ctx.send("⏹️ Status rotator stopped")

@bot.command(name="statusadd")
async def cmd_statusadd(ctx, type: str, *, name: str):
    """Tambah status baru\n!statusadd playing Minecraft"""
    global statuses
    
    valid_types = ['playing', 'listening', 'watching', 'competing', 'streaming']
    if type.lower() not in valid_types:
        await ctx.send(f"⚠️ Type must be one of: {', '.join(valid_types)}")
        return
    
    statuses.append({"type": type.lower(), "name": name})
    await ctx.send(f"✅ Status added: {type} {name}")

@bot.command(name="statusremove")
async def cmd_statusremove(ctx, index: int):
    """Hapus status dari daftar (nomor)"""
    global statuses
    
    try:
        if 1 <= index <= len(statuses):
            removed = statuses.pop(index - 1)
            await ctx.send(f"🗑️ Status removed: {removed['type']} {removed['name']}")
        else:
            await ctx.send(f"⚠️ Index {index} invalid")
    except:
        await ctx.send("❌ Failed to remove status")

@bot.command(name="statuslist")
async def cmd_statuslist(ctx):
    """Lihat daftar status"""
    if not statuses:
        await ctx.send("📋 No statuses. Add with !statusadd")
        return
    
    msg = "**📋 Status List:**\n"
    for i, s in enumerate(statuses, 1):
        msg += f"{i}. {s['type']} {s['name']}\n"
    await ctx.send(msg)

@bot.command(name="statusinterval")
async def cmd_statusinterval(ctx, detik: int):
    """Set interval status rotator (detik)"""
    global STATUS_INTERVAL
    if detik < 5:
        await ctx.send("⚠️ Minimum interval is 5 seconds")
        return
    STATUS_INTERVAL = detik
    await ctx.send(f"⏱️ Status interval changed to {detik}s")

@bot.command(name="setstatus")
async def cmd_setstatus(ctx, type: str, *, name: str):
    """Set status manual (sekali)\n!setstatus playing Minecraft"""
    global status_rotator_running
    
    if status_rotator_running:
        status_rotator_running = False
        await ctx.send("⏹️ Status rotator paused")
        await asyncio.sleep(1)
    
    valid_types = ['playing', 'listening', 'watching', 'competing', 'streaming']
    if type.lower() not in valid_types:
        await ctx.send(f"⚠️ Type must be one of: {', '.join(valid_types)}")
        return
    
    activity = create_activity({"type": type.lower(), "name": name})
    await bot.change_presence(activity=activity)
    await ctx.send(f"✅ Status changed: {type} {name}")

# --- Auto-Typing Commands ---

@bot.command(name="start", aliases=["typing"])
async def cmd_start(ctx):
    """Mulai auto-typing di channel ini"""
    global CHANNEL_ID, auto_task
    
    CHANNEL_ID = ctx.channel.id
    log.typing(f"Auto-typing started in #{ctx.channel.name}")
    
    try:
        auto_task.cancel()
    except:
        pass
    
    auto_task = bot.loop.create_task(auto_typing())
    await ctx.send(f"✅ Auto-typing started! Interval: {INTERVAL_DETIK}s")

@bot.command(name="stop")
async def cmd_stop(ctx):
    """Hentikan auto-typing"""
    global auto_task
    try:
        auto_task.cancel()
        await ctx.send("⏹️ Auto-typing stopped")
        log.typing("Auto-typing stopped")
    except:
        await ctx.send("⚠️ Auto-typing is not running")

@bot.command(name="interval")
async def cmd_interval(ctx, detik: int):
    """Set interval baru (detik)"""
    global INTERVAL_DETIK
    if detik < 1:
        await ctx.send("⚠️ Minimum interval is 1 second")
        return
    INTERVAL_DETIK = detik
    await ctx.send(f"⏱️ Interval changed to {detik}s")

@bot.command(name="addmsg")
async def cmd_addmsg(ctx, *, pesan: str):
    """Tambah pesan baru ke daftar"""
    PESAN.append(pesan)
    await ctx.send(f"✅ Message added: {pesan}")

@bot.command(name="listmsg")
async def cmd_listmsg(ctx):
    """Lihat daftar pesan"""
    if not PESAN:
        await ctx.send("📋 No messages. Add with !addmsg")
        return
    
    msg = "**📋 Message List:**\n"
    for i, p in enumerate(PESAN, 1):
        msg += f"{i}. {p}\n"
    await ctx.send(msg)

@bot.command(name="delmsg")
async def cmd_delmsg(ctx, index: int):
    """Hapus pesan dari daftar (nomor)"""
    try:
        if 1 <= index <= len(PESAN):
            removed = PESAN.pop(index - 1)
            await ctx.send(f"🗑️ Message removed: {removed}")
        else:
            await ctx.send(f"⚠️ Index {index} invalid")
    except:
        await ctx.send("❌ Failed to remove message")

# --- Info Command ---

@bot.command(name="info")
async def cmd_info(ctx):
    """Tampilkan semua informasi selfbot"""
    embed = discord.Embed(
        title="📊 Xynera Protocol - System Status",
        color=0x9b59b6,
        timestamp=datetime.now()
    )
    
    if bot.user.avatar:
        embed.set_thumbnail(url=bot.user.avatar.url)
    
    # System Info
    embed.add_field(
        name="🖥️ System",
        value=f"User: {bot.user.name}\nID: {bot.user.id}\nServers: {len(bot.guilds)}",
        inline=True
    )
    
    # Voice
    voice_status = "🟢 Connected" if is_connected else "🔴 Disconnected"
    voice_ch = bot.get_channel(VOICE_CHANNEL_ID)
    ch_name = voice_ch.name if voice_ch else "Not found"
    
    embed.add_field(
        name="🎵 Voice", 
        value=f"Status: {voice_status}\nChannel: {ch_name}\nMute: {'🔇' if is_muted else '🔊'}\nDeafen: {'🔇' if is_deafened else '🔊'}", 
        inline=True
    )
    
    # Auto-typing
    embed.add_field(
        name="✉️ Auto-Typing",
        value=f"Interval: {INTERVAL_DETIK}s\nMessages: {len(PESAN)}\nRandom delay: {'✅' if RANDOM_DELAY else '❌'}",
        inline=True
    )
    
    # Status Rotator
    embed.add_field(
        name="🔄 Status Rotator",
        value=f"Status: {'🟢 Active' if status_rotator_running else '🔴 Inactive'}\nInterval: {STATUS_INTERVAL}s\nTotal: {len(statuses)} statuses",
        inline=True
    )
    
    # Performance
    embed.add_field(
        name="⚡ Performance",
        value=f"Latency: {round(bot.latency * 1000)}ms\nUptime: Running",
        inline=True
    )
    
    embed.set_footer(text="Xynera Protocol v2.0 | ⚠️ For educational purposes only")
    await ctx.send(embed=embed)

# ===== RUN =====
if __name__ == "__main__":
    try:
        # Show loading animation
        log.loading_animation(2)
        
        # Start bot
        log.info("Connecting to Discord...")
        bot.run(TOKEN)
    except discord.LoginFailure:
        log.error("Invalid token! Please check config.py")
        sys.exit(1)
    except KeyboardInterrupt:
        log.warning("\nShutting down Xynera Protocol...")
        sys.exit(0)
    except Exception as e:
        log.error(f"Fatal error: {e}")
        sys.exit(1)