# React Todo App

A responsive Todo application built with React.js.

## Features

* Add new tasks
* Edit existing tasks
* Delete tasks
* Mark tasks as completed
* Form validation
* Save tasks to MongoDB
* Tasks remain after refreshing the page or opening the app again
* Responsive mobile layout

## Technologies

* React
* JavaScript
* Vite
* CSS
* Express
* MongoDB with Mongoose
* Vitest

## React Concepts Used

* `useState`
* `useEffect`
* JSX
* Props and state concepts
* `map()`
* `filter()`
* Controlled inputs
* Forms and `onSubmit`
* `onChange`
* `onClick`
* Conditional rendering
* Functional state updates
* Spread operator

## Installation

Clone the repository:

```bash
git clone https://github.com/ch-mohsin-pervaiz/Todo-.git
```

Open the project:

```bash
cd Todo-
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in this project directory:

```env
MONGO_URI=mongodb://localhost:27017/todo_db
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

Make sure MongoDB is running before starting the app.

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser. `npm run dev` starts both the
Express API and Vite.

## Run Tests

```bash
npm test
```

## Build for Production

```bash
npm run build
```

## Deploy to Vercel

The project includes a Vercel serverless API in `api/[...route].js`. Deploy the
repository from GitHub and use these project settings:

* Framework preset: Vite
* Build command: `npm run build`
* Output directory: `dist`

Create a MongoDB Atlas database and add this environment variable in the Vercel
project settings:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-hostname>.mongodb.net/todoDB?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/google/callback
FRONTEND_URL=https://your-project.vercel.app
```

Do not use the local MongoDB URL in production. Add the Vercel deployment IP
access or allow access from anywhere in MongoDB Atlas, depending on your
security requirements.

After deployment, the React frontend and `/api/tasks` endpoints use the same
Vercel domain.
