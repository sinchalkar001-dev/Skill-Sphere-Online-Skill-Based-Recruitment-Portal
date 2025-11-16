const express = require('express');
const db = require('./db');
const { verifyToken, requireRole } = require('./middleware');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
  jsonTransport: true
});

router.post('/', verifyToken, requireRole('candidate'), (req, res) => {
  const candidate_id = req.user.id;
  const { job_id, cover_letter, projects, tech_tags } = req.body;
  
  db.run('INSERT INTO applications(job_id,candidate_id,cover_letter,projects,tech_tags) VALUES(?,?,?,?,?)',
    [job_id, candidate_id, cover_letter || '', JSON.stringify(projects || []), JSON.stringify(tech_tags || [])],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not submit application' });
      
      // notify recruiter
      db.get('SELECT u.id as recruiter_id, u.email, u.name FROM users u JOIN jobs j ON j.recruiter_id = u.id WHERE j.id = ?', [job_id], (e, row) => {
        if (row) {
          const mail = {
            from: 'no-reply@skillsphere.local',
            to: row.email,
            subject: 'New application received',
            text: `Hello ${row.name},\n\nA new application was submitted for your job (id ${job_id}).\n\nBest regards,\nSkill Sphere`,
          };
          transporter.sendMail(mail, (merr, info) => {});

          // Emit realtime event to the recruiter room
          try {
            const socketHelper = require('./socket');
            const io = socketHelper.getIO();
            if (io) {
              io.to(`recruiter_${row.recruiter_id}`).emit('applicationSubmitted', {
                job_id: parseInt(job_id),
                application_id: this.lastID,
                candidate_id,
                candidate_name: req.user.name
              });
            }
          } catch (err) {
            console.error('Socket emit error:', err.message);
          }
        }
      });
      
      res.json({ application_id: this.lastID });
    }
  );
});

router.get('/job/:jobId', verifyToken, requireRole('recruiter'), (req, res) => {
  const jobId = req.params.jobId;
  db.all('SELECT a.*, u.name as candidate_name FROM applications a JOIN users u ON u.id = a.candidate_id WHERE a.job_id = ?', 
    [jobId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not fetch applications' });
      const apps = (rows || []).map(r => ({ ...r, projects: JSON.parse(r.projects || '[]'), tech_tags: JSON.parse(r.tech_tags || '[]') }));
      res.json({ applications: apps });
    }
  );
});

router.post('/:id/score', verifyToken, requireRole('recruiter'), (req, res) => {
  const id = req.params.id;
  const { score, status } = req.body;
  db.run('UPDATE applications SET score = ?, status = ? WHERE id = ?', 
    [score || null, status || 'reviewed', id], 
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not update application' });
      res.json({ updated: this.changes });
    }
  );
});

module.exports = router;
