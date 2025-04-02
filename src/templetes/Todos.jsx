import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Todos() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const navigate = useNavigate();

    // Check if user is logged in and token validity
    useEffect(() => {
        const token = localStorage.getItem("access");

        if (token) {
            setIsLoggedIn(true);
            fetchTasks(token);  // Load tasks if logged in and token exists
        } else {
            setIsLoggedIn(false);
            navigate('/login');  // Redirect if no token
        }
    }, [navigate]);

    // Fetch tasks if the user is logged in
    const fetchTasks = async (token) => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/todos/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error.response ? error.response.data : error);

            // Check if the error is a token-related error
            if (error.response && error.response.data.code === 'token_not_valid') {
                setError("Your session has expired. Please log in again.");
                localStorage.removeItem("access"); // Clear the expired token
                setIsLoggedIn(false); // Update login status
                navigate('/login'); // Redirect to login page
            } else {
                setError("Failed to fetch tasks. Please try again.");
            }
        }
    };

    // Logout user
    const logoutUser = async () => {
        try {
            const token = localStorage.getItem("access");
            if (token) {
                await axios.post("http://127.0.0.1:8000/api/auth/logout/", {
                    refresh_token: localStorage.getItem("refresh"), // Assuming you store refresh token
                }, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });
                // Clear tokens from localStorage
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                setIsLoggedIn(false);
                navigate("/login");
            } else {
                // If there's no token, just navigate to login
                navigate("/login");
            }
        } catch (err) {
            console.error("Error logging out:", err.response ? err.response.data : err);
            setError("Error logging out. Please try again.");
        }
    };

    // Add a new task
    const addTask = async () => {
        if (title.trim() === '' || description.trim() === '') {
            setError("Both title and description are required.");
            return;
        }

        const requestBody = {
            title,
            description,
            completed: false
        };

        const token = localStorage.getItem("access");

        if (!token) {
            setError("No authentication token found. Please log in.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/todos/add/",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );
            setTasks((prevTasks) => [...prevTasks, response.data]);  // Add new task to the list
            setTitle('');
            setDescription('');
            setError('');
        } catch (error) {
            console.error("Error adding task:", error.response ? error.response.data : error);
            setError("Failed to add task. Please check your authentication.");
            navigate('/login');  // Redirect to login on failure
        }
    };

    // Update a task
    const updateTask = async (taskId, updatedTask) => {
        const token = localStorage.getItem("access");
        if (!token) {
            setError("No authentication token found.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/todos/update/${taskId}/`,
                updatedTask,
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            setTasks(tasks.map(task => (task.id === taskId ? response.data : task)));
            setEditingTask(null);
            setError('');
        } catch (error) {
            setError("Failed to update task.");
        }
    };

    // Delete a task
    const deleteTask = async (taskId) => {
        const token = localStorage.getItem("access");
        if (!token) {
            setError("No authentication token found.");
            navigate('/login');
            return;
        }

        try {
            await axios.delete(`http://127.0.0.1:8000/api/todos/delete/${taskId}/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            setTasks(tasks.filter(task => task.id !== taskId));
            setError('');
        } catch (error) {
            setError("Failed to delete task.");
        }
    };

    // Login user
    const loginUser = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
                username,
                password
            });

            const { access } = response.data;
            localStorage.setItem("access", access);
            setIsLoggedIn(true);
            setError('');
            setUsername('');
            setPassword('');
            fetchTasks(access);  // Fetch tasks after login
            navigate('/');  // Redirect to home page after successful login
        } catch (err) {
            console.error("Login error:", err.response ? err.response.data : err);
            setError("Login failed. Please check your credentials.");
        }
    };

    // If the user is not logged in, show the login form
    if (!isLoggedIn) {
        return (
            <div className="container">
                <div className="todo-app">
                    <h2>Login</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button onClick={loginUser}>Login</button>

                    {/* Register link */}
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="todo-app">
                <div className="app-title">
                    <h2>To-do app</h2>
                    <i className="fa-solid fa-book-bookmark"></i>
                </div>

                {/* Logout Button */}
                <button onClick={logoutUser} className="logout-button">
                    Logout
                </button>

                {/* Display error message */}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {/* Add Task Inputs */}
                <div className="task-inputs">
                    <div className="input-group">
                        <input
                            type="text"
                            id="input-title"
                            placeholder="Enter task title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}  // Set title on change
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            id="input-description"
                            placeholder="Enter task description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}  // Set description on change
                        />
                    </div>
                    <button onClick={addTask}>Add Task</button>
                </div>

                {/* List Tasks */}
                <ul id="list-container">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            {editingTask?.id === task.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        value={editingTask.description}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    />
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editingTask.completed}
                                            onChange={(e) => setEditingTask({ ...editingTask, completed: e.target.checked })}
                                        />
                                        Completed
                                    </label>
                                    <button onClick={() => updateTask(editingTask.id, editingTask)} style={{ backgroundColor: "green", color: "white" }}>Save</button>
                                    <button onClick={() => setEditingTask(null)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <strong>{task.title}</strong> - {task.completed ? '✅' : '❌'}
                                    <button onClick={() => setEditingTask(task)} style={{ backgroundColor: "green", color: "white", marginLeft: "10px" }}>Edit</button>
                                    <button onClick={() => deleteTask(task.id)} style={{ backgroundColor: "red", color: "white", marginLeft: "5px" }}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
}
