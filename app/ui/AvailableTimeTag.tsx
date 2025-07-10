"use client"

import React from "react";
import { useDrawerActions } from "@/app/store/DrawerContext"
import { formatTime } from "@/app/lib/utils"


const AvailableTimeTag = React.memo(function AvailableTimeTag({ clubId, time, date, isHighlighted }: { clubId: number; time: number; date: string; isHighlighted: boolean }) {
  const { openDrawer } = useDrawerActions()

  console.log('rendering time tag...');

  const className = isHighlighted
    ? 'bg-green-600 text-white'
    : 'bg-gray-100 text-gray-500'

  return (
    <span
      onClick={() => openDrawer({clubId, date, time})}
      style={{
        boxShadow: '2px 2px 5px #e6e6e6, -3px -3px 5px #ffffff',
      }}
      className={`inline-block text-xs px-2 py-1 rounded-md font-mono cursor-pointer transition ${className}`}
    >
      {formatTime(time)}
    </span>
  )
});

export default AvailableTimeTag;
