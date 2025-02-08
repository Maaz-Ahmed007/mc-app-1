import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CheckboxInputProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({ id, label, checked, onCheckedChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <Label htmlFor={id} className="text-sm text-foreground">{label}</Label>
    </div>
  )
}