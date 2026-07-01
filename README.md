<div align="center">

# ⚡ Xynera Protocol ⚡

### *Advanced Discord Automation Suite*

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.comHiimeka/xynera/)
[![Node.js](https://img.shields.io/badge/node.js-16.9.0+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.14.1-blue.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/license-MIT-red.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🚀 **Xynera Protocol** adalah selfbot Discord canggih berbasis **Discord.js v14** dengan fitur lengkap untuk automation dan kontrol penuh atas akun Discord Anda.

> ⚠️ **PERINGATAN PENTING**: Penggunaan selfbot **MELANGGAR** Syarat Layanan Discord dan dapat mengakibatkan **BAN PERMANEN** pada akun Anda. Gunakan hanya untuk **tujuan edukasi** dan dengan **risiko Anda sendiri**!

---

## ✨ **Fitur Lengkap**

### 🎵 **Voice Channel Control**
- ✅ Connect/Disconnect dari voice channel
- ✅ Mute/Unmute microphone
- ✅ Deafen/Undeafen audio
- ✅ Toggle mute dengan satu perintah
- ✅ Cek status voice real-time
- ✅ Pindah antar voice channel
- ✅ Cek latency voice (ping)

### ✉️ **Auto-Typing System**
- ✅ Kirim pesan otomatis dengan efek mengetik
- ✅ Custom daftar pesan (bisa ditambah/dihapus)
- ✅ Custom interval waktu
- ✅ Random delay untuk menghindari deteksi
- ✅ Rate limit handling otomatis

### 🔄 **Status Rotator**
- ✅ Rotasi status otomatis (Playing/Listening/Watching/Competing/Streaming)
- ✅ Custom status list (tambah/hapus)
- ✅ Custom interval rotasi
- ✅ Set status manual kapan saja
- ✅ Support streaming status dengan URL

### 👑 **Remote Control**
- ✅ Hanya owner (akun lain) yang bisa menggunakan commands
- ✅ Dikonfigurasi via `OWNER_ID` di `.env`
- ✅ Semua perintah bisa dijalankan dari akun lain

### 🖥️ **Console Experience**
- ✅ ASCII Art banner "Xynera Protocol"
- ✅ Colorful console logging dengan gradient
- ✅ Real-time system monitoring
- ✅ Loading animation
- ✅ Matrix-style initialization
- ✅ Detailed system info on startup

### 📊 **System Commands**
- ✅ `!help` - Tampilkan semua command
- ✅ `!info` - Cek status sistem lengkap
- ✅ `!ping` - Cek latency bot

### 🎨 **Customizable**
- ✅ Ubah semua config di `.env`
- ✅ Modular code structure
- ✅ Debug mode untuk troubleshooting

---

## 📦 **Persyaratan Sistem**

| Komponen | Minimum Requirement |
|----------|-------------------|
| **Node.js** | 16.9.0 atau lebih baru |
| **NPM** | 7.0.0 atau lebih baru |
| **RAM** | 128 MB |
| **Storage** | 50 MB |
| **OS** | Windows / Linux / macOS |
| **Internet** | Koneksi stabil |

---

## 🛠️ **Instalasi**

### 🪟 **Windows**

#### **Method 1: Manual Install**

```cmd
# 1. Download atau clone repository
git clone https://github.com/xynera/selfbot.git
cd selfbot

# 2. Install Node.js (jika belum)
# Download dari https://nodejs.org/

# 3. Install dependencies
npm install

# 4. Copy dan edit file .env
copy .env.example .env
notepad .env

# 5. Jalankan selfbot
npm start