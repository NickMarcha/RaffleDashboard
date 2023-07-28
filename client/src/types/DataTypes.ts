export interface Dono {
  sponsor: string;
  date?: string;
  location: string;
  amount: number;
  message: string;
  timeStamp?: number;
  entryID?: string;
}

const filledDono = (str: string) => {
  return {
    sponsor: str,
    date: str,
    location: str,
    amount: 0,
    message: str,
    timeStamp: 0,
  } as Dono;
};

export const emptyDono: Dono = filledDono("");
export const rollingDono: Dono = filledDono("Rolling");
