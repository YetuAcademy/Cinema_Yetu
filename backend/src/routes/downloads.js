
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/optionalAuth');

router.post('/', requireAuth, async (req, res) => {
  const { movie_id, quality } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO downloads (user_id, movie_id, quality) VALUES ($1, $2, $3) RETURNING id, downloaded_at',
      [req.user.id, movie_id, quality || 'sd']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registar download' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.quality, d.downloaded_at, m.title, m.poster_url, m.hls_url
       FROM downloads d JOIN movies m ON m.id = d.movie_id
       WHERE d.user_id = $1 ORDER BY d.downloaded_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar downloads' });
  }
});

module.exports = router;
