export type weird = {
  __LASTFOCUS: string;
  __EVENTTARGET: string;
  __EVENTARGUMENT: string;
  __VIEWSTATE: string;
  __VIEWSTATEENCRYPTED: string;
  __EVENTVALIDATION: string;
  __VIEWSTATEGENERATOR: string;
};

export type IncrementalData = {
  weirdData?: weird;
  cookies: string[];
  from?: string;
  isPrimary: boolean;
};

export type Config = {
  admin: string[];
  try: number;
  prices: {
    pro: number;
    title: string;
    price: number;
  }[];
};
