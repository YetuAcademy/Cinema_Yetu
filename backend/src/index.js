require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { optionalAuth } = require('./middleware/optionalAuth');
const moviesRouter = require('./routes/movies');
const authRouter = require('./routes/auth');
const downloadsRouter = require('./routes/downloads');
const subscriptionsRouter = require('./routes/subscriptions');

const app = express();
app.use(cors());
app.use(express.json());
app.use(optionalAuth);

app.use('/movies', moviesRouter);
app.use('/auth', authRouter);
app.use('/downloads', downloadsRouter);
app.use('/subscriptions', subscriptionsRouter);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cinema Yetu API a correr na porta ${PORT}`));
