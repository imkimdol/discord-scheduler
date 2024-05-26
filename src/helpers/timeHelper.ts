import { Moment } from "moment";
import SuggestedTime from "../model/suggestedTime";

export const compareTimes = (a: SuggestedTime, b: SuggestedTime): number => {
    if (a.time.isSame(b.time)) return 0;
    else if (a.time.isBefore(b.time)) return -1;
    else return 1;
};

export const momentToSimpleString = (time: Moment, timezone: string): string => {
    return time.tz(timezone).format('MMMM DD, hh:mm z');
};
