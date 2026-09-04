const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  const { category, search } = req.query;
  try {
    let query = 'SELECT id, title, synopsis, category, poster_url, duration_min FROM movies WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND title ILIKE $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar catálogo' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, synopsis, category, poster_url, duration_min FROM movies WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Filme não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar filme' });
  }
});

router.get('/:id/stream', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT hls_url FROM movies WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Filme não encontrado' });

    const isSubscriber = req.user?.is_subscriber === true;
    let ads = [];
    if (!isSubscriber) {
      const adResult = await pool.query(
        'SELECT ad_type, position_sec FROM ad_placements WHERE movie_id = $1 ORDER BY position_sec',
        [req.params.id]
      );
      ads = adResult.rows;
    }

    res.json({ hls_url: rows[0].hls_url, ads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar stream' });
  }
});

module.exports = router;
