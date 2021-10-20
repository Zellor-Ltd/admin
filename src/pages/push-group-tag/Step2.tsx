import { Button, Col, Form, PageHeader, Row } from "antd";
import { useRequest } from "hooks/useRequest";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
// import { pushGroupTag } from "services/DiscoClubService";
import { SelectFanGroup } from "components/SelectFanGroup";

const Step2: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const data = form.getFieldsValue(true);
    // await doRequest(() => pushGroupTag(data));
    history.goBack();
  };

  const handleFanGroupChange = async () => {};

  return (
    <>
      <PageHeader title="Push Notifcations - Tags" />
      <Form
        name="tags"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8} style={{ marginBottom: "20px", width: "100%" }}>
          <Col>
            <SelectFanGroup
              onChange={handleFanGroupChange}
              style={{ width: "250px" }}
            ></SelectFanGroup>
          </Col>
        </Row>
        <Row gutter={8}></Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Step2;
