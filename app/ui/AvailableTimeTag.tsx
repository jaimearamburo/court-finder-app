"use client"

import React from "react";
import { useDrawerActions } from "@/app/store/DrawerContext"

const formatTime = (minutes: number)  => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const isPM = hours >= 12;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = isPM ? 'pm' : 'am';

  return `${displayHour}${mins !== 0 ? `:${String(mins).padStart(2, '0')}` : ''}${suffix}`;
}

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
