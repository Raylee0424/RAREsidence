import UnitGrid from "@/components/pages/unit-grid";

export default function Home() {
  const units = [
    {
      id: 1,
      name: "Unit 917",
      status: "Occupied",
    },
    {
      id: 2,
      name: "Unit 919",
      status: "Available",
    },
    {
      id: 3,
      name: "Camelia Homes",
      status: "Available",
    },
    {
      id: 4,
      name: "Corinthians",
      status: "Occupied",
    },
  ];

  return (
    <>
      <div className="container mx-auto flex items-center justify-center">
        <div className="m-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {units.map((unit) => (
              <UnitGrid
                key={unit.id}
                id={unit.id}
                name={unit.name}
                status={unit.status}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
