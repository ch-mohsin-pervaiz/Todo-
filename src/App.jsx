import { useState } from "react";
import "./App.css";

function App() {
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function addTask() {
        const taskText = taskInput.trim();

        if (taskText === "") {
            setErrorMessage("Please enter a task.");
            return;
        }

        setErrorMessage("");

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        setTasks([...tasks, newTask]);

        setTaskInput("");
    }

    function toggleTask(id) {
        setTasks(
            tasks.map(function(task) {
                if (task.id === id) {
                    return {
                        ...task,
                        completed: !task.completed
                    };
                }

                return task;
            })
        );
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            addTask();
        }
    }

    return (
        <div className="todo-container">

            <h1>Todo App</h1>

            <div className="input-section">

                <input
                    type="text"
                    placeholder="Enter a task..."
                    value={taskInput}
                    onChange={(event) => setTaskInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button onClick={addTask}>
                    Add
                </button>

            </div>

            <p className="error-message">
                {errorMessage}
            </p>

            <ul className="task-list">

                {tasks.map(function(task) {

                    return (
                        <li className="task-item" key={task.id}>

                            <div className="task-left">

                                <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                />

                                <span
                                    className={
                                        task.completed
                                            ? "task-text completed"
                                            : "task-text"
                                    }
                                >
                                    {task.text}
                                </span>

                            </div>

                        </li>
                    );

                })}

            </ul>

        </div>
    );
}

export default App;