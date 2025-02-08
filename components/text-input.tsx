import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TextInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  uppercase?: boolean
  placeholder?: string
  disabled?: boolean
  error?: string
}

export const TextInput: React.FC<TextInputProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  uppercase = false,
  placeholder,
  disabled = false,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = uppercase ? e.target.value.toUpperCase() : e.target.value
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}