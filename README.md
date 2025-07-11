# 🎯 Campus Find - University Lost & Found Portal

CampusFind is a web-based Lost & Found platform designed to help students easily report, search, and recover lost items on campus. Built as part of my 4th semester mini project, the app streamlines the process of connecting lost belongings with their rightful owners.

Live Demo 👉 https://campus-find-kappa.vercel.app

## ✨ Features

- 🔐 **Secure Authentication** - Email/password with Firebase Auth
- 📱 **Responsive Design** - Mobile-first with bottom navigation
- 🔍 **Smart Search & Filters** - Find items quickly with advanced filtering
- 📸 **Free Image Upload** - Cloudinary integration (25GB free tier)
- 👥 **Role-Based Access** - User and Admin roles with different permissions
- 🛡️ **Admin Panel** - Complete moderation and analytics dashboard
- ⚡ **Real-time Updates** - Live data with Firestore
- 🎨 **Modern UI** - Clean design with smooth animations
- 💰 **Cost-Effective** - Uses only free tiers (Firebase + Cloudinary)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase project (free tier)
- Cloudinary account (free tier - optional)
- Vercel account (for deployment)

### 1. Clone & Install

\`\`\`bash
git clone <your-repo>
cd campus-find
npm install
\`\`\`

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Get your web app configuration

### 3. Cloudinary Setup (Optional but Recommended)

1. Create a free account at [Cloudinary](https://cloudinary.com/users/register/free)
2. Get your Cloud Name from the dashboard
3. Create an upload preset named `campus_find` (unsigned mode)

### 4. Environment Variables

Create `.env.local` with your configuration:

\`\`\`env
# Firebase Config (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Config (Optional - for better image handling)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
\`\`\`

### 5. Configure Admin Access

Update `lib/auth.ts` to add your admin email:

\`\`\`typescript
const ADMIN_EMAILS = ["your-admin@university.edu"]
\`\`\`

### 6. Firestore Security Rules

Copy the rules from the setup page to your Firestore Database → Rules

### 7. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## 🔑 Admin Panel Access

- Admin users are defined in `lib/auth.ts`
- Access the admin panel at `/admin`
- Default admin emails: `admin@university.edu`, `campusfind.admin@university.edu`

## 📱 Pages & Features

- **Landing Page** (`/`) - Authentication and features overview
- **Dashboard** (`/dashboard`) - Browse and search items
- **Report Item** (`/report`) - Submit lost/found items with image upload
- **Item Details** (`/item/[id]`) - View item details and submit claims
- **Profile** (`/profile`) - User dashboard and settings
- **Admin Panel** (`/admin`) - Admin-only moderation tools
- **Setup Guide** (`/setup`) - Complete setup instructions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Firebase Firestore (free tier)
- **Authentication**: Firebase Auth (free tier)
- **Image Storage**: Cloudinary (25GB free tier)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

## 💰 Cost Breakdown

- **Firebase**: Free tier includes 50K reads/20K writes per day
- **Cloudinary**: 25GB storage, 25GB bandwidth per month (free)
- **Vercel**: Free tier for hobby projects
- **Total Monthly Cost**: $0 for typical university usage

## 🔒 Security Features

- Protected routes with authentication
- Role-based access control
- Firestore security rules
- Input validation and sanitization
- Secure file uploads with Cloudinary

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will be live at your Vercel URL.

## 🖼️ Image Handling

- **With Cloudinary**: Automatic optimization, 25GB free storage
- **Without Cloudinary**: Base64 storage in Firestore (1MB limit per image)
- **Fallback**: Graceful degradation if image upload fails

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the setup guide at `/setup`
2. Review Firebase configuration
3. Check browser console for errors
4. Verify environment variables

## 🔧 Troubleshooting

### Common Issues

1. **Images not uploading**: Check Cloudinary configuration and upload preset
2. **Authentication errors**: Verify Firebase config and enable Email/Password auth
3. **Database permission errors**: Check Firestore security rules
4. **Build errors**: Ensure all environment variables are set

---

Built with ❤️ for university communities
