export class Donation {
  flagCode: string;
  sponsor: string;
  date: string;
  location: string;
  amount: string;
  USDollarAmount: number;
  giftAid: number;
  message: string;
  distributionFlag: string;
  distributionStatus: string;
  numberOfNetsFunded: number;
  numberOfPeopleSaved: number;

  constructor(
    flagCode: string,
    sponsor: string,
    date: string,
    location: string,
    amount: string,
    USDollarAmount: number,
    giftAid: number,
    message: string,
    distributionFlag: string,
    distributionStatus: string,
    numberOfNetsFunded: number,
    numberOfPeopleSaved: number
  ) {
    this.flagCode = flagCode;
    this.sponsor = sponsor;
    this.date = date;
    this.location = location;
    this.amount = amount;
    this.USDollarAmount = USDollarAmount;
    this.giftAid = giftAid;
    this.message = message;
    this.distributionFlag = distributionFlag;
    this.distributionStatus = distributionStatus;
    this.numberOfNetsFunded = numberOfNetsFunded;
    this.numberOfPeopleSaved = numberOfPeopleSaved;
  }
  compare(other: Donation) {
    if (this.flagCode !== other.flagCode) return false;
    if (this.sponsor !== other.sponsor) return false;
    if (this.date !== other.date) return false;
    if (this.location !== other.location) return false;
    if (this.amount !== other.amount) return false;
    if (this.USDollarAmount !== other.USDollarAmount) return false;
    if (this.giftAid !== other.giftAid) return false;
    if (this.message !== other.message) return false;
    if (this.distributionFlag !== other.distributionFlag) return false;
    if (this.distributionStatus !== other.distributionStatus) return false;
    if (this.numberOfNetsFunded !== other.numberOfNetsFunded) return false;
    if (this.numberOfPeopleSaved !== other.numberOfPeopleSaved) return false;
    return true;
  }
  /**
   * Compares based on everything except distribution status
   * @param other
   * @returns
   */
  compareNotDist(other: Donation) {
    if (this.flagCode !== other.flagCode) return false;
    if (this.sponsor !== other.sponsor) return false;
    if (this.date !== other.date) return false;
    if (this.location !== other.location) return false;
    if (this.amount !== other.amount) return false;
    if (this.USDollarAmount !== other.USDollarAmount) return false;
    if (this.giftAid !== other.giftAid) return false;
    if (this.message !== other.message) return false;
    //if (this.distributionFlag !== other.distributionFlag) return false;
    //if (this.distributionStatus !== other.distributionStatus) return false;
    //if (this.numberOfNetsFunded !== other.numberOfNetsFunded) return false;
    //if (this.numberOfPeopleSaved !== other.numberOfPeopleSaved) return false;
    return true;
  }

  /**
   * To old format used in Google Sheets DB
   * @returns
   */
  toOldFormat(): OldDonation {
    return new OldDonation(
      this.sponsor,
      this.date,
      this.location,
      this.amount,
      this.USDollarAmount,
      this.giftAid,
      this.message,
      this.numberOfNetsFunded,
      this.numberOfPeopleSaved
    );
  }

  isEmpty(): boolean {
    return (
      this.flagCode === "none" &&
      this.sponsor === "" &&
      this.date === "" &&
      this.location === "" &&
      this.amount === "" &&
      this.USDollarAmount === 0 &&
      this.giftAid === 0 &&
      this.message === ""
    );
  }
}

export class OldDonation {
  Sponsor: string;
  Date: string;
  Location: string;
  Amount: string;
  US$: number;
  "Gift Aid": number;
  Message: string;
  Nets: number;
  "People Saved": number;

  constructor(
    Sponsor: string,
    Date: string,
    Location: string,
    Amount: string,
    US$: number,
    GiftAid: number,
    Message: string,
    Nets: number,
    PeopleSaved: number
  ) {
    this.Sponsor = Sponsor;
    this.Date = Date;
    this.Location = Location;
    this.Amount = Amount;
    this.US$ = US$;
    this["Gift Aid"] = GiftAid;
    this.Message = Message;
    this.Nets = Nets;
    this["People Saved"] = PeopleSaved;
  }
}

export class ProcessedDonation {
  NR: number;
  inRaffle: boolean;
  flag: string;
  sponsor: string;
  date: number;
  location: string;
  amount: number;
  message: string;
  yeeOrPepe: YeeOrPepe;
  lastUpdated?: Date;
  lastUpdatedBy?: string;

  constructor(
    NR: number,
    inRaffle: boolean,
    flag: string,
    sponsor: string,
    date: number,
    location: string,
    amount: number,
    message: string,
    yeeOrPepe: YeeOrPepe,
    lastUpdated?: Date,
    lastUpdatedBy?: string
  ) {
    this.NR = NR;
    this.inRaffle = inRaffle;
    this.flag = flag;
    this.sponsor = sponsor;
    this.date = date;
    this.location = location;
    this.amount = amount;
    this.message = message;
    this.yeeOrPepe = yeeOrPepe;
    this.lastUpdated = lastUpdated;
    this.lastUpdatedBy = lastUpdatedBy;
  }

  /**
   *
   * @returns A copy of the donation with the conductor name scrubbed
   */
  public scrubConductor(): ProcessedDonation {
    return new ProcessedDonation(
      this.NR,
      this.inRaffle,
      this.flag,
      this.sponsor,
      this.date,
      this.location,
      this.amount,
      this.message,
      this.yeeOrPepe,
      this.lastUpdated,
      undefined
    );
  }

  public toString() {
    return `NR:${this.NR} inRaffle:${this.inRaffle} flag:${this.flag} sponsor:${this.sponsor} date:${this.date} location:${this.location} amount:${this.amount} message:${this.message} yeeOrPepe:${this.yeeOrPepe} lastUpdated:${this.lastUpdated} lastUpdatedBy:${this.lastUpdatedBy}`;
  }
}

export type YeeOrPepe = "YEE" | "PEPE" | "NONE";
