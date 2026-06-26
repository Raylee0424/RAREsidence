// 1. We export the interface so other files know what a User looks like
export interface User {
  id: number;
  name: string;
  surname: string;
  age: number;
}

// 2. We export the array so your controller can import and read it
export const users: User[] = [
  {
    id: 1,
    name: "Raylee",
    surname: "Smith",
    age: 24,
  },
  {
    id: 2,
    name: "Marcus",
    surname: "Johnson",
    age: 32,
  },
  {
    id: 3,
    name: "Elena",
    surname: "Rodriguez",
    age: 28,
  },
  {
    id: 4,
    name: "James",
    surname: "Chen",
    age: 41,
  },
  {
    id: 5,
    name: "Sophia",
    surname: "Patel",
    age: 22,
  }
];