import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NumberInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
}

export const NumberInput: React.FC<NumberInputProps> = ({ id, label, value, onChange, min, max, step }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}