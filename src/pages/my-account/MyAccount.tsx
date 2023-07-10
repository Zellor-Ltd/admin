import {
  Button,
  Col,
  Form,
  Image,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Typography,
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

    setClient({
      clientName: '1',
      clientLink: '2',
      currencyCode: '3',
      currencySymbol: '4',
      jumpUrl: '5',
      redirectUrl: '6',
      shopName: '7',
    });
    //    loadClientInfo();
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
          <div className="my-account-container">
            <div className="my-account">
              <Image
                width="100%"
                style={{ padding: '10% 10% 0 10%' }}
                src="/logo.svg"
              />
              <Typography.Title level={3}>Account Details</Typography.Title>
              <Form
                form={form}
                name="userForm"
                layout="vertical"
                className="mt-15"
                initialValues={client}
                onFinish={onFinish}
              >
                <Row gutter={8}>
                  <Col span={24}>
                    <Form.Item
                      label={<strong>Organisation Name</strong>}
                      name="clientName"
                    >
                      <Input
                        allowClear
                        placeholder="New Organisation (Client) Name"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={<strong>Organisation Link</strong>}
                      name="clientLink"
                    >
                      <Input
                        allowClear
                        placeholder="New Organisation (Client) Link"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={<strong>Currency</strong>}
                      name="currencyCode"
                    >
                      <Select
                        placeholder="Default Currency"
                        allowClear
                        showSearch
                        filterOption={filterOption}
                      >
                        {currencies.map(currency => (
                          <Select.Option
                            key={currency.code}
                            value={currency.code}
                          >
                            {currency.code}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="jumpUrl" label={<strong>Jump URL</strong>}>
                      <Input
                        allowClear
                        placeholder="E.g: shop.domain.com/home"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="redirectUrl"
                      label={<strong>Store Product Base URL</strong>}
                    >
                      <Input
                        allowClear
                        placeholder="E.g: shop.domain.com/products"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="shopName"
                      label={<strong>Store Name</strong>}
                    >
                      <Input
                        allowClear
                        placeholder="E.g: shop.domain.com"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8} justify="end">
                  <Col span={24}>
                    <Button
                      loading={loading}
                      type="primary"
                      htmlType="submit"
                      className="mt-05x mb-1"
                      style={{ background: 'rgb(48,86,211)', width: '100%' }}
                    >
                      Save
                    </Button>
                  </Col>
                  <Col span={24} className="mb-2">
                    <Button
                      type="default"
                      onClick={() => history.go(-1)}
                      style={{ width: '100%' }}
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MyAccount;
