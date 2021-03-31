import { Button, Col, Form, Input, message, PageHeader, Row, Tabs } from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { saveSettings } from "services/DiscoClubService";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "reducers/settings";

const { TabPane } = Tabs;
const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { settings } = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();

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
      message.success("Register updated with success.");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subTitle="Configuration" />
      <Form
        form={form}
        name="settingsForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={settings}>
        <Tabs defaultActiveKey="template">
          <TabPane tab="Template" key="template">
            <ItemList name="template" />
          </TabPane>
          <TabPane tab="Category" key="category">
            <ItemList name="category" />
          </TabPane>
          <TabPane tab="Click Sound" key="clickSound">
            <ItemList name="clickSound" />
          </TabPane>
          <TabPane tab="Currency" key="currency">
            <ItemList name="currency" />
          </TabPane>
          <TabPane tab="Market" key="market">
            <ItemList name="market" />
          </TabPane>
          <TabPane tab="Language" key="language">
            <ItemList name="language" />
          </TabPane>
        </Tabs>
        <Row gutter={8}>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Settings
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

interface ItemListProp {
  name: string;
}

const ItemList: React.FC<ItemListProp> = ({ name }) => (
  <Form.List name={name}>
    {(fields, { add, remove }) => (
      <div>
        <Button onClick={() => add()}>
          Add {name.charAt(0).toUpperCase() + name.slice(1)}
        </Button>
        {fields.map((field) => (
          <Row gutter={8} key={Math.random()}>
            <Col lg={6} xs={24}>
              <Form.Item
                name={[field.name, "name"]}
                fieldKey={[field.fieldKey, "name"]}
                label="Name">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Form.Item
                name={[field.name, "value"]}
                fieldKey={[field.fieldKey, "value"]}
                label="Value">
                <Input />
              </Form.Item>
            </Col>
            <Col style={{ display: "flex", alignItems: "center" }}>
              <MinusCircleOutlined onClick={() => remove(field.name)} />
            </Col>
          </Row>
        ))}
      </div>
    )}
  </Form.List>
);

export default Settings;
