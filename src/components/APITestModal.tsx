import { Button, Col, Divider, Input, Modal, Row } from "antd";
import { useRequest } from "hooks/useRequest";
import React, { useEffect, useState } from "react";

type formParams = { [key: string]: any };

export interface RecordAPIRequest {
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

export interface RecordAPITestModalProps<T> {
  selectedRecord: T | null;
  setSelectedRecord: React.Dispatch<React.SetStateAction<T | null>>;
}

interface APITestModalProps<T> {
  selectedRecord: T | null;
  setSelectedRecord: React.Dispatch<React.SetStateAction<T | null>>;
  getRecordAPIRequests: (record: any) => RecordAPIRequest[];
}

const APITestModal: React.FC<APITestModalProps<any>> = ({
  selectedRecord,
  setSelectedRecord,
  getRecordAPIRequests,
}) => {
  const { doAPITest, loading } = useRequest();
  const [responseBody, setResponseBody] = useState<string>();
  const [formValues, setFormValues] = useState<formParams[]>([]);
  const [recordRequests, setRecordRequests] = useState<RecordAPIRequest[]>([]);

  useEffect(() => {
    if (!selectedRecord) return;
    setRecordRequests(getRecordAPIRequests(selectedRecord));
    setFormValues([
      ...getRecordAPIRequests(selectedRecord).map((request) => {
        const params: formParams = {};
        request.params.forEach((param) => {
          params[param.field] = param.default;
        });
        return params;
      }),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecord]);

  const testRoute = async (route: Function, params: any) => {
    const response = await doAPITest(() => route(params));
    setResponseBody(JSON.stringify(response, null, 4));
  };

  const handleClose = () => {
    setSelectedRecord(null);
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
      visible={Boolean(selectedRecord)}
    >
      <Row gutter={16}>
        <Col xs={12}>
          <h3>Requests List</h3>
          {recordRequests.map((request, index) => (
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
              {index !== recordRequests.length - 1 && <Divider />}
            </>
          ))}
        </Col>
        <Col xs={12}>
          <Row justify="space-between">
            <Col>
              <h3>Response</h3>
            </Col>
            <Col>
              {responseBody && (
                <h4 style={{ color: "grey" }}>Use Ctrl + F to search.</h4>
              )}
            </Col>
          </Row>
          <pre>{responseBody}</pre>
        </Col>
      </Row>
    </Modal>
  );
};

export default APITestModal;
