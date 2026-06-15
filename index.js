const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Inisialisasi Bot
const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

// Load Data Files
const getUserData = () => {
  const filePath = path.join(__dirname, 'data', 'user.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return {};
};

const getScripts = () => {
  const filePath = path.join(__dirname, 'data', 'scripts.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return {};
};

const getTransactions = () => {
  const filePath = path.join(__dirname, 'data', 'transaksi.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  }
  return [];
};

const saveUserData = (data) => {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'user.json'), JSON.stringify(data, null, 2));
};

const saveScripts = (data) => {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'scripts.json'), JSON.stringify(data, null, 2));
};

const saveTransactions = (data) => {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'transaksi.json'), JSON.stringify(data, null, 2));
};

// ===============================
// 🚀 COMMAND: /start
// ===============================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || 'User';
  const firstName = msg.from.first_name || 'Pengguna';
  
  // Simpan user ke database jika belum ada
  let users = getUserData();
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      username: username,
      firstName: firstName,
      joinDate: new Date().toISOString(),
      role: 'USER'
    };
    saveUserData(users);
    
    // Kirim notifikasi ke channel
    const newUserText = `<blockquote>🔔 <b>NOTIFIKASI PENGGUNA BARU</b>\n\n╭─ 👤 <b>INFO PELANGGAN</b>\n├ 🧑 <b>Nama:</b> ${firstName}\n├ 🆔 <b>ID:</b> ${userId}\n├ 📛 <b>Username:</b> @${username}\n├ ⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n╰─</blockquote>`;
    
    try {
      await bot.sendMessage(config.CHANNEL_ID, newUserText, { parse_mode: 'HTML' });
    } catch (e) {
      console.log('Channel notif error:', e.message);
    }
  }
  
  // Welcome Message
  const welcomeText = `<blockquote>🌸 ───《 ❝ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ❞ 》─── 🌸
🚀 <b>𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗦𝗜 𝗕𝗢𝗧</b>
 OwnerBot : @${config.OWNER_USERNAME}
 𝖡𝗈𝗍 𝖭𝖆𝖒𝖎 : 𝗥𝗔𝗡𝗡 𝗔𝗨𝗧𝗢 𝗢𝗥𝗗𝗘𝗥
 𝖵𝖊𝖘𝗂𝗈𝗇 : 2.0.0

📊 <b>𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗞 𝗕𝗢𝗧</b>
 𝖳𝗈𝗍𝖺𝖑 𝖴𝖘𝖎𝖍 : ${Object.keys(users).length}
 Toatal Transaksi : ${getTransactions().length}
 
[ 𐚁 ] <b>𝗢𝗹𝗮𝗮, 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗕𝗼𝘁 𝗥𝗮𝗻𝗻 𝗔𝘂𝗍𝗼 𝗢𝗿𝗱𝗲𝗿</b></blockquote>`;
  
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📦 PRODUK', callback_data: 'menu_produk' }],
        [{ text: '🛒 BUY SCRIPT', callback_data: 'buy_script' }],
        [{ text: '🖥️ BUY PANEL', callback_data: 'buy_panel' }],
        [{ text: '💾 BUY PANEL DATA', callback_data: 'buy_data_panel' }],
        [{ text: '📞 HUBUNGI OWNER', callback_data: 'hubungi_owner' }],
        [{ text: '📡 CHANNEL OWNER', url: 'https://t.me/your_channel' }]
      ]
    }
  };
  
  bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML', ...opts });
});

