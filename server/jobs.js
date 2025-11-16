const express = require('express');
const db = require('./db');
const { verifyToken, requireRole } = require('./middleware');

const router = express.Router();

router.post('/', verifyToken, requireRole('recruiter'), (req, res) => {
  const { title, description, requirements, tech_tags } = req.body;
  const recruiter_id = req.user.id;
  
  db.run('INSERT INTO jobs(title,description,requirements,tech_tags,recruiter_id) VALUES(?,?,?,?,?)', 
    [title, description || '', requirements || '', JSON.stringify(tech_tags || []), recruiter_id], 
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not create job' });
      db.get('SELECT * FROM jobs WHERE id = ?', [this.lastID], (e, job) => {
        if (job) {
          job.tech_tags = JSON.parse(job.tech_tags || '[]');
          res.json({ job });

          // Emit realtime notification to recruiters
          try {
            const socketHelper = require('./socket');
            const io = socketHelper.getIO();
            if (io) io.to('recruiters').emit('jobCreated', { job });
          } catch (err) {
            console.error('Socket emit error:', err.message);
          }
        } else res.json({ job: null });
      });
    }
  );
});

router.get('/', (req, res) => {
  db.all('SELECT j.*, u.name as recruiter_name FROM jobs j JOIN users u ON u.id = j.recruiter_id ORDER BY j.created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not fetch jobs' });
    const jobs = (rows || []).map(r => ({ ...r, tech_tags: JSON.parse(r.tech_tags || '[]') }));
    res.json({ jobs });
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT j.*, u.name as recruiter_name FROM jobs j JOIN users u ON u.id = j.recruiter_id WHERE j.id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Job not found' });
    row.tech_tags = JSON.parse(row.tech_tags || '[]');
    res.json({ job: row });
  });
});

module.exports = router;
