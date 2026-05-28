# LearnFlow — Learning Management System

A full-stack Learning Management System where students can discover, purchase, and learn from courses, and educators can create and manage their content. Built with React, Node.js, MongoDB, and integrated with Clerk for auth, Stripe for payments, Cloudinary for media, and Groq AI for personalized learning paths.

---

## What it does

Students can browse courses, watch free previews, purchase courses via Stripe, track their progress lecture by lecture, and rate courses they've completed. There's also an AI-powered feature that takes a student's learning goal and generates a personalized step-by-step course roadmap — plus a chat assistant to answer questions about topics in their path.

Educators get their own dashboard where they can add courses with rich text descriptions, upload thumbnails to Cloudinary, organize content into chapters and lectures, set a priority score for AI ordering, and track their earnings and enrolled students.

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- React Router DOM
- Clerk (authentication UI)
- Axios
- Quill (rich text editor for course descriptions)
- Stripe.js (checkout redirect)
- React Toastify

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Clerk Express (JWT verification middleware)
- Stripe (payment + webhooks)
- Cloudinary + Multer (image/video uploads)
- Svix (Clerk webhook verification)
- Groq API (AI course flow + chat)

---

## Project Structure

```
├── client/          # React frontend
│   └── src/
│       ├── Pages/
│       │   ├── Student/     # Home, CourseList, CourseDetails, Player, MyEnrollments, AiCourseFlow
│       │   └── Educator/    # Dashboard, AddCourse, MyCourses, StudentEnrolled
│       ├── Components/
│       │   ├── Student/     # Navbar, Hero, CourseCard, Footer, etc.
│       │   └── Educator/    # Navbar, Sidebar, Footer
│       └── Context/         # AppContext (global state)
│
└── server/          # Express backend
    ├── Controlles/  # UserController, CourseControll, Educator.Controller, Webhook
    ├── models/      # User, Course, Purchase, CourseProgress
    ├── Routes/      # UserRoutes, CourseRoute, Educator.routes
    ├── Middleware/  # authMiddleware (Clerk role check)
    ├── Config/      # Cloudinary, Multer
    └── server.js
```

---

## How it works

### Authentication
Clerk handles all auth — signup, login, session management. When a user signs up, Clerk fires a webhook to the backend which creates a matching user document in MongoDB. The backend uses Clerk's Express middleware to verify JWTs on protected routes.

### Course Purchase Flow
1. Student clicks "Enroll" on a course
2. Backend creates a pending `Purchase` record and initiates a Stripe Checkout session
3. Student completes payment on Stripe's hosted page
4. Stripe fires a `payment_intent.succeeded` webhook to the backend
5. Backend marks the purchase as completed, adds the course to the user's enrolled list, and adds the student to the course's enrolled students

### Educator Flow
Any user can become an educator by clicking a button — this updates their Clerk `publicMetadata.role` to `educator`. From there they can add courses with chapters, lectures, thumbnails, pricing, and a priority score. Courses are stored in MongoDB with nested chapter/lecture schemas.

### AI Course Flow
When a student submits a learning goal, the backend fetches all published courses, builds a structured prompt with course metadata, and sends it to Groq's LLaMA 3.3 70B model. The AI returns a JSON roadmap with ordered steps, importance notes, focus chapters, and learning objectives. Topics not available on the platform are filtered out on the frontend. After the roadmap loads, a chat assistant becomes available — it's context-aware of the student's goal and all platform courses.

### Progress Tracking
Lecture completions are stored in a `CourseProgress` collection keyed by userId + courseId. The player page reads and writes progress as students watch lectures.



---

## Routes

**Frontend**
```
/                          Home
/course-list               All courses
/course-list/:input        Filtered courses
/course/:id                Course details
/my-enrollments            Student enrollments
/player/:courseID          Course player
/ai-flow                   AI roadmap
/educator                  Educator dashboard
/educator/add-course       Add course
/educator/my-courses       Manage courses
/educator/student-enrolled Enrolled students
```

**Backend**
```
POST   /clerk                              Clerk user sync webhook
POST   /stripe                             Stripe payment webhook

GET    /api/course/all                     All published courses
GET    /api/course/:id                     Single course
POST   /api/course/ai-flow                 AI course roadmap
POST   /api/course/ai-chat                 AI chat assistant

GET    /api/user/data                      Current user data
GET    /api/user/enrolled-courses          User enrollments
POST   /api/user/purchase                  Initiate checkout
POST   /api/user/update-course-progress    Mark lecture complete
POST   /api/user/get-course-progress       Get course progress
POST   /api/user/add-rating                Rate a course

GET    /api/educator/update-role           Become educator
POST   /api/educator/add-course            Add new course
GET    /api/educator/courses               Educator's courses
GET    /api/educator/dashboard             Earnings & stats
GET    /api/educator/enrolled-students     Student list
```
