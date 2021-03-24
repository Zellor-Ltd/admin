import moment, { Moment } from "moment";

export const formatMoment = (date: string | Moment) => ({
  value: typeof date === "string" ? moment(date) : date,
});
