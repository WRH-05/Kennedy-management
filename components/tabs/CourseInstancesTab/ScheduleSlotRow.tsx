"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

interface ScheduleSlot {
  dayOfWeek: string
  startHour: string
  duration: number
}

interface ScheduleSlotRowProps {
  slot: ScheduleSlot
  index: number
  daysOfWeek: string[]
  isRemovable: boolean
  onUpdate: (index: number, fields: Partial<ScheduleSlot>) => void
  onRemove: (index: number) => void
}

export function ScheduleSlotRow({
  slot,
  index,
  daysOfWeek,
  isRemovable,
  onUpdate,
  onRemove,
}: ScheduleSlotRowProps) {
  
  const calculateEndHour = (startHour: string, duration: number) => {
    if (!startHour) return "--:--"
    const [hours, minutes] = startHour.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration * 60
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-white p-3 border rounded-md relative shadow-sm group/slot">
      <div className="sm:col-span-4 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Day</Label>
        <Select
          value={slot.dayOfWeek}
          onValueChange={(val) => onUpdate(index, { dayOfWeek: val })}
          required
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {daysOfWeek.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:col-span-3 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Start</Label>
        <Input
          type="time"
          value={slot.startHour}
          onChange={(e) => onUpdate(index, { startHour: e.target.value })}
          required
          className="h-9"
        />
      </div>

      <div className="sm:col-span-2 space-y-1.5">
        <Label className="text-xs text-muted-foreground">Hours</Label>
        <Input
          type="number"
          step="0.5"
          min="0.5"
          max="4"
          value={slot.duration}
          onChange={(e) => onUpdate(index, { duration: Number.parseFloat(e.target.value) })}
          required
          className="h-9"
        />
      </div>

      <div className="sm:col-span-2 space-y-1.5">
        <Label className="text-xs text-muted-foreground">End Hour</Label>
        <div className="h-9 px-2 flex items-center bg-slate-50 rounded border text-xs font-medium text-slate-600">
          {calculateEndHour(slot.startHour, slot.duration)}
        </div>
      </div>

      <div className="sm:col-span-1 flex justify-center pb-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={!isRemovable}
          className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}