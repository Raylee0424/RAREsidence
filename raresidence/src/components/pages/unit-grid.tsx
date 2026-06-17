export default function UnitGrid() {
  return (
    <div className="h-96 w-lg rounded-lg bg-gray-300">
      <div className="relative h-2/3 rounded-t-lg overflow-hidden bg-gray-400 pt-3 px-3">
        <div className="rounded-full bg-gray-500 w-fit">
          <div className="px-4 py-2">
            <p className="text-white font-bold text-2xl">Unit 914</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-3 px-3">
        <div className="rounded-[25px] bg-blue-300 w-fit">
          <div className="px-4 py-2">
            <p>10 sq ft</p>
          </div>
        </div>

        <div className="rounded-[25px] bg-blue-300 w-fit">
          <div className="px-4 py-2">
            <p>1 Bedroom</p>
          </div>
        </div>

        <div className="rounded-[25px] bg-blue-300 w-fit">
          <div className="px-4 py-2">
            <p>1 Bed</p>
          </div>
        </div>
      </div>


      <div className="rounded-[25px] bg-red-400 w-fit mt-auto mb-3 mx-3">
        <div className="px-4 py-2">
          <p>Available</p>
        </div>
      </div>
    </div>
  );
}