// ===============================
// 🎯 CALLBACK QUERIES
// ===============================
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;
  const data = query.data;
  
  // Check if owner
  const isOwner = userId.toString() === config.OWNER_ID;
  
  try {
    if (data === 'menu_produk') {
      const menuText = `<blockquote>📦 <b>MENU PRODUK</b>\n\nPilih kategori produk yang ingin Anda lihat:</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛒 BUY SCRIPT', callback_data: 'buy_script' }],
            [{ text: '🖥️ BUY PANEL', callback_data: 'buy_panel' }],
            [{ text: '💾 BUY PANEL DATA', callback_data: 'buy_data_panel' }],
            [{ text: '⬅️ KEMBALI', callback_data: 'back_to_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(menuText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (data === 'buy_script') {
      const scripts = getScripts();
      const scriptList = Object.values(scripts);
      
      if (scriptList.length === 0) {
        const text = `<blockquote>❌ <b>TIDAK ADA SCRIPT</b>\n\nScript belum tersedia. Silahkan cek kembali nanti.</blockquote>`;
        
        const opts = {
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ KEMBALI', callback_data: 'menu_produk' }]
            ]
          }
        };
        
        await bot.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: opts.reply_markup
        });
      } else {
        let scriptText = `<blockquote>📦 <b>DAFTAR SCRIPT</b>\n\n`;
        
        const buttons = [];
        scriptList.forEach((script, idx) => {
          scriptText += `${idx + 1}. <b>${script.nama}</b> - Rp ${script.harga}\n`;
          buttons.push([{ text: script.nama, callback_data: `select_script_${script.id}` }]);
        });
        
        scriptText += `\nPilih script yang ingin dibeli:</blockquote>`;
        buttons.push([{ text: '⬅️ KEMBALI', callback_data: 'menu_produk' }]);
        
        const opts = {
          reply_markup: {
            inline_keyboard: buttons
          }
        };
        
        await bot.editMessageText(scriptText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: opts.reply_markup
        });
      }
    }
    
    else if (data.startsWith('select_script_')) {
      const scriptId = data.replace('select_script_', '');
      const scripts = getScripts();
      const script = scripts[scriptId];
      
      if (!script) {
        return bot.answerCallbackQuery(query.id, '❌ Script tidak ditemukan!', true);
      }
      
      const scriptText = `<blockquote>🛒 <b>DETAIL SCRIPT</b>\n\n📂 <b>Nama:</b> ${script.nama}\n💰 <b>Harga:</b> Rp ${script.harga}\n📄 <b>Deskripsi:</b> ${script.deskripsi}\n\nLanjutkan ke pembayaran?</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 LANJUT BAYAR', callback_data: `checkout_script_${scriptId}` }],
            [{ text: '⬅️ KEMBALI', callback_data: 'buy_script' }]
          ]
        }
      };
      
      await bot.editMessageText(scriptText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (data.startsWith('checkout_script_')) {
      const scriptId = data.replace('checkout_script_', '');
      const scripts = getScripts();
      const script = scripts[scriptId];
      
      const paymentText = `<blockquote>💳 <b>PEMBAYARAN SCRIPT</b>\n\n📂 <b>Produk:</b> ${script.nama}\n💰 <b>Total Pembayaran:</b> Rp ${script.harga}\n🏢 <b>Metode:</b> QRIS\n\n<i>Silahkan scan QRIS di bawah ini sesuai nominal yang sudah ditentukan:</i></blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📸 UPLOAD BUKTI TF', callback_data: `upload_proof_script_${scriptId}` }],
            [{ text: '❌ CANCEL', callback_data: 'menu_produk' }]
          ]
        }
      };
      
      // Send QRIS image
      await bot.sendPhoto(chatId, config.QRIS_URL, {
        caption: paymentText,
        parse_mode: 'HTML'
      });
      
      await bot.editMessageText(`<blockquote>⏳ Tunggu instruksi selanjutnya...</blockquote>`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
      });
    }
    
    else if (data === 'buy_panel') {
      const panelText = `<blockquote>🖥️ <b>PILIH PAKET PANEL</b>\n\nPilih paket yang sesuai dengan kebutuhan Anda:</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🧑 RESELLER (Rp 2000)', callback_data: 'panel_reseller' }],
            [{ text: '⭐ PREMIUM (Rp 3000)', callback_data: 'panel_premium' }],
            [{ text: '👑 OWNER (Rp 3500)', callback_data: 'panel_owner' }],
            [{ text: '🤝 PARTNER (Rp 5000)', callback_data: 'panel_partner' }],
            [{ text: '🔥 TANGAN KANAN (Rp 6000)', callback_data: 'panel_tangan_kanan' }],
            [{ text: '💎 CEO (Rp 8000)', callback_data: 'panel_ceo' }],
            [{ text: '⚡ DEVELOPER (Rp 10000)', callback_data: 'panel_developer' }],
            [{ text: '⬅️ KEMBALI', callback_data: 'menu_produk' }]
          ]
        }
      };
      
      await bot.editMessageText(panelText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (data.startsWith('panel_')) {
      const roleMap = {
        'panel_reseller': { name: 'RESELLER', price: 2000 },
        'panel_premium': { name: 'PREMIUM', price: 3000 },
        'panel_owner': { name: 'OWNER', price: 3500 },
        'panel_partner': { name: 'PARTNER', price: 5000 },
        'panel_tangan_kanan': { name: 'TANGAN KANAN', price: 6000 },
        'panel_ceo': { name: 'CEO', price: 8000 },
        'panel_developer': { name: 'DEVELOPER', price: 10000 }
      };
      
      const role = roleMap[data];
      
      const paymentText = `<blockquote>💳 <b>PEMBAYARAN PANEL</b>\n\n🧑 <b>Paket:</b> ${role.name}\n💰 <b>Total Pembayaran:</b> Rp ${role.price}\n🏢 <b>Metode:</b> QRIS\n\n<i>Silahkan scan QRIS di bawah ini sesuai nominal yang sudah ditentukan:</i></blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📸 UPLOAD BUKTI TF', callback_data: `confirm_panel_${role.name.replace(/ /g, '_')}` }],
            [{ text: '❌ CANCEL', callback_data: 'buy_panel' }]
          ]
        }
      };
      
      // Send QRIS image
      await bot.sendPhoto(chatId, config.QRIS_URL, {
        caption: paymentText,
        parse_mode: 'HTML'
      });
      
      await bot.editMessageText(`<blockquote>⏳ Tunggu instruksi selanjutnya...</blockquote>`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
      });
    }
    
    else if (data === 'buy_data_panel') {
      const dataText = `<blockquote>💾 <b>PILIH PAKET DATA PANEL</b>\n\nPilih kapasitas data yang Anda butuhkan:</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '5️⃣ 5GB (Rp 300)', callback_data: 'data_5gb' }],
            [{ text: '7️⃣ 7GB (Rp 500)', callback_data: 'data_7gb' }],
            [{ text: '8️⃣ 8GB (Rp 800)', callback_data: 'data_8gb' }],
            [{ text: '1️⃣0️⃣ 10GB (Rp 900)', callback_data: 'data_10gb' }],
            [{ text: '♾️ UNLIMITED (Rp 1000)', callback_data: 'data_unlimited' }],
            [{ text: '⬅️ KEMBALI', callback_data: 'menu_produk' }]
          ]
        }
      };
      
      await bot.editMessageText(dataText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (data.startsWith('data_')) {
      const dataMap = {
        'data_5gb': { size: '5GB', price: 300 },
        'data_7gb': { size: '7GB', price: 500 },
        'data_8gb': { size: '8GB', price: 800 },
        'data_10gb': { size: '10GB', price: 900 },
        'data_unlimited': { size: 'UNLIMITED', price: 1000 }
      };
      
      const dataPkg = dataMap[data];
      
      const paymentText = `<blockquote>💳 <b>PEMBAYARAN DATA PANEL</b>\n\n💾 <b>Kapasitas:</b> ${dataPkg.size}\n💰 <b>Total Pembayaran:</b> Rp ${dataPkg.price}\n🏢 <b>Metode:</b> QRIS\n\n<i>Silahkan scan QRIS di bawah ini sesuai nominal yang sudah ditentukan:</i></blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📸 UPLOAD BUKTI TF', callback_data: `confirm_data_${dataPkg.size.replace(/ /g, '_')}` }],
            [{ text: '❌ CANCEL', callback_data: 'buy_data_panel' }]
          ]
        }
      };
      
      // Send QRIS image
      await bot.sendPhoto(chatId, config.QRIS_URL, {
        caption: paymentText,
        parse_mode: 'HTML'
      });
      
      await bot.editMessageText(`<blockquote>⏳ Tunggu instruksi selanjutnya...</blockquote>`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML'
      });
    }
    
    else if (data === 'hubungi_owner') {
      const contactText = `<blockquote>📞 <b>HUBUNGI OWNER</b>\n\n💬 Silahkan ketik pesan untuk dikirimkan ke owner. Pesan Anda akan dibalas dalam waktu singkat.</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ KEMBALI', callback_data: 'back_to_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(contactText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (data === 'back_to_menu') {
      const users = getUserData();
      const welcomeText = `<blockquote>🌸 ───《 ❝ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ❞ 》─── 🌸
🚀 <b>𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗦𝗜 𝗕𝗢𝗧</b>
 OwnerBot : @${config.OWNER_USERNAME}
 𝖡𝗈𝗍 𝖭𝖆𝖒𝖎 : 𝗥𝗔𝗡𝗡 𝗔𝗨𝗧𝗢 𝗢𝗥𝗗𝗘𝗥
 𝖵𝖊𝖘𝗂𝗈𝗇 : 2.0.0

📊 <b>𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗞 𝗕𝗢𝗧</b>
 𝖳𝗈𝗍𝖆𝖑 𝖴𝖘𝖉𝖊𝖗 : ${Object.keys(users).length}
 Total Transaksi : ${getTransactions().length}
 
[ 𐚁 ] <b>𝗢𝗹𝗮𝗮, 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗕𝗼𝘁 𝗥𝗮𝗻𝗻 𝗔𝘂𝗍𝗼 𝗢𝗿𝗱𝗲𝗿</b></blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📦 PRODUK', callback_data: 'menu_produk' }],
            [{ text: '🛒 BUY SCRIPT', callback_data: 'buy_script' }],
            [{ text: '🖥️ BUY PANEL', callback_data: 'buy_panel' }],
            [{ text: '💾 BUY PANEL DATA', callback_data: 'buy_data_panel' }],
            [{ text: '📞 HUBUNGI OWNER', callback_data: 'hubungi_owner' }],
            [{ text: '📡 CHANNEL OWNER', url: 'https://t.me/your_channel' }]
          ]
        }
      };
      
      await bot.editMessageText(welcomeText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    // ====== OWNER MENU ======
    else if (isOwner && data === 'owner_menu') {
      const ownerText = `<blockquote>👑 <b>MENU OWNER</b>\n\nSilahkan pilih menu yang ingin diakses:</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '➕ ADD SCRIPT', callback_data: 'add_script' }],
            [{ text: '📢 BROADCAST', callback_data: 'broadcast' }],
            [{ text: '💾 BACKUP DATA', callback_data: 'backup_data' }],
            [{ text: '📊 STATISTIK', callback_data: 'owner_stats' }],
            [{ text: '⬅️ KEMBALI', callback_data: 'back_to_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(ownerText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (isOwner && data === 'add_script') {
      const addText = `<blockquote>📥 <b>CARA TAMBAH SCRIPT</b>\n\n1️⃣ Silahkan kirim file <code>*.zip</code> sekarang.\n\n2️⃣ Setelah file terkirim, bot akan meminta detail produk.\n\n<i>Format: NAMA SCRIPT | HARGA | DESKRIPSI</i>\n\n[ BATAL ] membatalkan menambahkan script</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ KEMBALI', callback_data: 'owner_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(addText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (isOwner && data === 'broadcast') {
      const bcText = `<blockquote>📢 <b>BROADCAST KE SEMUA USER</b>\n\n💬 Silahkan ketik pesan untuk di-broadcast ke semua user yang terdaftar.</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ KEMBALI', callback_data: 'owner_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(bcText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    else if (isOwner && data === 'backup_data') {
      try {
        const backupData = {
          users: getUserData(),
          scripts: getScripts(),
          transactions: getTransactions(),
          backup_time: new Date().toISOString()
        };
        
        const backupPath = path.join(__dirname, 'data', `backup_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
        const backupText = `<blockquote>✅ <b>BACKUP BERHASIL</b>\n\n📁 Backup data telah dibuat.\n⏰ Waktu: ${new Date().toLocaleString('id-ID')}</blockquote>`;
        
        const opts = {
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ KEMBALI', callback_data: 'owner_menu' }]
            ]
          }
        };
        
        await bot.editMessageText(backupText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: opts.reply_markup
        });
        
        // Send backup file
        await bot.sendDocument(chatId, backupPath, {
          caption: `Backup data - ${new Date().toLocaleString('id-ID')}`
        });
      } catch (e) {
        bot.answerCallbackQuery(query.id, `❌ Error: ${e.message}`, true);
      }
    }
    
    else if (isOwner && data === 'owner_stats') {
      const users = getUserData();
      const transactions = getTransactions();
      const scripts = getScripts();
      
      const statsText = `<blockquote>📊 <b>STATISTIK BOT</b>\n\n👥 <b>Total User:</b> ${Object.keys(users).length}\n💰 <b>Total Transaksi:</b> ${transactions.length}\n📦 <b>Total Script:</b> ${Object.keys(scripts).length}\n\n📈 <b>Info Lainnya:</b>\n• Bot Version: 2.0.0\n• Owner: @${config.OWNER_USERNAME}\n• Waktu: ${new Date().toLocaleString('id-ID')}</blockquote>`;
      
      const opts = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ KEMBALI', callback_data: 'owner_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(statsText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: opts.reply_markup
      });
    }
    
    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Callback error:', error);
    bot.answerCallbackQuery(query.id, '❌ Terjadi kesalahan!', true);
  }
});

// ===============================
// 📄 MESSAGE HANDLERS
// ===============================

// Handle /admin command
bot.onText(/\/admin/, async (msg) => {
  const userId = msg.from.id;
  const isOwner = userId.toString() === config.OWNER_ID;
  
  if (!isOwner) {
    return bot.sendMessage(msg.chat.id, '❌ Anda tidak memiliki akses untuk menu ini!');
  }
  
  const adminText = `<blockquote>👑 <b>MENU OWNER</b>\n\nSilahkan pilih menu yang ingin diakses:</blockquote>`;
  
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '➕ ADD SCRIPT', callback_data: 'add_script' }],
        [{ text: '📢 BROADCAST', callback_data: 'broadcast' }],
        [{ text: '💾 BACKUP DATA', callback_data: 'backup_data' }],
        [{ text: '📊 STATISTIK', callback_data: 'owner_stats' }]
      ]
    }
  };
  
  bot.sendMessage(msg.chat.id, adminText, { parse_mode: 'HTML', ...opts });
});

// Handle regular messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isOwner = userId.toString() === config.OWNER_ID;
  const text = msg.text || '';
  
  // Skip commands
  if (text.startsWith('/')) return;
  
  try {
    // Owner broadcast
    if (msg.reply_to_message && isOwner && msg.reply_to_message.text && msg.reply_to_message.text.includes('BROADCAST')) {
      const users = getUserData();
      const userIds = Object.keys(users);
      
      let successCount = 0;
      let failCount = 0;
      
      const broadcastText = `<blockquote>📢 <b>PEMBERITAHUAN DARI OWNER</b>\n\n${text}</blockquote>`;
      
      for (const uid of userIds) {
        try {
          await bot.sendMessage(uid, broadcastText, { parse_mode: 'HTML' });
          successCount++;
        } catch (e) {
          failCount++;
        }
      }
      
      const resultText = `<blockquote>✅ <b>BROADCAST SELESAI</b>\n\n📤 Berhasil: ${successCount}\n❌ Gagal: ${failCount}</blockquote>`;
      
      bot.sendMessage(chatId, resultText, { parse_mode: 'HTML' });
    }
  } catch (error) {
    console.error('Message handler error:', error);
  }
});

// ===============================
// 🚀 BOT STARTUP
// ===============================

console.log('🤖 RANN Auto Order Bot is running...');
console.log('✅ Bot version: 2.0.0');
console.log('✅ All features enabled');
console.log('✅ Ready to accept commands');

module.exports = bot;
