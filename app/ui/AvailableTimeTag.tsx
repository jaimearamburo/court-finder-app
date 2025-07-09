"use client"

import React from "react";
import { useDrawerActions } from "@/app/store/DrawerContext"
import { formatTime } from "@/app/lib/utils"


const AvailableTimeTag = React.memo(function AvailableTimeTag({ clubId, time, date, isHighlighted }: { clubId: number; time: number; date: string; isHighlighted: boolean }) {
  const { openDrawer } = useDrawerActions()

  console.log('rendering time tag...');

  const className = isHighlighted
    ? 'bg-green-600 text-white'
    : 'bg-gray-700 text-gray-200'

  return (
    <span
      onClick={() => openDrawer({clubId, date, time})}
      className={`inline-block text-xs px-2 py-0.5 rounded-[3px] font-mono cursor-pointer transition ${className}`}
    >
      {formatTime(time)}
    </span>
  )
});

export default AvailableTimeTag;
