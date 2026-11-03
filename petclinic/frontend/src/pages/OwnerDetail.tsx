import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
// moment/min/locales registers all locales on moment/moment.js, so import that same file.
import moment from "moment/moment.js";
import "moment/min/locales";
import { getJson, type Owner } from "../api";

moment.locale("de");

const formatDate = (date: string) => moment(date).format("LL");

export default function OwnerDetail() {
  const { id } = useParams();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getJson<Owner>(`/api/owners/${id}`).then(setOwner, () => setFailed(true));
  }, [id]);

  if (failed) return <p>Besitzer nicht gefunden.</p>;
  if (!owner) return <p>Wird geladen ...</p>;

  return (
    <>
      <p>
        <Link to="/owners">Zurück zur Liste</Link>
      </p>
      <h1>
        {owner.firstName} {owner.lastName}
      </h1>
      <table className="details">
        <tbody>
          <tr>
            <th>Adresse</th>
            <td>{owner.address}</td>
          </tr>
          <tr>
            <th>Stadt</th>
            <td>{owner.city}</td>
          </tr>
          <tr>
            <th>Telefon</th>
            <td>{owner.telephone}</td>
          </tr>
        </tbody>
      </table>

      <h2>Haustiere und Besuche</h2>
      {owner.pets.map((pet) => (
        <section key={pet.id} className="pet">
          <h3>
            {pet.name} ({pet.type.name})
          </h3>
          <p>Geboren am {formatDate(pet.birthDate)}</p>
          {pet.visits.length === 0 ? (
            <p>Noch keine Besuche.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                {pet.visits.map((v) => (
                  <tr key={v.id}>
                    <td>{formatDate(v.date)}</td>
                    <td>{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </>
  );
}
