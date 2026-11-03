import { useEffect, useState } from "react";
import { getJson, type Vet } from "../api";

export default function Vets() {
  const [vets, setVets] = useState<Vet[]>([]);

  useEffect(() => {
    getJson<Vet[]>("/api/vets").then(setVets);
  }, []);

  return (
    <>
      <h1>Tierärzte</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Fachgebiete</th>
          </tr>
        </thead>
        <tbody>
          {vets.map((v) => (
            <tr key={v.id}>
              <td>
                {v.firstName} {v.lastName}
              </td>
              <td>{v.specialties.map((s) => s.name).join(", ") || "keine"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
