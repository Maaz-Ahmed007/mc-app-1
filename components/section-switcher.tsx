"use client"

import { Check, ChevronsUpDown, TentTree, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Section } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useSectionModal } from "@/hooks/use-section-modal"
import { Button } from "./ui/button"
import { 
    Popover,
    PopoverContent,
    PopoverTrigger
} from "./ui/popover"
import { 
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "./ui/command"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface SectionSwitcherProps extends PopoverTriggerProps {
    items: Section[]
}

export default function SectionSwitcher({
    className,
    items = []
}: SectionSwitcherProps) {
    const sectionModal = useSectionModal()
    const params = useParams()
    const router = useRouter()

    const formattedItems = items.map((item) => ({
        value: item.id,
        label: item.sectionName
    }))

    const currentSection = formattedItems.find(
        (item) => item.value === params.sectionId
    )

    const [open, setOpen] = useState(false)

    const onSectionSelect = (section: { value: string; label: string}) => {
        setOpen(false)
        router.push(`/${section.value}`)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a section"
                    className={cn("w-[200px] justify-between", className)}
                >
                    <TentTree className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-grow text-left truncate">
                        {currentSection?.label || "Select section"}
                    </span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search sections..." />
                    <CommandList>
                        <CommandEmpty>No section found.</CommandEmpty>
                        <CommandGroup heading="Sections">
                            {formattedItems.map((section) => (
                                <CommandItem
                                    key={section.value}
                                    onSelect={() => onSectionSelect(section)}
                                    className="text-sm"
                                >
                                    <TentTree className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {section.label}
                                    <Check className={cn(
                                        "ml-auto h-4 w-4",
                                        currentSection?.value === section.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )} 
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>

                    <CommandSeparator />
                    
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false)
                                    sectionModal.onOpen()
                                }}
                            >
                                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                                Create Section
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}