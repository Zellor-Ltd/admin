import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Tabs,
  Typography,
} from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { saveSettings } from 'services/DiscoClubService';
import { useDispatch, useSelector } from 'react-redux';
import { getSettings } from 'reducers/settings';

const { TabPane } = Tabs;
const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { settings } = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();
  const { isMobile } = useContext(AppContext);

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
      <Row className="tab-page">
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
              <TabPane tab="Order Status" key="orderStatus">
                <ItemList name="orderStatus" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Feed Item Status" key="feedItemStatus">
                <ItemList name="feedItemStatus" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Promotion Status" key="promoStatus">
                <ItemList name="promoStatus" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Social Platform" key="socialPlatform">
                <ItemList name="socialPlatform" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Checkout Type" key="checkoutType">
                <ItemList name="checkoutType" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Video Type" key="videoType">
                <ItemList name="videoType" isMobile={isMobile} />
              </TabPane>
              <TabPane tab="Link Type" key="linkType">
                <ItemList name="linkType" isMobile={isMobile} />
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
        <Button className="mb-1 mt-05" onClick={() => add()}>
          Add {name.charAt(0)?.toUpperCase() + name.slice(1)}
        </Button>
        {fields.map(field => (
          <Row gutter={8} key={Math.random()}>
            <Col lg={12} xs={24}>
              <Form.Item
                name={[field.name, 'name']}
                fieldKey={[field.key, 'name']}
                label="Name"
              >
                <Input allowClear placeholder="Name" />
              </Form.Item>
            </Col>
            <Col lg={12} xs={24}>
              <Row justify="space-between">
                <Col>
                  <Typography.Text>Value</Typography.Text>
                </Col>
                <Col>
                  <Typography.Text>
                    <MinusCircleOutlined
                      onClick={() => remove(field.name)}
                      className="mr-06 mb-08"
                    />
                  </Typography.Text>
                </Col>
              </Row>
              <Form.Item
                name={[field.name, 'value']}
                fieldKey={[field.key, 'value']}
              >
                <Input allowClear placeholder="Value" />
              </Form.Item>
            </Col>
          </Row>
        ))}
      </div>
    )}
  </Form.List>
);

export default Settings;
