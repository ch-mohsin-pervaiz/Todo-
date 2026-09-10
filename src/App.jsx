import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

function App() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [taskInput, setTaskInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [page, setPage] = useState(
        () => (localStorage.getItem("token") ? "todo" : "login")
    );

    useEffect(() => {
        async function loadTasks() {
            try {
                const response = await fetch("/api/tasks");
                if (!response.ok) {
                    throw new Error("Could not load tasks.");
                }

                setTasks(await response.json());
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadTasks();
    }, []);

    function addTask(event) {
        event.preventDefault();

        const taskText = taskInput.trim();

        if (taskText === "") {
            setErrorMessage("Please enter a task.");
            return;
        }

        fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: taskText })
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Could not save task.");
                }

                const savedTask = await response.json();
                setTasks((previousTasks) => [
                    ...previousTasks,
                    savedTask
                ]);
                setTaskInput("");
                setErrorMessage("");
            })
            .catch((error) => setErrorMessage(error.message));
    }

    function toggleTask(id) {
        const task = tasks.find((item) => item.id === id);
        if (!task) return;

        updateTask(id, { completed: !task.completed });
    }

    function deleteTask(id) {
        fetch(`/api/tasks/${id}`, { method: "DELETE" })
            .then((response) => {
                if (!response.ok) throw new Error("Could not delete task.");
                setTasks((previousTasks) =>
                    previousTasks.filter((task) => task.id !== id)
                );
            })
            .catch((error) => setErrorMessage(error.message));
    }

    function startEditing(task) {
        setEditingId(task.id);
        setEditingText(task.text);
        setErrorMessage("");
    }

    function saveEdit(event, id) {
        event.preventDefault();

        const updatedText = editingText.trim();

        if (updatedText === "") {
            setErrorMessage("Task cannot be empty.");
            return;
        }

        updateTask(id, { text: updatedText }, () => {
            setEditingId(null);
            setEditingText("");
            setErrorMessage("");
        });
    }

    function updateTask(id, changes, onSuccess) {
        fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes)
        })
            .then(async (response) => {
                if (!response.ok) throw new Error("Could not update task.");
                const updatedTask = await response.json();
                setTasks((previousTasks) =>
                    previousTasks.map((task) =>
                        task.id === id ? updatedTask : task
                    )
                );
                onSuccess?.();
            })
            .catch((error) => setErrorMessage(error.message));
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingText("");
        setErrorMessage("");
    }

    function handleLoginSuccess() {
        setPage("todo");
        setErrorMessage("");
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTasks([]);
        setPage("login");
    }

    if (page === "login") {
        return (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onShowSignup={() => setPage("signup")}
            />
        );
    }

    if (page === "signup") {
        return (
            <Signup
                onSignupSuccess={() => setPage("login")}
                onShowLogin={() => setPage("login")}
            />
        );
    }

    return (
        <main className="page-container">
            <section
                className="todo-container"
                aria-labelledby="todo-title"
            >
                <div className="todo-header">
                    <h1 id="todo-title">Todo App</h1>
                    <button
                        className="logout-button"
                        type="button"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>

                <form
                    className="input-section"
                    onSubmit={addTask}
                >
                
                    <div className="input-row">
                        <input
                            id="taskInput"
                            type="text"
                            placeholder="Enter a task..."
                            value={taskInput}
                            onChange={(event) => {
                                setTaskInput(event.target.value);

                                if (errorMessage) {
                                    setErrorMessage("");
                                }
                            }}
                        />

                        <button type="submit">
                            Add
                        </button>
                    </div>
                </form>

                {errorMessage && (
                    <p
                        className="error-message"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )}

                {isLoading && <p>Loading tasks...</p>}

                <ul
                    className="task-list"
                    aria-label="Todo tasks"
                >
                    {tasks.map((task) => (
                        <li
                            className="task-item"
                            key={task.id}
                        >
                            {editingId === task.id ? (
                                <form
                                    className="edit-form"
                                    onSubmit={(event) =>
                                        saveEdit(event, task.id)
                                    }
                                >
                                    <label htmlFor={`edit-${task.id}`}>
                                        Edit task
                                    </label>

                                    <input
                                        id={`edit-${task.id}`}
                                        type="text"
                                        value={editingText}
                                        onChange={(event) =>
                                            setEditingText(
                                                event.target.value
                                            )
                                        }
                                        autoFocus
                                    />

                                    <div className="task-actions">
                                        <button type="submit">
                                            Save
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="task-left">
                                        <input
                                            id={`task-${task.id}`}
                                            type="checkbox"
                                            className="task-checkbox"
                                            checked={task.completed}
                                            onChange={() =>
                                                toggleTask(task.id)
                                            }
                                        />

                                        <label
                                            htmlFor={`task-${task.id}`}
                                            className={
                                                task.completed
                                                    ? "task-text completed"
                                                    : "task-text"
                                            }
                                        >
                                            {task.text}
                                        </label>
                                    </div>

                                    <div className="task-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEditing(task)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteTask(task.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>

            </section>
        </main>
    );
}

export default App;

