

export default function UnitDetails({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1>Unit Details Page</h1>
      <p>You are viewing the unit with ID: {params.id}</p>
      
      
    </div>
  );
}