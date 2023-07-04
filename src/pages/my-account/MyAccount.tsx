import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Select,
} from 'antd';
import { AppContext } from 'contexts/AppContext';
import { useRequest } from 'hooks/useRequest';
import { Currency } from 'interfaces/Currency';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {
  fetchClient,
  fetchCurrencies,
  saveClient,
} from 'services/DiscoClubService';

const filterOption = (input: string, option: any) => {
  return !!option?.children
    ?.toString()
    ?.toUpperCase()
    .includes(input?.toUpperCase());
};

const MyAccount: React.FC<any> = () => {
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const history = useHistory();
  const { client, setClient } = useContext(AppContext);

  useEffect(() => {
    const loadClientInfo = async () => {
      const response: any = await fetchClient();
      /* if (response.success) {
        /* enable when endpoint is ready */
      /* setClient(response.result.client) */
      // }
    };

    loadClientInfo();
  }, []);

  useEffect(() => {
    const getCurrencies = async () => {
      const response: any = await fetchCurrencies();
      setCurrencies(response.results);
    };
    getCurrencies();
  }, [form]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const client = form.getFieldsValue(true);
      const { result } = await doRequest(() => saveClient(client));
      setLoading(false);
      message.success('Account updated with success.');
      /* client.id ? onSave?.(client) : onSave?.({ ...client, id: result }); */
    } catch (error: any) {
      setLoading(false);
      message.error('Error: ' + error.error);
    }
  };

  return (
    <>
      {client && (
        <>
          <PageHeader title="My Account" />
          <Form
            name="userForm"
            layout="vertical"
            form={form}
            initialValues={client}
            onFinish={onFinish}
          >
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item label="Client Name" name="clientName">
                  <Input allowClear placeholder="Client Name" disabled />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Client Link" name="clientLink">
                  <Input allowClear placeholder="Client Link" disabled />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Default Currency" name="currencyCode">
                  <Select
                    placeholder="Default Currency"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    {currencies.map(currency => (
                      <Select.Option key={currency.code} value={currency.code}>
                        {currency.code}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="currencySymbol"
                  label="Currency Symbol"
                  rules={[
                    {
                      required: false,
                      message: 'Currency Symbol is required.',
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={filterOption}
                    placeholder="Please select a currency symbol"
                  >
                    <Select.Option key="£" value="£" label="£">
                      £
                    </Select.Option>
                    <Select.Option key="€" value="€" label="€">
                      €
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="jumpUrl" label="Jump URL">
                  <Input allowClear placeholder="Jump URL" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="redirectUrl" label="Redirect URL">
                  <Input allowClear placeholder="Redirect URL" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="shopName" label="Shop Name">
                  <Input allowClear placeholder="Shop Name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8} justify="end">
              <Col>
                <Button type="default" onClick={() => history.go(-1)}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  className="mb-1"
                >
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </>
  );
};

export default MyAccount;
