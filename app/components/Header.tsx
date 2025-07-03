import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-100 bg-white px-6 py-4">
      <div className="flex max-w-7xl mx-auto items-center justify-between">
        
        {/* Left Section: Logo + Location */}
        <div className="flex items-center gap-4 flex-1">
          {/* App Logo or Name */}
          <span className="font-bold text-xl">CourtFinder</span>

          {/* Location (hidden on small screens) */}
          <div className="hidden sm:block text-sm text-gray-600">
            📍 3 Baden Street
          </div>
        </div>

        {/*   Center Section: Search Bar */}
        <div className="flex-1 md:flex justify-center">
          <div className="md:flex items-center bg-gray-100 rounded-lg px-4 py-3 w-full">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search sports, locations, times..."
              className="bg-transparent text-gray-700 placeholder-gray-500 outline-none flex-1"
              autoFocus
            />
          </div>
        </div>

        {/* Right Section: Cart + Auth Buttons */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Cart icon with badge */}
          {/* <div className="relative">
            <button>🛒</button>
            <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full px-1">
              0
            </span>
          </div> */}

          {/* Auth buttons */}
          {/* <button className="text-sm">Log in</button>
          <button className="text-sm font-semibold">Sign up</button> */}
        </div>
      </div>
    </header>
  );
}
