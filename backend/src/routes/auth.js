const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

router.post('/register', async (req, res) => {
  const { phone_or_email, password } = req.body;
  if (!phone_or_email || !password) {
    return res.status(400).json({ error: 'Telefone/email e senha são obrigatórios' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (phone_or_email, password_hash) VALUES ($1, $2) RETURNING id, phone_or_email, is_subscriber',
      [phone_or_email, hash]
    );
    const user = rows[0];
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe uma conta com esse telefone/email' });
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

router.post('/login', async (req, res) => {
  const { phone_or_email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone_or_email = $1', [phone_or_email]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const user = { id: rows[0].id, phone_or_email: rows[0].phone_or_email, is_subscriber: rows[0].is_subscriber };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao iniciar sessão' });
  }
});

module.exports = router;
