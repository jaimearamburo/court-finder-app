"use client"

import { useDrawerState } from "@/app/store/DrawerContext"
import { useDrawerActions } from "@/app/store/DrawerContext"
import { formatTime } from "@/app/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface TimeSlot {
  time: number;
  availableCourts: string[];
}

export function DrawerViewer({ dataMap }: { dataMap: Record<string, any> }) {
  const { open, selectedId } = useDrawerState()
  const { closeDrawer } = useDrawerActions()
  //const itemData = selectedId ? dataMap[selectedId] : null

  const itemData = selectedId
    ? dataMap.find(
        (item: {
          clubId: string;
          date: string;
          availableTimes: { time: number; availableCourts: string[] }[];
        }) =>
          Number(item.clubId) === Number(selectedId.clubId) &&
          item.date === selectedId.date &&
          item.availableTimes.some((slot) => slot.time === selectedId.time)
      )
    : null;

  let availableCourts = null;
  if(itemData && selectedId){
    availableCourts = 
      itemData.availableTimes
      .filter(
        (slot: TimeSlot) => slot.time === selectedId.time
      )
      .flatMap((selectedSlot: TimeSlot)  => selectedSlot.availableCourts)
      .sort((a: string, b: string) => a.localeCompare(b));
  }

  return (
    <Drawer open={open} onOpenChange={closeDrawer}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm min-h-48">
          <DrawerHeader>
            <DrawerTitle className="text-left px-1">
              <span className="text-lg text-blue-900">{selectedId?.time !== undefined && formatTime(selectedId.time)}</span> 
              <span className="text-sm">{` @ ${itemData?.clubName}`}</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {itemData && availableCourts && availableCourts.length > 0 ? (
              <ul className="flex flex-wrap gap-1">
                {availableCourts.map((court: string, idx: number) => (
                  <li
                    key={idx}
                    className="nodetect inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {court}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No data.</p>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">OK</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
