import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import Todos from "../templetes/Todos";
import config from "../config";
import MockAdapter from "axios-mock-adapter";

// Mock axios
const mock = new MockAdapter(axios);

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <Todos />
        </BrowserRouter>
    );
};

describe("Todos Component", () => {
    beforeEach(() => {
        localStorage.clear();
        mock.reset();
    });

    test("redirects to login if no authentication token is found", () => {
        renderComponent();
        expect(screen.getAllByText("Login").length).toBeGreaterThan(0);
    });

    test("fetches and displays tasks when authenticated", async () => {
        localStorage.setItem("access", "fake-jwt-token");

        mock.onGet(`${config.BASE_URL}/api/todos/`).reply(200, [
            { id: 1, title: "Test Task", description: "Test Desc", completed: false }
        ]);

        renderComponent();

        await waitFor(() => expect(screen.getByText("Test Task")).toBeInTheDocument());
    });

    test("allows adding a new task", async () => {
        localStorage.setItem("access", "fake-jwt-token");

        mock.onPost(`${config.BASE_URL}/api/todos/add/`).reply(201, {
            id: 2,
            title: "New Task",
            description: "New Task Desc",
            completed: false,
        });

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("Enter task title"), { target: { value: "New Task" } });
        fireEvent.change(screen.getByPlaceholderText("Enter task description"), { target: { value: "New Task Desc" } });

        fireEvent.click(screen.getByText("Add Task"));

        await waitFor(() => expect(screen.getByText("New Task")).toBeInTheDocument());
    });

    test("allows editing a task", async () => {
        localStorage.setItem("access", "fake-jwt-token");

        mock.onGet(`${config.BASE_URL}/api/todos/`).reply(200, [
            { id: 3, title: "Editable Task", description: "Old Desc", completed: false }
        ]);

        mock.onPut(`${config.BASE_URL}/api/todos/update/3/`).reply(200, {
            id: 3,
            title: "Updated Task",
            description: "Updated Desc",
            completed: false,
        });

        renderComponent();

        await waitFor(() => fireEvent.click(screen.getByText("Edit")));

        fireEvent.change(screen.getByDisplayValue("Editable Task"), { target: { value: "Updated Task" } });
        fireEvent.change(screen.getByDisplayValue("Old Desc"), { target: { value: "Updated Desc" } });

        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => expect(screen.getByText("Updated Task")).toBeInTheDocument());
    });

    test("allows deleting a task", async () => {
        localStorage.setItem("access", "fake-jwt-token");

        mock.onGet(`${config.BASE_URL}/api/todos/`).reply(200, [
            { id: 4, title: "Task to Delete", description: "Will be removed", completed: false }
        ]);

        mock.onDelete(`${config.BASE_URL}/api/todos/delete/4/`).reply(204);

        renderComponent();

        await waitFor(() => fireEvent.click(screen.getByText("Delete")));

        await waitFor(() => expect(screen.queryByText("Task to Delete")).not.toBeInTheDocument());
    });
});
