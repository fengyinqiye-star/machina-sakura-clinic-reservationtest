import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeSlotButton from "@/components/molecules/TimeSlotButton";

describe("TimeSlotButton", () => {
  it("should render the time label", () => {
    render(
      <TimeSlotButton
        time="10:00"
        available={true}
        selected={false}
        onClick={() => {}}
      />,
    );
    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("should be disabled when not available", () => {
    render(
      <TimeSlotButton
        time="10:00"
        available={false}
        selected={false}
        onClick={() => {}}
      />,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should be enabled when available", () => {
    render(
      <TimeSlotButton
        time="10:00"
        available={true}
        selected={false}
        onClick={() => {}}
      />,
    );
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <TimeSlotButton
        time="10:00"
        available={true}
        selected={false}
        onClick={handleClick}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("should not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <TimeSlotButton
        time="10:00"
        available={false}
        selected={false}
        onClick={handleClick}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show double-circle indicator when availableStaffCount >= 2', () => {
    const { container } = render(
      <TimeSlotButton
        time="10:00"
        available={true}
        selected={false}
        availableStaffCount={3}
        onClick={() => {}}
      />,
    );
    expect(container.textContent).toContain("◎");
    expect(container.textContent).toContain("残3枠");
  });

  it('should show triangle indicator when availableStaffCount === 1', () => {
    const { container } = render(
      <TimeSlotButton
        time="10:00"
        available={true}
        selected={false}
        availableStaffCount={1}
        onClick={() => {}}
      />,
    );
    expect(container.textContent).toContain("△");
    expect(container.textContent).toContain("残1枠");
  });

  it('should show X indicator when not available', () => {
    const { container } = render(
      <TimeSlotButton
        time="10:00"
        available={false}
        selected={false}
        availableStaffCount={0}
        onClick={() => {}}
      />,
    );
    // The X indicator does not show "残X枠"
    expect(container.textContent).toContain("×");
  });

  it("should apply selected styles when selected", () => {
    render(
      <TimeSlotButton
        time="10:00"
        available={true}
        selected={true}
        onClick={() => {}}
      />,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-sakura-400");
  });

  it("should not show remaining count text when unavailable", () => {
    const { container } = render(
      <TimeSlotButton
        time="10:00"
        available={false}
        selected={false}
        availableStaffCount={0}
        onClick={() => {}}
      />,
    );
    expect(container.textContent).not.toContain("残");
  });
});
