import { Button, Col, Form, PageHeader, Row, Tabs } from "antd";
import { useEffect, useState } from "react";
import { fetchSettings } from "services/DiscoClubService";

const { TabPane } = Tabs;
const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [configuration, setConfiguration] = useState();
  const getSettings = async () => {
    setLoading(true);
    try {
      const response: any = await fetchSettings();
      setLoading(false);
      setConfiguration(response.results[0]);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  const onFinish = () => {
    console.log(configuration);
  };
  return (
    <>
      <PageHeader title="Settings" subTitle="Configuration" />
      <Form
        form={form}
        name="settingsForm"
        layout="vertical"
        onFinish={onFinish}>
        <Tabs defaultActiveKey="template">
          <TabPane tab="Template" key="template">
            Template
          </TabPane>
          <TabPane tab="Category" key="Category">
            Category
          </TabPane>
          <TabPane tab="Click Sound" key="clickSound">
            Click Sound
          </TabPane>
          <TabPane tab="Currency" key="currency">
            Click Sound
          </TabPane>
        </Tabs>
        <Row gutter={8}>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Settings;
