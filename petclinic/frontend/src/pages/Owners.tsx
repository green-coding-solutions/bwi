import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getJson, type Owner } from "../api";

export default function Owners() {
  const [lastName, setLastName] = useState("");
  const [owners, setOwners] = useState<Owner[] | null>(null);

  async function search(name: string) {
    // PetClinic answers with 404 when no owner matches.
    const url = `/api/owners?lastName=${encodeURIComponent(name)}`;
    setOwners(await getJson<Owner[]>(url).catch(() => []));
  }

  useEffect(() => {
    search("");
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    search(lastName);
  }

  return (
    <>
      <h1>Besitzer</h1>
      <form className="search" onSubmit={onSubmit}>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nachname"
        />
        <button>Suchen</button>
      </form>

      {owners === null && <p>Wird geladen ...</p>}
      {owners?.length === 0 && <p>Keine Besitzer gefunden.</p>}
      {owners && owners.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Adresse</th>
              <th>Stadt</th>
              <th>Telefon</th>
              <th>Haustiere</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link to={`/owners/${o.id}`}>
                    {o.firstName} {o.lastName}
                  </Link>
                </td>
                <td>{o.address}</td>
                <td>{o.city}</td>
                <td>{o.telephone}</td>
                <td>{o.pets.map((p) => p.name).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
