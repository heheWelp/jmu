# JMU Learning Management System

A comprehensive learning management system (LMS) built with Next.js and Tailwind CSS for James Madison University.

## Features

- **Admin Dashboard**: Overview of key metrics, user management, content management, and quick actions
- **User Management**: Manage admins, instructors, providers, and students
- **Content Management**: Create and organize courses, learning materials, and assessments
- **Reporting**: Data visualization and analytics
- **Tag & Talk**: Discussion and collaboration platform
- **Settings**: System and user preferences configuration

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Styling**: Responsive design with Tailwind CSS
- **Authentication**: (To be implemented with Supabase)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/jmu-lms.git
cd jmu-lms
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── dashboard/        # Dashboard page
│   ├── manage-users/     # User management page
│   ├── manage-content/   # Content management page
│   ├── reports/          # Reports page
│   ├── tag-talk/         # Tag & Talk page
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (redirects to dashboard)
├── components/           # React components
│   ├── layout/           # Layout components
│   ├── features/         # Feature-specific components
│   └── shared/           # Shared/reusable components
├── assets/               # Static assets
├── hooks/                # Custom React hooks
└── utils/                # Utility functions
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
#   L M S D e v e l o p m e n t  
 