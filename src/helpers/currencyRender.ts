export const currencyRender = (record: any, amountProp: string) => {
  switch (record.currency) {
    case 'EUR':
      return `€${record[amountProp]?.toFixed(2)}`;
    case 'USD':
      return `$${record[amountProp]?.toFixed(2)}`;
    case 'GBP':
      return `£${record[amountProp]?.toFixed(2)}`;
    default:
      return record[amountProp]?.toFixed(2);
  }
};
