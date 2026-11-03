import { useEffect, useState } from "react";
import type { Visit } from "../api";

const photos = ["foto-1.png", "foto-2.png", "foto-3.png", "foto-4.png"];

export default function Home() {
  const [status, setStatus] = useState<Visit[]>([]);

  useEffect(() => {
    const id = setInterval(async () => {
      setStatus(await (await fetch("/api/status")).json());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const latest = [...status].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <>
      <h1>Willkommen in der PetClinic</h1>
      <p>
        Diese kleine Anwendung zeigt die Daten der Spring PetClinic REST API. Hier finden Sie
        Besitzer mit ihren Haustieren, unsere Tierärzte und ein paar Berichte.
      </p>

      <h2>Letzte Besuche</h2>
      {latest.length === 0 ? (
        <p>Noch keine Daten.</p>
      ) : (
        <ul className="status">
          {latest.map((v) => (
            <li key={v.id}>
              <time>{v.date}</time> {v.description}
            </li>
          ))}
        </ul>
      )}

      <h2>Unsere Praxis</h2>
      <div className="gallery">
        {photos.map((file, i) => (
          <img key={file} src={`/photos/${file}`} alt={`Foto ${i + 1}`} />
        ))}
      </div>
    </>
  );
}
