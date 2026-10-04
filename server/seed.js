import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from './config/env.js';
import { User, Job, Application, Notification, Skill, EmailJob } from './models/index.js';
import { syncDatabase } from './services/database.service.js';
import { rebuildSkillCatalog } from './services/skill.service.js';

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✓ Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
      Skill.deleteMany({}),
      EmailJob.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    await syncDatabase();
    console.log('✓ Indexes in sync with schemas');

    // ── Create Recruiters ──
    const recruiters = await User.create([
      {
        name: 'Priya Sharma',
        email: 'priya@techcorp.com',
        password: 'password123',
        role: 'recruiter',
        avatar: '',
        company: {
          name: 'TechCorp India',
          website: 'https://techcorp.in',
          description: 'Leading technology solutions company building next-gen enterprise software.',
          size: '201-500',
        },
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@startupx.com',
        password: 'password123',
        role: 'recruiter',
        avatar: '',
        company: {
          name: 'StartupX',
          website: 'https://startupx.io',
          description: 'Fast-growing fintech startup revolutionizing digital payments.',
          size: '51-200',
        },
      },
      {
        name: 'Ananya Patel',
        email: 'ananya@cloudnine.com',
        password: 'password123',
        role: 'recruiter',
        avatar: '',
        company: {
          name: 'CloudNine Solutions',
          website: 'https://cloudnine.tech',
          description: 'Cloud-native infrastructure and DevOps consulting firm.',
          size: '51-200',
        },
      },
    ]);
    console.log(`✓ Created ${recruiters.length} recruiters`);

    // ── Create Candidates ──
    const candidates = await User.create([
      {
        name: 'Arjun Mehta',
        email: 'arjun@email.com',
        password: 'password123',
        role: 'candidate',
        bio: 'Full-stack developer with 3 years of experience in React, Node.js, and cloud technologies. Passionate about clean code and modern architecture.',
        phone: '+91 9876543210',
        location: 'Bangalore, India',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
        experience: 3,
        portfolio: {
          github: 'https://github.com/arjunmehta',
          linkedin: 'https://linkedin.com/in/arjunmehta',
          website: 'https://arjun.dev',
        },
        projects: [
          {
            title: 'E-Commerce Platform',
            description: 'Full-stack e-commerce with payment integration, inventory management, and admin dashboard.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
            liveUrl: 'https://shop-demo.arjun.dev',
            repoUrl: 'https://github.com/arjunmehta/ecommerce',
          },
          {
            title: 'Real-time Chat App',
            description: 'WebSocket-based chat application with rooms, file sharing, and message encryption.',
            techStack: ['React', 'Socket.IO', 'Node.js', 'PostgreSQL'],
            liveUrl: 'https://chat.arjun.dev',
            repoUrl: 'https://github.com/arjunmehta/chat-app',
          },
        ],
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@email.com',
        password: 'password123',
        role: 'candidate',
        bio: 'Frontend specialist with expertise in React ecosystem, UI/UX design, and accessibility. Love crafting pixel-perfect interfaces.',
        phone: '+91 9876543211',
        location: 'Hyderabad, India',
        skills: ['React', 'Next.js', 'TailwindCSS', 'Figma', 'TypeScript', 'Framer Motion', 'Storybook'],
        experience: 2,
        portfolio: {
          github: 'https://github.com/snehareddy',
          linkedin: 'https://linkedin.com/in/snehareddy',
          website: 'https://sneha.design',
        },
        projects: [
          {
            title: 'Design System Library',
            description: 'Comprehensive React component library with Storybook documentation and accessibility compliance.',
            techStack: ['React', 'TypeScript', 'Storybook', 'TailwindCSS'],
            repoUrl: 'https://github.com/snehareddy/design-system',
          },
        ],
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@email.com',
        password: 'password123',
        role: 'candidate',
        bio: 'Backend engineer specialized in microservices, distributed systems, and DevOps. AWS certified.',
        phone: '+91 9876543212',
        location: 'Mumbai, India',
        skills: ['Python', 'Go', 'Kubernetes', 'AWS', 'Terraform', 'PostgreSQL', 'Redis', 'gRPC'],
        experience: 5,
        portfolio: {
          github: 'https://github.com/vikramsingh',
          linkedin: 'https://linkedin.com/in/vikramsingh',
        },
        projects: [
          {
            title: 'Microservices Boilerplate',
            description: 'Production-ready microservices template with service mesh, tracing, and CI/CD pipeline.',
            techStack: ['Go', 'Kubernetes', 'Istio', 'Prometheus', 'Grafana'],
            repoUrl: 'https://github.com/vikramsingh/microservices-bp',
          },
        ],
      },
      {
        name: 'Kavya Nair',
        email: 'kavya@email.com',
        password: 'password123',
        role: 'candidate',
        bio: 'Data-driven developer with experience in ML pipelines, data engineering, and full-stack web apps.',
        phone: '+91 9876543213',
        location: 'Chennai, India',
        skills: ['Python', 'React', 'TensorFlow', 'SQL', 'Apache Spark', 'FastAPI', 'Docker'],
        experience: 1,
        portfolio: {
          github: 'https://github.com/kavyanair',
          linkedin: 'https://linkedin.com/in/kavyanair',
        },
        projects: [],
      },
    ]);
    console.log(`✓ Created ${candidates.length} candidates`);

    // ── Create Jobs ──
    const jobs = await Job.create([
      {
        title: 'Senior Full-Stack Developer',
        description: 'We are looking for a senior full-stack developer to lead our product engineering team. You will design and implement scalable web applications, mentor junior developers, and drive technical decisions.\n\nYou will work with a modern tech stack including React, Node.js, and cloud services. Experience with microservices architecture and CI/CD pipelines is highly valued.',
        requirements: [
          '4+ years of full-stack development experience',
          'Strong proficiency in React and Node.js',
          'Experience with MongoDB or PostgreSQL',
          'Knowledge of cloud platforms (AWS/GCP/Azure)',
          'Understanding of CI/CD and DevOps practices',
        ],
        responsibilities: [
          'Design and develop scalable web applications',
          'Lead code reviews and mentor junior developers',
          'Collaborate with product and design teams',
          'Optimize application performance and scalability',
          'Write clean, maintainable, and well-tested code',
        ],
        techStack: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'Redis'],
        recruiter: recruiters[0]._id,
        salary: { min: 1500000, max: 2500000, currency: 'INR', period: 'yearly' },
        location: 'Bangalore, India',
        locationType: 'hybrid',
        jobType: 'full-time',
        experienceLevel: 'senior',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxApplications: 50,
        isActive: true,
        assessment: {
          enabled: true,
          criteria: [
            { name: 'Technical Skills', maxScore: 10, weight: 40 },
            { name: 'Problem Solving', maxScore: 10, weight: 25 },
            { name: 'Communication', maxScore: 10, weight: 15 },
            { name: 'Project Quality', maxScore: 10, weight: 20 },
          ],
        },
      },
      {
        title: 'React Frontend Engineer',
        description: 'Join our frontend team to build beautiful, responsive, and performant web interfaces. We care deeply about user experience and design excellence.\n\nYou will work closely with designers and backend engineers to deliver pixel-perfect implementations of our product features.',
        requirements: [
          '2+ years of React development experience',
          'Strong CSS/Tailwind skills',
          'Experience with state management (Context/Redux)',
          'Understanding of web accessibility standards',
          'Eye for design and attention to detail',
        ],
        responsibilities: [
          'Build responsive React components and pages',
          'Implement designs from Figma mockups',
          'Optimize frontend performance',
          'Write unit and integration tests',
          'Contribute to the design system',
        ],
        techStack: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Storybook', 'Jest'],
        recruiter: recruiters[0]._id,
        salary: { min: 800000, max: 1500000, currency: 'INR', period: 'yearly' },
        location: 'Bangalore, India',
        locationType: 'remote',
        jobType: 'full-time',
        experienceLevel: 'mid',
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        assessment: {
          enabled: true,
          criteria: [
            { name: 'UI Implementation', maxScore: 10, weight: 35 },
            { name: 'React Knowledge', maxScore: 10, weight: 30 },
            { name: 'CSS Skills', maxScore: 10, weight: 20 },
            { name: 'Code Quality', maxScore: 10, weight: 15 },
          ],
        },
      },
      {
        title: 'Backend Engineer — Fintech',
        description: 'Build the backbone of our digital payment infrastructure. You will work on high-throughput transaction systems, API design, and data security.\n\nThis is a high-impact role where your code will process millions of daily transactions.',
        requirements: [
          '3+ years of backend development experience',
          'Proficiency in Node.js or Python',
          'Experience with SQL and NoSQL databases',
          'Understanding of payment systems and PCI compliance',
          'Experience with message queues (RabbitMQ/Kafka)',
        ],
        responsibilities: [
          'Design and implement RESTful APIs',
          'Build and maintain payment processing systems',
          'Ensure data security and compliance',
          'Monitor and optimize system performance',
          'Write comprehensive documentation',
        ],
        techStack: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Docker', 'Kubernetes'],
        recruiter: recruiters[1]._id,
        salary: { min: 1200000, max: 2000000, currency: 'INR', period: 'yearly' },
        location: 'Mumbai, India',
        locationType: 'onsite',
        jobType: 'full-time',
        experienceLevel: 'mid',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true,
        assessment: {
          enabled: true,
          criteria: [
            { name: 'Backend Skills', maxScore: 10, weight: 40 },
            { name: 'System Design', maxScore: 10, weight: 30 },
            { name: 'Security Awareness', maxScore: 10, weight: 20 },
            { name: 'Communication', maxScore: 10, weight: 10 },
          ],
        },
      },
      {
        title: 'DevOps Engineer',
        description: 'We need a DevOps engineer to build and maintain our cloud infrastructure. You will set up CI/CD pipelines, manage Kubernetes clusters, and ensure system reliability.',
        requirements: [
          '3+ years of DevOps/SRE experience',
          'Strong Kubernetes and Docker knowledge',
          'Experience with Terraform or Pulumi',
          'AWS or GCP certified (preferred)',
          'Scripting skills (Bash, Python)',
        ],
        responsibilities: [
          'Manage cloud infrastructure (AWS/GCP)',
          'Set up and maintain CI/CD pipelines',
          'Monitor system health and incident response',
          'Automate deployment and scaling processes',
          'Implement security best practices',
        ],
        techStack: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Jenkins', 'Prometheus', 'Grafana'],
        recruiter: recruiters[2]._id,
        salary: { min: 1400000, max: 2200000, currency: 'INR', period: 'yearly' },
        location: 'Remote, India',
        locationType: 'remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
        isActive: true,
        assessment: {
          enabled: false,
          criteria: [],
        },
      },
      {
        title: 'Junior Frontend Developer (Internship)',
        description: 'Great opportunity for fresh graduates or early-career developers to learn and grow in a fast-paced startup environment. You will work on real products and receive mentorship from senior engineers.',
        requirements: [
          'Basic knowledge of HTML, CSS, JavaScript',
          'Familiarity with React (coursework or projects)',
          'Eagerness to learn and grow',
          'Good communication skills',
        ],
        responsibilities: [
          'Build UI components under mentorship',
          'Fix bugs and improve existing features',
          'Participate in code reviews',
          'Learn and adopt best practices',
        ],
        techStack: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        recruiter: recruiters[1]._id,
        salary: { min: 300000, max: 500000, currency: 'INR', period: 'yearly' },
        location: 'Mumbai, India',
        locationType: 'hybrid',
        jobType: 'internship',
        experienceLevel: 'entry',
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        assessment: {
          enabled: true,
          criteria: [
            { name: 'Basics', maxScore: 10, weight: 40 },
            { name: 'Learning Ability', maxScore: 10, weight: 30 },
            { name: 'Enthusiasm', maxScore: 10, weight: 30 },
          ],
        },
      },
    ]);
    console.log(`✓ Created ${jobs.length} jobs`);

    // ── Create Applications ──
    const applications = await Application.create([
      {
        job: jobs[0]._id,
        candidate: candidates[0]._id,
        coverLetter: 'I am a full-stack developer with 3 years of experience in React and Node.js. I have built multiple production applications and am excited about the opportunity to lead engineering at TechCorp.',
        projectShowcase: [
          {
            title: 'E-Commerce Platform',
            description: 'Full-stack e-commerce with real-time inventory and Stripe integration.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            url: 'https://github.com/arjunmehta/ecommerce',
          },
        ],
        status: 'shortlisted',
      },
      {
        job: jobs[1]._id,
        candidate: candidates[1]._id,
        coverLetter: 'As a frontend specialist, I am passionate about creating beautiful, accessible web experiences. My design system library demonstrates my commitment to quality components.',
        projectShowcase: [
          {
            title: 'Design System Library',
            description: 'Accessible React component library with full Storybook docs.',
            techStack: ['React', 'TypeScript', 'TailwindCSS'],
            url: 'https://github.com/snehareddy/design-system',
          },
        ],
        status: 'reviewing',
      },
      {
        job: jobs[2]._id,
        candidate: candidates[2]._id,
        coverLetter: 'With 5 years of backend experience and AWS certification, I am well-equipped to build high-throughput payment systems. My microservices boilerplate showcases my architectural thinking.',
        status: 'applied',
      },
      {
        job: jobs[0]._id,
        candidate: candidates[1]._id,
        coverLetter: 'While I specialize in frontend, I have full-stack experience and would love to grow into a senior role at TechCorp.',
        status: 'applied',
      },
    ]);

    // Update application counts
    await Job.findByIdAndUpdate(jobs[0]._id, { applicationsCount: 2 });
    await Job.findByIdAndUpdate(jobs[1]._id, { applicationsCount: 1 });
    await Job.findByIdAndUpdate(jobs[2]._id, { applicationsCount: 1 });

    console.log(`✓ Created ${applications.length} applications`);

    // ── Create Sample Notifications ──
    await Notification.create([
      {
        recipient: recruiters[0]._id,
        type: 'application_received',
        title: 'New Application',
        message: `Arjun Mehta applied for "Senior Full-Stack Developer"`,
        relatedJob: jobs[0]._id,
        relatedApplication: applications[0]._id,
        isRead: true,
      },
      {
        recipient: recruiters[0]._id,
        type: 'application_received',
        title: 'New Application',
        message: `Sneha Reddy applied for "Senior Full-Stack Developer"`,
        relatedJob: jobs[0]._id,
        relatedApplication: applications[3]._id,
        isRead: false,
      },
      {
        recipient: candidates[0]._id,
        type: 'shortlisted',
        title: 'Application Shortlisted!',
        message: `Your application for "Senior Full-Stack Developer" has been shortlisted`,
        relatedJob: jobs[0]._id,
        relatedApplication: applications[0]._id,
        isRead: false,
      },
    ]);
    console.log('✓ Created sample notifications');

    const skillCount = await rebuildSkillCatalog();
    console.log(`✓ Built skill catalogue (${skillCount} skills)`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('   Recruiter: priya@techcorp.com / password123');
    console.log('   Recruiter: rahul@startupx.com / password123');
    console.log('   Candidate: arjun@email.com / password123');
    console.log('   Candidate: sneha@email.com / password123');
    console.log('   Candidate: vikram@email.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
