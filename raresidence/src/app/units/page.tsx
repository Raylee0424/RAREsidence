import UnitGrid from "@/components/pages/unit-grid";
import { unitsData } from "@/lib/dummy-data";

export default function Units() {
  const unitData = unitsData;
  return (
    <>
      <div className="container mx-auto flex items-center justify-center">
        <div className="m-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {unitData.map((unit) => (
              <UnitGrid
                key={unit.id}
                id={unit.id}
                name={unit.name}
                status={unit.status}
                size={unit.size}
                bedrooms={unit.bedrooms}
                bathrooms={unit.bathrooms}
                image={unit.image}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
