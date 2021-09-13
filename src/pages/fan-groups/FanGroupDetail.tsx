import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { useRequest } from "hooks/useRequest";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { saveFanGroup } from "services/DiscoClubService";

const FanGroupsDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const fanGroup = form.getFieldsValue(true);
    await doRequest(() => saveFanGroup(fanGroup));
    history.push("/fan-groups");
  };

  return (
    <>
      <PageHeader title="Fan Group Update" subTitle="Fan Group" />
      <Form
        name="fanGroupForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/fan-groups")}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" onClick={onFinish}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default FanGroupsDetail;
