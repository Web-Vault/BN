# BN - Investment & Business Networking Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![React](https://img.shields.io/badge/React-v18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-green)

[![Deploy to Heroku](https://img.shields.io/badge/Deploy%20to-Heroku-purple)](https://heroku.com)
[![Deploy to Vercel](https://img.shields.io/badge/Deploy%20to-Vercel-black)](https://vercel.com)

</div>

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Detailed Features](#-detailed-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)
- [User Guide](#-user-guide)
- [Feature Guide](#-feature-guide)

## 🌟 Overview

BN is a comprehensive investment and business networking platform that connects investors with business seekers. The platform facilitates secure investments, business networking, and professional growth opportunities in a modern, user-friendly environment.

### 🎯 Platform Goals
- Connect investors with promising business opportunities
- Enable secure and transparent investment processes
- Foster professional networking and business growth
- Provide real-time updates and notifications
- Ensure user data security and privacy

## ✨ Key Features

### 🏢 Business & Investment Management
- **Investment Opportunities**
  - Create and manage investment requests
  - Real-time investment tracking
  - Automated funding status updates
  - Investment deadline management
  - Returns calculation and tracking

- **Business Networking**
  - Professional profile management
  - Business information management
  - Industry-specific networking
  - Connection requests and management
  - Business opportunity sharing

### 👥 User Management
- **Authentication & Security**
  - Multi-factor authentication (Email & Mobile OTP)
  - Secure password management
  - Role-based access control (Investor/Seeker)
  - Session management
  - Profile verification system

- **User Profiles**
  - Comprehensive business profiles
  - Professional achievements showcase
  - Industry expertise highlighting
  - Portfolio management
  - Profile search and discovery

- **Membership System**
  - **Membership Tiers**
    - Basic (Free)
      - Limited feature access
      - Basic networking capabilities
      - Standard support
      - Community access
    
    - Pro (Paid)
      - Full feature access
      - Advanced networking tools
      - Priority support
      - Premium community features
      - Enhanced analytics
      - Exclusive events access

  - **Membership Management**
    - Upgrade to Pro
      - One-time payment
      - Immediate feature access
      - Pro benefits activation
      - Payment processing
      - Receipt generation
    
    - Downgrade to Basic
      - Non-refundable process
      - Immediate feature restriction
      - Data preservation
      - Account continuity
      - Basic feature access
    
    - Membership Cancellation
      - Cancel Pro membership
      - Account preservation
      - Data retention
      - Basic access maintained
      - Re-subscription option

  - **Account Continuity**
    - Account preservation after cancellation
    - Data retention policy
    - Re-subscription process
    - Feature access management
    - Payment history tracking

### 💼 Investment Features
- **Investment Process**
  - Investment request creation
  - Real-time funding tracking
  - Automated status updates
  - Investment deadline management
  - Returns calculation and distribution

- **Referral System**
  - Referral program management
  - Automated reward distribution
  - Referral tracking and analytics
  - Thank you slip generation
  - Referral status monitoring

### 📊 Activity & Analytics
- **Activity Tracking**
  - Real-time activity feed
  - Investment activity logging
  - User interaction tracking
  - System notifications
  - Activity analytics

- **Reporting System**
  - Investment performance reports
  - User activity reports
  - Financial analytics
  - Business growth metrics
  - Custom report generation

### 🔔 Notification System
- **Real-time Notifications**
  - Investment updates
  - Connection requests
  - System alerts
  - Activity notifications
  - Custom notification preferences

### 🤝 Networking Features
- **Professional Networking**
  - Connection management
  - Business opportunity sharing
  - Industry-specific networking
  - Professional messaging
  - Network analytics

### 📱 User Interface
- **Modern Design**
  - Responsive layout for all devices
  - Intuitive navigation
  - Real-time updates
  - Interactive dashboards
  - Customizable themes

- **User Experience**
  - Streamlined investment process
  - Easy profile management
  - Quick connection requests
  - Efficient search functionality
  - Mobile-first approach

### 🏢 Chapter Management (New)
- **Chapter Creation & Management**
  - Create and manage professional chapters
  - Chapter member management
  - Chapter posts and activities
  - Chapter events and meetings
  - Chapter analytics and reporting
  - Region-based chapter organization
  - Unique chapter technology per region
  - Single chapter membership per user

- **Chapter Rules & Restrictions**
  - Region-based Chapter Creation
    - Chapters are organized by geographical regions/states
    - One unique chapter technology per region
    - No duplicate chapter technologies within same region
    - Automatic region validation during chapter creation
  
  - User Chapter Membership
    - Users can only join chapters in their region
    - One chapter membership per user
    - Cannot create or join multiple chapters
    - Region verification during chapter joining
    - Automatic membership validation

  - Chapter Technology
    - Unique technology focus per region
    - Technology validation during chapter creation
    - Prevents duplicate technology chapters in same region
    - Technology-based chapter discovery

- **Meeting Management**
  - Schedule online/offline meetings
  - Real-time attendance tracking
  - Meeting status updates (upcoming/ongoing/completed)
  - Meeting analytics and reports
  - Meeting link management for online meetings

- **Event Management**
  - Create and manage chapter events
  - Event registration and booking
  - Capacity management
  - Entry fee handling
  - Event analytics and reporting

## 🛠 Tech Stack

### Frontend
- **Core**
  - React.js (v18+)
  - Redux Toolkit (State Management)
  - React Router v6 (Routing)
  - Axios (HTTP Client)
  - Material-UI/Tailwind CSS (Styling)

- **Development Tools**
  - ESLint (Code Linting)
  - Prettier (Code Formatting)
  - Jest & React Testing Library
  - Webpack (Module Bundling)
  - Babel (JavaScript Compiler)

### Backend
- **Core**
  - Node.js (v14+)
  - Express.js (Web Framework)
  - MongoDB (Database)
  - Mongoose (ODM)
  - JWT (Authentication)

- **Development Tools**
  - Nodemon (Development)
  - Jest (Testing)
  - Swagger (API Documentation)
  - Winston (Logging)
  - Helmet (Security)

### DevOps & Infrastructure
- **Version Control**
  - Git
  - GitHub Actions (CI/CD)

- **Deployment**
  - Docker (Containerization)
  - AWS/Heroku/Vercel (Hosting)
  - MongoDB Atlas (Database)
  - Cloudflare (CDN)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.4.0 or higher)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/web-vault/BN.git
   cd BN
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the environment variables as needed

4. **Start the development servers**
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend server (from frontend directory)
   npm start
   ```

## 📁 Project Structure

```
BN/
├── frontend/                    # React frontend application
│   ├── public/                 # Static files
│   │   ├── index.html         # HTML template
│   │   ├── favicon.ico        # Favicon
│   │   └── manifest.json      # Web app manifest
│   │
│   ├── src/                   # Source files
│   │   ├── components/        # Reusable components
│   │   │   ├── common/       # Common UI components
│   │   │   ├── layout/       # Layout components
│   │   │   └── forms/        # Form components
│   │   │
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── chapters/       # Chapter management pages
│   │   │   ├── community/         # community pages
│   │   │   ├── investments/   # Investment pages
│   │   │   ├── network/    # network pages
│   │   │   ├── profiles/    # Dashboard pages
│   │   │   └── utility/      # utility pages
│   │   │
│   │   ├── App.js            # Root component
│   │   ├── App.css           # App styles
│   │   ├── index.js          # Entry point
│   │   ├── index.css         # Global styles
│   │   ├── setupTests.js     # Test setup
│   │   └── reportWebVitals.js # Performance monitoring
│   │
│   ├── package.json          # Frontend dependencies
│   └── README.md             # Frontend documentation
│
├── backend/                   # Node.js backend application
│   ├── config/               # Configuration files
│   │   └── db.js            # Database configuration
│   │
│   ├── controllers/          # Route controllers
│   │   ├── activityController.js
│   │   ├── chapterController.js
│   │   ├── eventController.js
│   │   ├── investmentController.js
│   │   ├── meetingController.js
│   │   ├── notificationController.js
│   │   ├── postController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   │
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.js
│   │
│   ├── models/               # Database models
│   │   ├── activity.js
│   │   ├── business.js
│   │   ├── chapter.js
│   │   ├── comments.js
│   │   ├── connection.js
│   │   ├── event.js
│   │   ├── investment.js
│   │   ├── meeting.js
│   │   ├── meetingAttendence.js
│   │   ├── notification.js
│   │   ├── posts.js
│   │   ├── referral.js
│   │   ├── userActivity.js
│   │   ├── users.js
│   │   └── withdrawal.js
│   │
│   ├── routes/               # API routes
│   │   ├── activityRoutes.js
│   │   ├── chapterRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── investmentRoutes.js
│   │   ├── meetingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── postRoutes.js
│   │   ├── referralRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── seeder/               # Database seeders
│   │   └── seeder.js
│   │
│   ├── index.js              # Entry point
│   └── package.json          # Backend dependencies
│
├── package.json              # Root package.json
├── package-lock.json         # Dependency lock file
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bn

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
OTP_SECRET=your_otp_secret

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# SMS Service
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=BN

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development

# Authentication
REACT_APP_JWT_EXPIRE=30d

# External Services
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_key

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

## 📚 API Documentation

The API documentation is available at `/api-docs` when running the backend server. It includes:
- Authentication endpoints
- User management
- Data operations
- Error handling

### New API Endpoints

#### Chapter Management
- `POST /api/chapters` - Create new chapter (with region and technology validation)
- `GET /api/chapters/:id` - Get chapter details
- `PUT /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter
- `POST /api/chapters/:id/join` - Join chapter (with region and membership validation)
- `POST /api/chapters/:id/leave` - Leave chapter
- `GET /api/chapters/region/:region` - Get chapters by region
- `GET /api/chapters/technology/:tech` - Get chapters by technology
- `GET /api/chapters/user/membership` - Get user's chapter membership status

#### Meeting Management
- `POST /api/chapters/:id/meetings` - Create meeting
- `GET /api/chapters/:id/meetings` - Get chapter meetings
- `PUT /api/chapters/:id/meetings/:meetingId` - Update meeting
- `DELETE /api/chapters/:id/meetings/:meetingId` - Delete meeting
- `POST /api/chapters/:id/meetings/:meetingId/join` - Join meeting
- `POST /api/chapters/:id/meetings/:meetingId/leave` - Leave meeting
- `GET /api/chapters/:id/meetings/:meetingId/attendance` - Get meeting attendance

#### Event Management
- `POST /api/chapters/:id/events` - Create event
- `GET /api/chapters/:id/events` - Get chapter events
- `PUT /api/chapters/:id/events/:eventId` - Update event
- `DELETE /api/chapters/:id/events/:eventId` - Delete event
- `POST /api/chapters/:id/events/:eventId/book` - Book event
- `GET /api/chapters/:id/events/:eventId/bookings` - Get event bookings

#### Membership Management
- `POST /api/membership/upgrade` - Upgrade to Pro membership
- `POST /api/membership/downgrade` - Downgrade to Basic membership
- `POST /api/membership/cancel` - Cancel Pro membership
- `GET /api/membership/status` - Get current membership status
- `GET /api/membership/history` - Get membership history
- `POST /api/membership/resubscribe` - Re-subscribe to Pro membership
- `GET /api/membership/features` - Get available features by tier

## 💻 Development

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Follow Git flow branching strategy

### Best Practices
- Write clean, maintainable code
- Document your code
- Write unit tests
- Follow the DRY principle
- Use meaningful variable names

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
```

### Deployment Options
- **Cloud Platforms**
  - AWS (EC2, S3, RDS)
  - Heroku
  - DigitalOcean
  - Google Cloud Platform

- **Frontend Hosting**
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - GitHub Pages

- **Database**
  - MongoDB Atlas
  - AWS DocumentDB
  - Self-hosted MongoDB

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Security scanning
- Automated deployment
- Environment management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, email support@bn.com or join our Slack channel.

## 📈 Performance Optimization

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization and caching
- Service worker implementation
- Bundle size optimization
- Performance monitoring

### Backend Optimization
- Database indexing
- Query optimization
- Caching strategies
- Rate limiting
- Load balancing

## 🔒 Security Measures

### Application Security
- JWT token encryption
- Password hashing (bcrypt)
- CORS protection
- XSS prevention
- CSRF protection
- Rate limiting
- Input validation
- SQL injection prevention

### Data Security
- Data encryption at rest
- Secure data transmission (HTTPS)
- Regular security audits
- GDPR compliance
- Data backup strategies

## 📖 User Guide

### Getting Started

#### 1. Registration & Onboarding
1. **Create Your Account**
   - Visit the registration page
   - Enter your email address
   - Verify your email with OTP
   - Set up your password
   - Complete basic profile information

2. **Mobile Verification**
   - Add your mobile number
   - Verify using SMS OTP
   - This step is required for full platform access

3. **Profile Setup**
   - Complete your personal information
   - Add professional details
   - Optionally add business information
   - Upload profile picture
   - Add your location

#### 2. Building Your Network

1. **Connections**
   - Search for users by name, location, or industry
   - Send connection requests
   - Accept or reject incoming requests
   - View your network in the connections section
   - Filter connections by various criteria

2. **Chapters**
   - Browse available chapters
   - Send join requests to chapter creators
   - Participate in chapter discussions
   - Share posts within chapters
   - Create your own chapter (if eligible)

3. **Community Engagement**
   - Share posts in the community section
   - View and celebrate member birthdays
   - Welcome new members
   - Participate in community discussions
   - Create and join events

#### 3. Investment & Funding

1. **For Business Seekers**
   - Create funding requests
   - Set investment amount and returns
   - Define investment deadline
   - Track funding progress
   - Manage investor communications

2. **For Investors**
   - Browse available investment opportunities
   - Review seeker profiles and proposals
   - Make investments
   - Track returns
   - Withdraw earnings after deadline

3. **Transaction Management**
   - View complete transaction history
   - Track investments and returns
   - Monitor withdrawal status
   - Generate financial reports

#### 4. Referral Program

1. **Sharing Referrals**
   - Access your unique referral code
   - Share with potential new members
   - Track referral status
   - Monitor reward eligibility

2. **Referral Rewards**
   - Receive rewards for successful referrals
   - Track reward status
   - View thank you slips
   - Monitor referral completion

#### 5. Activities & Events

1. **Activity Management**
   - View your activity timeline
   - Create custom activities
   - Send thank you slips
   - Track activity verification status

2. **Meetings & Events**
   - Create chapter meetings
   - Track meeting attendance
   - Host chapter events
   - Participate in community events

#### 6. Notifications & Updates

1. **Notification Center**
   - View all platform notifications
   - Track connection requests
   - Monitor investment updates
   - Receive activity alerts
   - Get meeting reminders

2. **Report Center**
   - Access account reports
   - View investment analytics
   - Track network growth
   - Monitor financial performance

### Best Practices

1. **Profile Management**
   - Keep your profile updated
   - Add professional achievements
   - Share relevant business information
   - Maintain active engagement

2. **Networking**
   - Regularly check connection requests
   - Engage in chapter discussions
   - Participate in community events
   - Share valuable insights

3. **Investment**
   - Review investment opportunities carefully
   - Set realistic funding goals
   - Maintain transparent communication
   - Track all transactions

4. **Security**
   - Keep your login credentials secure
   - Verify all transactions
   - Report suspicious activities
   - Update contact information promptly

## 🤝 Feature Guide

### Investment Platform
- **Investment Opportunities**
  - Browse investment opportunities
  - Review seeker profiles and proposals
  - Make investments
  - Track returns
  - Withdraw earnings after deadline

### Business Networking
- **Connections**
  - Send and receive connection requests
  - Accept/reject connection requests
  - View connection status
  - Filter connections by location
  - Network analytics

- **Chapters**
  - Create and manage chapters
  - Join chapter requests
  - Chapter-specific posts
  - Chapter member management
  - Chapter events and meetings

- **Community Features**
  - Global community posts
  - Birthday celebrations
  - Recent joiners showcase
  - Community announcements
  - Global networking opportunities

### Investment & Funding
- **Investment Platform**
  - Create funding requests (Seekers)
  - Browse investment opportunities
  - Real-time investment tracking
  - Automated returns calculation
  - Investment deadline management
  - Withdrawal system for returns

- **Transaction Management**
  - Complete transaction history
  - Investment tracking
  - Returns monitoring
  - Withdrawal management
  - Financial analytics

### Referral System
- **Referral Program**
  - Unique referral codes
  - Referral tracking
  - Automated reward distribution
  - Referral status monitoring
  - Thank you slip generation

### Activity & Engagement
- **Activity Tracking**
  - Account activities
  - Investment activities
  - Meeting records
  - Thank you slips
  - Custom activity creation
  - Activity verification system

- **Notification System**
  - Real-time notifications
  - Activity updates
  - Connection requests
  - Investment alerts
  - Meeting reminders
  - Birthday notifications

### Events & Meetings
- **Chapter Events**
  - Event creation and management
  - Event registration
  - Event notifications
  - Event analytics

- **Meeting Management**
  - Meeting scheduling
  - Attendance tracking
  - Meeting reports
  - Meeting notifications

### Reporting & Analytics
- **Platform Reports**
  - Account performance
  - Investment analytics
  - Network growth
  - Activity reports
  - Financial summaries

---

<div align="center">
Made with ❤️ by BN Team

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/BN)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/bn)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/bn)
</div>
