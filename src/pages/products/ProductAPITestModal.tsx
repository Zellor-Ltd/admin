import { Button, Col, Divider, Input, Modal, Row } from "antd";
import { useRequest } from "hooks/useRequest";
import { Product } from "interfaces/Product";
import React, { useEffect, useState } from "react";
import { preCheckout } from "services/DiscoClubService";

interface ProductAPITestModalProps {
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

type formParams = { [key: string]: any };

interface ProductAPIRequest {
  name: string;
  route: (params: any) => any;
  method: string;
  params: {
    label: string;
    field: string;
    type: "text" | "number";
    default: string | number;
  }[];
}

const getProductAPIRequests: (product: Product) => ProductAPIRequest[] = (
  product
) => [
  {
    name: "PreCheckout/{productId}/{DD Quantity}",
    route: (params: any) => preCheckout(product.id, params.ddQuantity),
    method: "GET",
    params: [
      {
        label: "DD Quantity",
        field: "ddQuantity",
        type: "number",
        default: product.maxDiscoDollars,
      },
    ],
  },
];

const ProductAPITestModal: React.FC<ProductAPITestModalProps> = ({
  selectedProduct,
  setSelectedProduct,
}) => {
  const { doAPITest, loading } = useRequest();
  const [responseBody, setResponseBody] = useState<string>();
  const [formValues, setFormValues] = useState<formParams[]>([]);
  const [productRequests, setProductRequests] = useState<ProductAPIRequest[]>(
    []
  );

  useEffect(() => {
    if (!selectedProduct) return;
    setProductRequests(getProductAPIRequests(selectedProduct));
    setFormValues([
      ...getProductAPIRequests(selectedProduct).map((request) => {
        const params: formParams = {};
        request.params.forEach((param) => {
          params[param.field] = param.default;
        });
        return params;
      }),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  const testRoute = async (route: Function, params: any) => {
    const response = await doAPITest(() => route(params));
    setResponseBody(JSON.stringify(response, null, 4));
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setResponseBody("");
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    param: string
  ) => {
    setFormValues((prev) => {
      prev[index][param] = e.target.value;
      return [...prev];
    });
  };

  return (
    <Modal
      onCancel={handleClose}
      onOk={handleClose}
      title="API Test"
      width="65%"
      visible={Boolean(selectedProduct)}
    >
      <Row gutter={16}>
        <Col xs={12}>
          <h3>Requests List</h3>
          {productRequests.map((request, index) => (
            <>
              <Row justify="space-between" align="middle">
                <Col>{request.name}</Col>
                <Col>
                  <Button
                    onClick={() => testRoute(request.route, formValues[index])}
                    loading={loading}
                  >
                    {request.method}
                  </Button>
                </Col>
              </Row>
              {request.params.map((param) => {
                return (
                  <Row style={{ margin: "8px 0" }}>
                    <Input
                      type={param.type}
                      defaultValue={param.default}
                      value={formValues[index][param.field]}
                      onChange={(e) => handleFormChange(e, index, param.field)}
                    />
                  </Row>
                );
              })}
              {index !== productRequests.length - 1 && <Divider />}
            </>
          ))}
        </Col>
        <Col xs={12}>
          <h3>Response</h3>
          <pre>{responseBody}</pre>
        </Col>
      </Row>
    </Modal>
  );
};

export default ProductAPITestModal;
