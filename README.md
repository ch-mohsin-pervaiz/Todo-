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




