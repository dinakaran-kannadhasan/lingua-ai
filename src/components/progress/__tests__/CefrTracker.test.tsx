import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CefrTracker } from '@/components/progress/CefrTracker'

describe('CefrTracker', () => {
  it('highlights current level and marks lower levels as done', () => {
    render(<CefrTracker currentLevel="B1" language="french" />)
    expect(screen.getByText('A1')).toHaveClass('done')
    expect(screen.getByText('A2')).toHaveClass('done')
    expect(screen.getByText('B1')).toHaveClass('current')
    expect(screen.getByText('B2')).not.toHaveClass('done')
  })

  it('shows correct exam name for each language', () => {
    render(<CefrTracker currentLevel="A1" language="german" />)
    expect(screen.getByText(/Goethe/i)).toBeInTheDocument()
  })

  it('A1 has no done levels, only current', () => {
    render(<CefrTracker currentLevel="A1" language="french" />)
    expect(screen.getByText('A1')).toHaveClass('current')
    expect(screen.getByText('A2')).not.toHaveClass('done')
    expect(screen.getByText('A2')).not.toHaveClass('current')
  })

  it('C2 marks all previous levels as done', () => {
    render(<CefrTracker currentLevel="C2" language="italian" />)
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      expect(screen.getByText(level)).toHaveClass('done')
    }
    expect(screen.getByText('C2')).toHaveClass('current')
  })

  it('shows Italian exam name for Italian language', () => {
    render(<CefrTracker currentLevel="B2" language="italian" />)
    expect(screen.getByText(/CILS/i)).toBeInTheDocument()
  })
})
