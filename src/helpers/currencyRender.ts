export const currencyRender = (record: any, amountProp: string) => {
  let prop = record[amountProp];
  let tmp: any;

  if (typeof prop === 'number') tmp = prop?.toFixed(2);

  if (typeof prop === 'string') {
    if (prop[prop.length - 3] === '.') tmp = parseInt(prop)?.toFixed(2);
    else tmp = parseFloat(`${prop}.00`)?.toFixed(2);
  }

  switch (record.currency) {
    case 'EUR':
      return `€${tmp}`;
    case 'USD':
      return `$${tmp}`;
    case 'GBP':
      return `£${tmp}`;
    default:
      return tmp;
  }
};
