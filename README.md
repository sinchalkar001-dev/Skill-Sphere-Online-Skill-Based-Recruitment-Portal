# Skill Sphere — Online Skill-Based Recruitment Portal

A modern, interactive web platform for project-based, assessment-driven job recruitment featuring secure JWT authentication, real-time job listings, and application management with email notifications.

## 🎯 Features

### For Recruiters
- ✅ Post custom job listings with tech tags
- ✅ View all applications in a dashboard
- ✅ Score and shortlist/reject candidates
- ✅ Receive email notifications for new applications
- ✅ Track candidate performance metrics

### For Candidates
- ✅ Browse available job opportunities
- ✅ Submit applications with cover letters and project links
- ✅ Showcase tech skills and portfolio
- ✅ Track application status
- ✅ Real-time notifications

### General
- ✅ Secure JWT-based authentication
- ✅ Bcrypt password encryption
- ✅ Responsive, modern UI with animations
- ✅ Dynamic form validation
- ✅ Real-time alerts and feedback

## 🏗️ Tech Stack

**Backend:**
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- Bcryptjs
- Nodemailer

**Frontend:**
- Vanilla HTML5
- CSS3 (Grid, Flexbox, Animations, Gradients)
- JavaScript (ES6+)

## 🚀 Quick Start

### 1. Install Backend Dependencies

```powershell
cd server
npm install
```

### 2. Start the Backend Server

```powershell
npm run dev
```

The server will run on `http://localhost:4000`

### 3. Open Frontend

Open `client/index.html` in any modern web browser.

## 📖 Usage Guide

### Register
1. Select your role (Candidate or Recruiter)
2. Enter name, email, and password
3. Click "Register"

### For Recruiters
1. Navigate to "Post New Job" section (visible after login)
2. Fill in job details, description, requirements, and tech tags
3. Click "Post Job"
4. Click "View Applications" on any job card to see applications
5. Score applications and shortlist or reject candidates

### For Candidates
1. Browse available jobs
2. Click "Apply Now" on any job
3. Submit cover letter, project links, and tech skills
4. Recruiter gets notified and can review your application

## 📁 Project Structure

```
Online Skill Based Hiring/
├── server/
│   ├── index.js          # Main Express server
│   ├── db.js             # SQLite database & schema
│   ├── auth.js           # Authentication routes
│   ├── jobs.js           # Job posting & listing
│   ├── applications.js   # Application submission & scoring
│   ├── middleware.js     # JWT verification & role checks
│   └── package.json
└── client/
    └── index.html        # Single-page application
```

## 🔐 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Encryption:** Bcrypt hashing with salt rounds
- **Role-Based Access:** Separate permissions for candidates & recruiters
- **HTTPS Ready:** Can be configured for production SSL/TLS

## 📧 Email Notifications

Currently uses Nodemailer with JSON transport (development mode).

For production, update `server/applications.js` with:
- Gmail SMTP
- SendGrid API
- AWS SES
- Other email services

## 🎨 UI/UX Highlights

- **Modern Design:** Purple gradient background with smooth animations
- **Responsive:** Works on desktop, tablet, and mobile
- **Interactive:** Real-time alerts, modal dialogs, and dynamic content
- **Accessibility:** Semantic HTML, proper form labels, keyboard navigation

## 🔧 Configuration

Edit `API` variable in `client/index.html` to point to your backend:

```javascript
const API = 'http://localhost:4000'; // Change if deploying
```

Edit JWT secret in `server/middleware.js`:

```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
```

## 📝 Database Schema

**users:** id, name, email, password, role (candidate/recruiter)
**jobs:** id, title, description, requirements, tech_tags, recruiter_id, created_at
**applications:** id, job_id, candidate_id, cover_letter, projects, tech_tags, score, status, applied_at

## 🚀 Production Deployment

1. Use environment variables for JWT secret and database path
2. Enable HTTPS/SSL certificates
3. Set up a proper email service (not JSON transport)
4. Add input validation and rate limiting
5. Enable CORS for your domain
6. Use a production database (PostgreSQL, MySQL)
7. Deploy backend to cloud (Heroku, AWS, Azure)
8. Host frontend on CDN (Vercel, Netlify)

## 📝 License

This project is open source and available for educational purposes.

## 💡 Future Enhancements

- Video interview integration
- Coding challenge assessment
- Analytics dashboard
- Automated candidate screening
- Integration with LinkedIn/GitHub
- Payment processing for premium listings

