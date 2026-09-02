import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

describe("Todo App", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("adds a task", () => {
        render(<App />);

        const input = screen.getByLabelText("New task");
        const button = screen.getByRole("button", {
            name: "Add"
        });

        fireEvent.change(input, {
            target: { value: "Learn React" }
        });

        fireEvent.click(button);

        expect(
            screen.getByText("Learn React")
        ).toBeInTheDocument();
    });

    it("shows an error for an empty task", () => {
        render(<App />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add"
            })
        );

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent("Please enter a task.");
    });

    it("completes a task", () => {
        render(<App />);

        fireEvent.change(
            screen.getByLabelText("New task"),
            {
                target: { value: "Learn React" }
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add"
            })
        );

        const checkbox = screen.getByRole("checkbox");

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(
            screen.getByText("Learn React")
        ).toHaveClass("completed");
    });

    it("deletes a task", () => {
        render(<App />);

        fireEvent.change(
            screen.getByLabelText("New task"),
            {
                target: { value: "Delete me" }
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add"
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Delete"
            })
        );

        expect(
            screen.queryByText("Delete me")
        ).not.toBeInTheDocument();
    });

    it("edits a task", () => {
        render(<App />);

        fireEvent.change(
            screen.getByLabelText("New task"),
            {
                target: { value: "Old task" }
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Add"
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Edit"
            })
        );

        const editInput = screen.getByLabelText("Edit task");

        fireEvent.change(editInput, {
            target: { value: "Updated task" }
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save"
            })
        );

        expect(
            screen.getByText("Updated task")
        ).toBeInTheDocument();
    });

    it("loads tasks from localStorage", () => {
        localStorage.setItem(
            "react-todo-tasks",
            JSON.stringify([
                {
                    id: "test-id",
                    text: "Saved task",
                    completed: false
                }
            ])
        );

        render(<App />);

        expect(
            screen.getByText("Saved task")
        ).toBeInTheDocument();
    });
});

