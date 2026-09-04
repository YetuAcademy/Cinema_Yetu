const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/optionalAuth');

router.post('/', requireAuth, async (req, res) => {
  const { payment_method } = req.body;
  const started_at = new Date();
  const renews_at = new Date();
  renews_at.setMonth(renews_at.getMonth() + 1);

  try {
    await pool.query('BEGIN');
    const { rows } = await pool.query(
      `INSERT INTO subscriptions (user_id, status, started_at, renews_at, payment_method)
       VALUES ($1, 'pending', $2, $3, $4) RETURNING *`,
      [req.user.id, started_at, renews_at, payment_method]
    );
    await pool.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao iniciar assinatura' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar assinatura' });
  }
});

module.exports = router;
