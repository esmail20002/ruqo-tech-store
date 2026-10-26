const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const localDevelopmentHosts = new Set(['localhost', '127.0.0.1', '::1']);

app.get('/experiments.html', (req, res) => {
  if (!localDevelopmentHosts.has(req.hostname)) {
    return res.sendStatus(404);
  }

  res.sendFile(path.join(__dirname, 'public', 'experiments.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'glass-electronics-store' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
