import { useEffect, useState } from "react";
import type { Visit } from "../api";

const photos = ["foto-1", "foto-2", "foto-3", "foto-4"];

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
        {photos.map((name, i) => (
          <picture key={name}>
            <source srcSet={`/photos/${name}-800.avif`} type="image/avif" />
            <img
              src={`/photos/${name}-800.webp`}
              width={800}
              height={533}
              loading="lazy"
              decoding="async"
              alt={`Foto ${i + 1}`}
            />
          </picture>
        ))}
      </div>
    </>
  );
}
