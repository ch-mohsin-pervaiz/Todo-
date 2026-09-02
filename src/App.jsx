import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "react-todo-tasks";
function App() {
    const [tasks, setTasks] = useState(() => {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY);
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch {
            return [];
        }
    });

    const [taskInput, setTaskInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    function addTask(event) {
        event.preventDefault();

        const taskText = taskInput.trim();

        if (taskText === "") {
            setErrorMessage("Please enter a task.");
            return;
        }

        const newTask = {
            id: crypto.randomUUID(),
            text: taskText,
            completed: false
        };

        setTasks((previousTasks) => [...previousTasks, newTask]);
        setTaskInput("");
        setErrorMessage("");
    }

    function toggleTask(id) {
        setTasks((previousTasks) =>
            previousTasks.map((task) =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    }

    function deleteTask(id) {
        setTasks((previousTasks) =>
            previousTasks.filter((task) => task.id !== id)
        );
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

        setTasks((previousTasks) =>
            previousTasks.map((task) =>
                task.id === id
                    ? { ...task, text: updatedText }
                    : task
            )
        );

        setEditingId(null);
        setEditingText("");
        setErrorMessage("");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingText("");
        setErrorMessage("");
    }

    return (
        <main className="page-container">
            <section
                className="todo-container"
                aria-labelledby="todo-title"
            >
                <h1 id="todo-title">Todo App</h1>

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

