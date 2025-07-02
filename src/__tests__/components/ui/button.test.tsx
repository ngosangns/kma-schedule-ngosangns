import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('should render children correctly', () => {
    render(<Button>Test Button</Button>)
    
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  describe('variants', () => {
    it('should apply default variant classes', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button', { name: 'Default' })
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">Destructive</Button>)
      
      const button = screen.getByRole('button', { name: 'Destructive' })
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button', { name: 'Outline' })
      expect(button).toHaveClass('border', 'border-input', 'bg-background')
    })

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button', { name: 'Secondary' })
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button', { name: 'Ghost' })
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    })

    it('should apply link variant classes', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button', { name: 'Link' })
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })
  })

  describe('sizes', () => {
    it('should apply default size classes', () => {
      render(<Button size="default">Default Size</Button>)
      
      const button = screen.getByRole('button', { name: 'Default Size' })
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button', { name: 'Small' })
      expect(button).toHaveClass('h-9', 'px-3')
    })

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button', { name: 'Large' })
      expect(button).toHaveClass('h-11', 'px-8')
    })

    it('should apply icon size classes', () => {
      render(<Button size="icon">Icon</Button>)
      
      const button = screen.getByRole('button', { name: 'Icon' })
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  it('should merge custom className with default classes', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('Ref Button')
  })

  it('should pass through HTML button attributes', () => {
    render(
      <Button 
        type="submit" 
        name="test-button" 
        value="test-value"
        data-testid="custom-button"
      >
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('name', 'test-button')
    expect(button).toHaveAttribute('value', 'test-value')
  })

  it('should handle keyboard events', () => {
    const handleKeyDown = jest.fn()
    
    render(<Button onKeyDown={handleKeyDown}>Keyboard Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Keyboard Button' })
    fireEvent.keyDown(button, { key: 'Enter' })
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('should have correct accessibility attributes', () => {
    render(<Button aria-label="Accessible button">Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Accessible button' })
    expect(button).toHaveAttribute('aria-label', 'Accessible button')
  })

  it('should support focus management', async () => {
    const user = userEvent.setup()
    
    render(<Button>Focusable Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Focusable Button' })
    
    await user.tab()
    expect(button).toHaveFocus()
  })

  describe('asChild prop', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      
      const link = screen.getByRole('link', { name: 'Link Button' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('should render as button when asChild is false', () => {
      render(
        <Button asChild={false}>
          <span>Not a child</span>
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })
  })

  it('should have correct display name', () => {
    expect(Button.displayName).toBe('Button')
  })

  describe('combinations', () => {
    it('should apply multiple props correctly', () => {
      const handleClick = jest.fn()
      
      render(
        <Button 
          variant="destructive" 
          size="lg" 
          disabled 
          onClick={handleClick}
          className="extra-class"
        >
          Complex Button
        </Button>
      )
      
      const button = screen.getByRole('button', { name: 'Complex Button' })
      expect(button).toHaveClass('bg-destructive', 'h-11', 'px-8', 'extra-class')
      expect(button).toBeDisabled()
    })
  })
})
