import APITestModal, {
  RecordAPIRequest,
  RecordAPITestModalProps,
} from 'components/APITestModal';
import { Product } from 'interfaces/Product';
import React from 'react';
import { preCheckout } from 'services/DiscoClubService';

const getProductAPIRequests: (product: Product) => RecordAPIRequest[] =
  product => [
    {
      name: 'PreCheckout/{productId}/{DD Quantity}',
      route: (params: any) => preCheckout(product.id, params.ddQuantity),
      method: 'GET',
      params: [
        {
          label: 'DD Quantity',
          field: 'ddQuantity',
          type: 'number',
          default: product.maxDiscoDollars,
        },
      ],
    },
  ];

const ProductAPITestModal: React.FC<RecordAPITestModalProps<Product>> =
  props => {
    return (
      <APITestModal
        {...{ ...props, getRecordAPIRequests: getProductAPIRequests }}
      />
    );
  };

export default ProductAPITestModal;
