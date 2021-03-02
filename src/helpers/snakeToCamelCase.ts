import * as _ from "lodash";

function snakeToCamelCase(o: any) {
  let newO: any;
  let origKey;
  let newKey;
  let value;
  if (o instanceof Array) {
    return o.map((value) => {
      if (typeof value === "object") {
        value = snakeToCamelCase(value);
      }
      return value;
    });
  }
  newO = {};
  for (origKey in o) {
    if (o.hasOwnProperty(origKey)) {
      newKey = _.camelCase(origKey);
      value = o[origKey];
      if (
        value instanceof Array ||
        (value !== null && value.constructor === Object)
      ) {
        value = snakeToCamelCase(value);
      }
      newO[newKey] = value;
    }
  }
  return newO;
}
export default snakeToCamelCase;
