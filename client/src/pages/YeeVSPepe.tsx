import React, { useEffect, useState } from "react";
import { fetchYeeAndPepeLists } from "../raffleApi";
import RareYee from "../assets/images/RareYee.gif";
import RarePepe from "../assets/images/RarePepe.gif";
import "./History.css";
const YeeVSPepe = () => {
  const [donations, setDonations] = useState<null | {
    yeeList: Map<string, { sum: number; count: number }>;
    pepeList: Map<string, { sum: number; count: number }>;
    otherList: Map<string, { sum: number; count: number }>;
  }>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function setFetchData() {
      const result = await fetchYeeAndPepeLists();

      if (result !== undefined) {
        setDonations(result);
        console.log(result);
        setError("");
      }
    }
    setFetchData();

    const interval = setInterval(setFetchData, 180000); // Fetch data every 3 minutes (180000 milliseconds)

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="donations-container">
      {error && <div className="error">{error}</div>}
      {donations === null && <div className="loading">Loading...</div>}
      {donations !== null && (
        <div className="flex">
          <StatsColumn
            header={
              <div className="ml-10 items-center content-center inline-flex h-40">
                <h1 className="text-3xl font-bold">Yee</h1>
                <img className="h-30 object-fill" src={RareYee} alt="RareYee" />
              </div>
            }
            list={donations.yeeList}
          />
          <StatsColumn
            header={
              <div className="ml-10 items-center content-center inline-flex h-40">
                <h1 className="text-3xl font-bold">Pepe</h1>
                <img
                  className="h-30 object-fill"
                  src={RarePepe}
                  alt="RarePepe"
                />
              </div>
            }
            list={donations.pepeList}
          />
          <StatsColumn
            header={
              <div className="ml-10 items-center content-center inline-flex h-40">
                <h1 className="text-3xl font-bold">Other</h1>
              </div>
            }
            list={donations.otherList}
          />
        </div>
      )}
    </div>
  );
};

const StatsColumn: React.FC<{
  list: Map<string, { sum: number; count: number }>;
  header?: React.ReactNode;
}> = ({ list, header }) => {
  return (
    <div className="flex-1 ml-2 mr-2">
      {header}
      <div className="flex flex-row justify-between">
        <h2 className="ml-10 text-xl font-bold">
          Total:{" $ "}
          {Math.round(
            [...list]
              .map(([key, value]) => value.sum)
              .reduce((a, b) => a + b, 0)
          )}
        </h2>

        <h2 className="mr-10 text-xl font-bold">
          TotalCount:{" "}
          {Math.round(
            [...list]
              .map(([key, value]) => value.count)
              .reduce((a, b) => a + b, 0)
          )}
        </h2>
      </div>
      <table className="table-fixed	">
        <thead>
          <tr>
            <th className="px-4 py-2 w-40">Sponsor</th>
            <th className="px-4 py-2 w-30">Sum USD</th>
            <th className="px-4 py-2 w-20">Count</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(list?.entries())
            .sort(([keyA, valueA], [keyB, valueB]) => {
              return valueB.sum - valueA.sum;
            })
            .map(([key, value]) => (
              <tr key={key}>
                <td className="border px-4 py-2">
                  {
                    <p title={key} className=" w-40 truncate">
                      {key}
                    </p>
                  }
                </td>
                <td className="border px-4 py-2">
                  {"$ "}
                  {Math.round(value.sum * 10) / 10}
                </td>
                <td className="border px-4 py-2">{value.count}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default YeeVSPepe;
