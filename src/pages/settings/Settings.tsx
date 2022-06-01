import { Button, Col, Form, Input, message, PageHeader, Row, Tabs } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { saveSettings } from 'services/DiscoClubService';
import { useDispatch, useSelector } from 'react-redux';
import { getSettings } from 'reducers/settings';

const { TabPane } = Tabs;
const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { settings } = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 991);

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    form.resetFields();
  }, [settings, form]);

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  const onFinish = async () => {
    setLoading(true);
    try {
      await saveSettings(form.getFieldsValue(true));
      setLoading(false);
      dispatch(getSettings());
      message.success('Register updated with success.');
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        className={isMobile ? 'mb-n1' : ''}
        subTitle={isMobile ? '' : 'Configuration'}
      />
      <Row className={isMobile ? 'sticky-filter-box' : ''}>
        <Col>
          <Form
            form={form}
            name="settingsForm"
            layout="vertical"
            onFinish={onFinish}
            initialValues={settings}
          >
            <Tabs defaultActiveKey="template">
              <TabPane tab="Template" key="template">
                <ItemList name="template" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Category" key="category">
                <ItemList name="category" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Click Sound" key="clickSound">
                <ItemList name="clickSound" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Currency" key="currency">
                <ItemList name="currency" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Market" key="market">
                <ItemList name="market" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Language" key="language">
                <ItemList name="language" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Status (Orders)" key="orders">
                <ItemList name="order" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Status (Promotions)" key="promoStatus">
                <ItemList name="promoStatus" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Checkout Type" key="checkoutType">
                <ItemList name="checkoutType" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Social Platform" key="socialPlatform">
                <ItemList name="socialPlatform" isMobile={isMobile} />
              </TabPane>
            </Tabs>
            <Row gutter={8} justify="end">
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Settings
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </>
  );
};

interface ItemListProp {
  name: string;
  isMobile: boolean;
}

const ItemList: React.FC<ItemListProp> = ({ name, isMobile }) => (
  <Form.List name={name}>
    {(fields, { add, remove }) => (
      <div>
        <Button className="mb-1" onClick={() => add()}>
          Add {name.charAt(0).toUpperCase() + name.slice(1)}
        </Button>
        {fields.map(field => (
          <Row gutter={8} key={Math.random()}>
            <Col lg={6} xs={24}>
              <Form.Item
                name={[field.name, 'name']}
                fieldKey={[field.key, 'name']}
                label="Name"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Form.Item
                name={[field.name, 'value']}
                fieldKey={[field.key, 'value']}
                label="Value"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Row justify={isMobile ? 'end' : 'start'}>
                <Col style={{ display: 'flex', alignItems: 'center' }}>
                  <MinusCircleOutlined
                    onClick={() => remove(field.name)}
                    className="mb-1"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        ))}
      </div>
    )}
  </Form.List>
);

export default Settings;
