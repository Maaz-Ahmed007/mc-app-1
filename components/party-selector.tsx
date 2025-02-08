"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

interface Party {
    id: string
    name: string
}

interface PartySelectorProps {
    parties: Party[]
    onSelect: (partyId: string) => void
    selectedPartyId?: string
    className?: string
}

export const PartySelector: React.FC<PartySelectorProps> = ({
    className,
    parties = [],
    onSelect,
    selectedPartyId,
}) => {
    const [open, setOpen] = useState(false)
    const formattedParties = parties.map((party) => ({
        value: party.id,
        label: party.name
    }))
    const selectedParty = formattedParties.find(
        (party) => party.value === selectedPartyId
    )

    const onPartySelect = (party: { value: string; label: string }) => {
        setOpen(false)
        onSelect(party.value)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a party"
                    className={cn("w-full justify-between", className)}
                >
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-grow text-left">
                        {selectedParty ? selectedParty.label : "Select party..."}
                    </span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search parties..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No party found.</CommandEmpty>
                        <CommandGroup heading="Parties">
                            {formattedParties.map((party) => (
                                <CommandItem
                                    key={party.value}
                                    onSelect={() => onPartySelect(party)}
                                    className="text-sm"
                                >
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {party.label}
                                    <Check className={cn(
                                        "ml-auto h-4 w-4",
                                        selectedPartyId === party.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}