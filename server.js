const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { pool, initDb } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database first
initDb();

// Middleware - IMPORTANT: Order matters!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// === API Routes (MUST come BEFORE static files) ===

// 註冊功能，網資料庫新增用戶信息
app.post('/api/register', async (req, res) => {
    const { username, email, password, 'confirm-password': confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.json({ success: false, message: '請填寫所有欄位' });
    }

    if (password !== confirmPassword) {
        return res.json({ success: false, message: '兩次輸入的密碼不一致' });
    }

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.json({ success: false, message: '使用者名稱或 Email 已被註冊' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        req.session.userId = result.insertId;
        req.session.username = username;

        res.json({ success: true, message: '註冊成功！', username });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: '註冊失敗，系統錯誤' });
    }
});

// 登入功能，網資料庫查詢用戶
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.json({ success: false, message: '請填寫所有欄位' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
        const user = users[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ success: true, message: '登入成功！', username: user.username });
        } else {
            res.json({ success: false, message: '帳號或密碼錯誤' });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: '系統錯誤' });
    }
});

//檢查是否已經登入
app.get('/api/check_auth', (req, res) => {
    if (req.session.userId) {
        res.json({ isLoggedIn: true, username: req.session.username });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// 登出
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

//發送留言
app.post('/api/contact', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '請先登入會員' });
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.json({ success: false, message: '請填寫所有欄位' });
    }

    try {
        await pool.query(
            'INSERT INTO messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, name, email, subject, message]
        );
        res.json({ success: true, message: '留言發送成功！感謝您的聯繫。' });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: '留言發送失敗，請稍後再試' });
    }
});

// 查詢管理後台資料（用戶資料和留言資料）
app.get('/api/admin/data', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '請先登入' });
    }

    try {
        // 檢查是不是admin賬戶
        const [users] = await pool.query('SELECT username FROM users WHERE id = ?', [req.session.userId]);
        if (!users.length || users[0].username !== 'admin') {
            return res.status(403).json({ success: false, message: '權限不足' });
        }

        const pageUsers = parseInt(req.query.page_users) || 1;
        const pageMsgs = parseInt(req.query.page_msgs) || 1;
        const limit = 10;
        const offsetUsers = (pageUsers - 1) * limit;
        const offsetMsgs = (pageMsgs - 1) * limit;

        // 查詢用戶資料庫信息，獲取全部用戶資料
        const [userCountResult] = await pool.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = userCountResult[0].count;
        const [usersData] = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offsetUsers]);

        // 查詢留言資料庫信息，獲取全部留言
        const [msgCountResult] = await pool.query('SELECT COUNT(*) as count FROM messages');
        const totalMsgs = msgCountResult[0].count;
        const [msgsData] = await pool.query(
            `SELECT m.*, u.username as user_name 
             FROM messages m 
             LEFT JOIN users u ON m.user_id = u.id 
             ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
            [limit, offsetMsgs]
        );

        res.json({
            success: true,
            users: {
                data: usersData,
                total: totalUsers,
                current_page: pageUsers,
                per_page: limit,
                total_pages: Math.ceil(totalUsers / limit)
            },
            messages: {
                data: msgsData,
                total: totalMsgs,
                current_page: pageMsgs,
                per_page: limit,
                total_pages: Math.ceil(totalMsgs / limit)
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '系統錯誤' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
