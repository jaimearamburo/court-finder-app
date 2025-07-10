export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-orange-100 to-pink-100 sm:rounded-md overflow-hidden mb-2 md:mb-5 -mx-2 sm:mx-0">

      <div className="p-4 md:p-6 relative z-20">
        <h1 className="text-2xl md:text-5xl font-bold text-black mb-0 md:mb-3">
          Wanna play? <span className="">Play</span>.
        </h1>
        <p className="text-gray-600 text-sm md:text-lg">
          Search <b>current</b> availability for your favorite sports.
        </p>
      </div>
    </div>
  );
}