import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

function getInitialPage() {
    const query = new URLSearchParams(window.location.search);
    const authToken = query.get("authToken");
    const authError = query.get("authError");

    if (authToken) {
        localStorage.setItem("token", authToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        return "todo";
    }

    if (authError) {
        sessionStorage.setItem("authError", authError);
        window.history.replaceState({}, document.title, window.location.pathname);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    return localStorage.getItem("token") ? "todo" : "login";
}

function authenticatedHeaders(includeJson = false) {
    const headers = {};
    const token = localStorage.getItem("token");

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

function formatDueDate(value) {
    const dateValue = String(value).slice(0, 10);
    const [year, month, day] = dateValue.split("-").map(Number);

    if (!year || !month || !day) return dateValue;

    return new Date(year, month - 1, day).toLocaleDateString();
}

function App() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [taskInput, setTaskInput] = useState("");
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState("all");
    const [errorMessage, setErrorMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingPriority, setEditingPriority] = useState("medium");
    const [editingDueDate, setEditingDueDate] = useState("");
    const [page, setPage] = useState(getInitialPage);

    const initialAuthError = sessionStorage.getItem("authError");

    useEffect(() => {
        if (page !== "todo") {
            return;
        }

        let isCurrent = true;

        async function loadTasks() {
            try {
                const response = await fetch("/api/tasks", {
                    headers: authenticatedHeaders()
                });

                if (response.status === 401) {
                    handleSessionExpired();
                    return;
                }

                if (!response.ok) {
                    throw new Error("Could not load tasks.");
                }

                const loadedTasks = await response.json();
                if (isCurrent) setTasks(loadedTasks);
            } catch (error) {
                if (isCurrent) setErrorMessage(error.message);
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        loadTasks();
        return () => {
            isCurrent = false;
        };
    }, [page]);

    function handleSessionExpired() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTasks([]);
        setEditingId(null);
        setPage("login");
        setErrorMessage("Your session has expired. Please log in again.");
    }

    function addTask(event) {
        event.preventDefault();

        const taskText = taskInput.trim();

        if (taskText === "") {
            setErrorMessage("Please enter a task.");
            return;
        }

        fetch("/api/tasks", {
            method: "POST",
            headers: authenticatedHeaders(true),
            body: JSON.stringify({
                text: taskText,
                priority: taskPriority,
                dueDate: taskDueDate || null
            })
        })
            .then(async (response) => {
                if (response.status === 401) {
                    handleSessionExpired();
                    return;
                }

                if (!response.ok) {
                    throw new Error("Could not save task.");
                }

                const savedTask = await response.json();
                setTasks((previousTasks) => [
                    ...previousTasks,
                    savedTask
                ]);
                setTaskInput("");
                setTaskPriority("medium");
                setTaskDueDate("");
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
        fetch(`/api/tasks/${id}`, {
            method: "DELETE",
            headers: authenticatedHeaders()
        })
            .then((response) => {
                if (response.status === 401) {
                    handleSessionExpired();
                    return;
                }

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
        setEditingPriority(task.priority || "medium");
        setEditingDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
        setErrorMessage("");
    }

    function saveEdit(event, id) {
        event.preventDefault();

        const updatedText = editingText.trim();

        if (updatedText === "") {
            setErrorMessage("Task cannot be empty.");
            return;
        }

        updateTask(id, {
            text: updatedText,
            priority: editingPriority,
            dueDate: editingDueDate || null
        }, () => {
            setEditingId(null);
            setEditingText("");
            setEditingPriority("medium");
            setEditingDueDate("");
            setErrorMessage("");
        });
    }

    function updateTask(id, changes, onSuccess) {
        fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: authenticatedHeaders(true),
            body: JSON.stringify(changes)
        })
            .then(async (response) => {
                if (response.status === 401) {
                    handleSessionExpired();
                    return;
                }

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
        setEditingPriority("medium");
        setEditingDueDate("");
        setErrorMessage("");
    }

    function handleLoginSuccess() {
        setTasks([]);
        setIsLoading(true);
        setSearchText("");
        setFilter("all");
        setPage("todo");
        setErrorMessage("");
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTasks([]);
        setTaskPriority("medium");
        setTaskDueDate("");
        setSearchText("");
        setFilter("all");
        setEditingId(null);
        setEditingPriority("medium");
        setEditingDueDate("");
        setPage("login");
    }

    const normalizedSearch = searchText.trim().toLowerCase();
    const visibleTasks = tasks.filter((task) => {
        const matchesFilter =
            filter === "all" ||
            (filter === "active" && !task.completed) ||
            (filter === "completed" && task.completed);
        const matchesSearch = task.text.toLowerCase().includes(normalizedSearch);

        return matchesFilter && matchesSearch;
    });
    const activeCount = tasks.filter((task) => !task.completed).length;
    const completedCount = tasks.length - activeCount;

    if (page === "login") {
        return (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onShowSignup={() => setPage("signup")}
                initialError={initialAuthError}
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

                    <div className="task-options">
                        <label>
                            Priority
                            <select
                                value={taskPriority}
                                onChange={(event) => setTaskPriority(event.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label>
                            Due date
                            <input
                                type="date"
                                value={taskDueDate}
                                onChange={(event) => setTaskDueDate(event.target.value)}
                            />
                        </label>
                    </div>
                </form>

                <div className="task-tools">
                    <input
                        className="search-input"
                        type="search"
                        placeholder="Search tasks..."
                        aria-label="Search tasks"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                    />

                    <div className="filter-row" role="group" aria-label="Filter tasks">
                        {[
                            ["all", `All (${tasks.length})`],
                            ["active", `Active (${activeCount})`],
                            ["completed", `Completed (${completedCount})`]
                        ].map(([value, label]) => (
                            <button
                                className={filter === value ? "filter-button selected" : "filter-button"}
                                type="button"
                                key={value}
                                onClick={() => setFilter(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {errorMessage && (
                    <p
                        className="error-message"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )}

                {isLoading && <p>Loading tasks...</p>}

                {!isLoading && visibleTasks.length === 0 && (
                    <p className="empty-message">
                        {tasks.length === 0
                            ? "You have no tasks yet. Add one above to get started."
                            : "No tasks match your current search or filter."}
                    </p>
                )}

                <ul
                    className="task-list"
                    aria-label="Todo tasks"
                >
                    {visibleTasks.map((task) => (
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

                                    <div className="task-options">
                                        <label>
                                            Priority
                                            <select
                                                value={editingPriority}
                                                onChange={(event) => setEditingPriority(event.target.value)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </label>

                                        <label>
                                            Due date
                                            <input
                                                type="date"
                                                value={editingDueDate}
                                                onChange={(event) => setEditingDueDate(event.target.value)}
                                            />
                                        </label>
                                    </div>

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

                                        <div className="task-content">
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
                                            <div className="task-meta">
                                                <span className={`priority-badge priority-${task.priority || "medium"}`}>
                                                    {task.priority || "medium"}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="due-date">
                                                        Due {formatDueDate(task.dueDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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

