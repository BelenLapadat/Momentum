import type { Orientation, Scale } from '../types'

type ScaleControlProps = {
  scale: Scale
  onChange: (scale: Scale) => void
}

export function ScaleControl({ scale, onChange }: ScaleControlProps) {
  const options: Scale[] = ['year', 'month', 'day']
  return (
    <div className="segmented" role="group" aria-label="Timeline scale">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={scale === option}
          onClick={() => onChange(option)}
        >
          {option[0]!.toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  )
}

type OrientationControlProps = {
  orientation: Orientation
  onChange: (orientation: Orientation) => void
}

export function OrientationControl({
  orientation,
  onChange,
}: OrientationControlProps) {
  return (
    <div className="segmented" role="group" aria-label="Timeline orientation">
      <button
        type="button"
        aria-pressed={orientation === 'vertical'}
        onClick={() => onChange('vertical')}
      >
        Vertical
      </button>
      <button
        type="button"
        aria-pressed={orientation === 'horizontal'}
        onClick={() => onChange('horizontal')}
      >
        Horizontal
      </button>
    </div>
  )
}
