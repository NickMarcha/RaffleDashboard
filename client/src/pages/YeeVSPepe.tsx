import React, { useEffect, useState } from "react";
import { fetchYeeAndPepeLists } from "../raffleApi";
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Yee</h1>
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Sponsor</th>
                  <th className="px-4 py-2">Sum</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(donations?.yeeList?.entries())
                  .sort(([keyA, valueA], [keyB, valueB]) => {
                    return valueB.sum - valueA.sum;
                  })
                  .map(([key, value]) => (
                    <tr key={key}>
                      <td className="border px-4 py-2">{key}</td>
                      <td className="border px-4 py-2">{value.sum}</td>
                      <td className="border px-4 py-2">{value.count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Pepe</h1>
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Sponsor</th>
                  <th className="px-4 py-2">Sum</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(donations?.pepeList?.entries())
                  .sort(([keyA, valueA], [keyB, valueB]) => {
                    return valueB.sum - valueA.sum;
                  })
                  .map(([key, value]) => (
                    <tr key={key}>
                      <td className="border px-4 py-2">{key}</td>
                      <td className="border px-4 py-2">{value.sum}</td>
                      <td className="border px-4 py-2">{value.count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Other</h1>
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Sponsor</th>
                  <th className="px-4 py-2">Sum</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(donations?.otherList?.entries())
                  .sort(([keyA, valueA], [keyB, valueB]) => {
                    return valueB.sum - valueA.sum;
                  })
                  .map(([key, value]) => (
                    <tr key={key}>
                      <td className="border px-4 py-2">{key}</td>
                      <td className="border px-4 py-2">{value.sum}</td>
                      <td className="border px-4 py-2">{value.count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default YeeVSPepe;
