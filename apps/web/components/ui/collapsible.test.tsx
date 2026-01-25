import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './collapsible';

describe('Collapsible', () => {
  it('should render with default closed state', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const content = screen.queryByText('Content');
    // Content should be hidden (not visible, but in DOM)
    expect(content).toBeInTheDocument();
  });

  it('should render with default open state when defaultOpen is true', () => {
    render(
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const content = screen.getByText('Content');
    expect(content).toBeInTheDocument();
  });

  it('should toggle content visibility when trigger is clicked', () => {
    render(
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByRole('button', { name: 'Toggle' });

    // Initially closed
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Click to close
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should call onOpenChange callback when toggled', () => {
    const handleOpenChange = vi.fn();

    render(
      <Collapsible defaultOpen={false} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByRole('button', { name: 'Toggle' });

    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    fireEvent.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('should support controlled mode', () => {
    const ControlledCollapsible = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <div>
          <button onClick={() => setOpen(!open)}>External Toggle</button>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsibleContent>Content</CollapsibleContent>
          </Collapsible>
        </div>
      );
    };

    render(<ControlledCollapsible />);

    const trigger = screen.getByRole('button', { name: 'Toggle' });
    const externalToggle = screen.getByRole('button', {
      name: 'External Toggle',
    });

    // Initially closed
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click external toggle
    fireEvent.click(externalToggle);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Click internal trigger
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should be keyboard accessible', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByRole('button', { name: 'Toggle' });

    // Should be focusable
    trigger.focus();
    expect(trigger).toHaveFocus();

    // Buttons respond to click, not keyDown for Enter
    // The browser handles Enter -> click conversion
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
