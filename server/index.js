const express = require('express');
const bodyParser = require('express').json;
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
const auth = require('./auth');
const jobs = require('./jobs');
const applications = require('./applications');
const socketHelper = require('./socket');

const app = express();
app.use(bodyParser());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/auth', auth);
app.use('/jobs', jobs);
app.use('/applications', applications);

app.get('/', (req, res) => res.json({ ok: true, service: 'Skill Sphere API' }));

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });
socketHelper.setIO(io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', ({ role, id }) => {
    if (!role || !id) return;
    if (role === 'recruiter') {
      socket.join(`recruiter_${id}`);
      socket.join('recruiters');
    } else if (role === 'candidate') {
      socket.join(`candidate_${id}`);
    }
  });

  socket.on('disconnect', () => {
    // console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server listening on http://localhost:${PORT}`));
