export type Visit = { id: number; date: string; description: string; petId: number };
export type PetType = { id: number; name: string };
export type Pet = {
  id: number;
  name: string;
  birthDate: string;
  type: PetType;
  visits: Visit[];
  ownerId: number;
};
export type Owner = {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  pets: Pet[];
};
export type Vet = {
  id: number;
  firstName: string;
  lastName: string;
  specialties: { id: number; name: string }[];
};

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}
