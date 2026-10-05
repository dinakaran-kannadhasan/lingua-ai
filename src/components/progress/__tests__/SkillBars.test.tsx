import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SkillBars } from '@/components/progress/SkillBars'

describe('SkillBars', () => {
  const defaultSkills = { reading: 40, writing: 20, speaking: 60, listening: 55 }

  it('renders all four skills', () => {
    render(<SkillBars skills={defaultSkills} />)
    expect(screen.getByText('Reading')).toBeInTheDocument()
    expect(screen.getByText('Writing')).toBeInTheDocument()
    expect(screen.getByText('Speaking')).toBeInTheDocument()
    expect(screen.getByText('Listening')).toBeInTheDocument()
  })

  it('displays correct percentage values', () => {
    render(<SkillBars skills={defaultSkills} />)
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
  })

  it('renders progress bars with correct aria attributes', () => {
    render(<SkillBars skills={defaultSkills} />)
    const bars = screen.getAllByRole('progressbar')
    expect(bars).toHaveLength(4)
    const readingBar = screen.getByRole('progressbar', { name: 'Reading' })
    expect(readingBar).toHaveAttribute('aria-valuenow', '40')
    expect(readingBar).toHaveAttribute('aria-valuemin', '0')
    expect(readingBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('handles zero values without crashing', () => {
    render(<SkillBars skills={{ reading: 0, writing: 0, speaking: 0, listening: 0 }} />)
    const bars = screen.getAllByRole('progressbar')
    bars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-valuenow', '0')
    })
  })

  it('handles max values', () => {
    render(
      <SkillBars skills={{ reading: 100, writing: 100, speaking: 100, listening: 100 }} />
    )
    const bars = screen.getAllByRole('progressbar')
    bars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-valuenow', '100')
    })
  })
})
