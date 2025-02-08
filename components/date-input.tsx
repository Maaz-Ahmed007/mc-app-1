import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

export const DateInput: React.FC<DateInputProps> = ({ id, label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  )
}