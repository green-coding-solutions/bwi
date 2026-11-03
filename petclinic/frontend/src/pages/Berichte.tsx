import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar, Doughnut } from "react-chartjs-2";
import { getJson, type Pet, type PetType, type Visit } from "../api";

type Data = { visits: Visit[]; pets: Pet[]; types: PetType[] };

export default function Berichte() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    Promise.all([
      getJson<Visit[]>("/api/visits"),
      getJson<Pet[]>("/api/pets"),
      getJson<PetType[]>("/api/pettypes"),
    ]).then(([visits, pets, types]) => setData({ visits, pets, types }));
  }, []);

  if (!data) return <p>Wird geladen ...</p>;

  const perYear: Record<string, number> = {};
  for (const v of data.visits) {
    const year = v.date.slice(0, 4);
    perYear[year] = (perYear[year] ?? 0) + 1;
  }
  const years = Object.keys(perYear).sort();
  const petsPerType = data.types.map((t) => data.pets.filter((p) => p.type.id === t.id).length);

  return (
    <>
      <h1>Berichte</h1>
      <div className="charts">
        <section>
          <h2>Besuche pro Jahr</h2>
          <Bar
            data={{
              labels: years,
              datasets: [{ label: "Besuche", data: years.map((y) => perYear[y]) }],
            }}
            options={{ scales: { y: { ticks: { precision: 0 } } } }}
          />
        </section>
        <section>
          <h2>Haustiere pro Tierart</h2>
          <Doughnut
            data={{
              labels: data.types.map((t) => t.name),
              datasets: [{ label: "Haustiere", data: petsPerType }],
            }}
          />
        </section>
      </div>
    </>
  );
}
