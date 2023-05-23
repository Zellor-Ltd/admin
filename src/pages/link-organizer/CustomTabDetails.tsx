import { Button, Col, Form, Input, Row, message } from "antd";
import { SimpleCarousel } from "components/SimpleCarousel";
import { useState } from "react";
import { useHistory } from "react-router-dom";

interface CustomTabDetailsProps {
    list: any;
}


const CustomTabDetails: React.FC<CustomTabDetailsProps> = ({list}) => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const [form] = Form.useForm();

    const onFinish = async () => {
      setLoading(true);
      try {
        const role = form.getFieldsValue(true);
        role.description = form.getFieldValue('description');
        /* await */ /* saveRole(role); */
        setLoading(false);
        message.success('Register updated with success.');
        history.goBack();
      } catch (error) {
        setLoading(false);
      }
    };

    return (
      <>
        <Form
          name="roleForm"
          layout="vertical"
          form={form}
          initialValues={list}
          onFinish={onFinish}
        >
          <Row gutter={8}>
              <Col span={24}>
                <Form.Item label="Name" name="name">
                  <Input allowClear placeholder="Name" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <p>select new link goes here</p>
              </Col><Col span={24}>
                <SimpleCarousel content={list}/>
            </Col>
          </Row>
          <Row gutter={8} justify="end">
            <Col>
              <Button type="default" onClick={() => history.goBack()}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="mb-1"
                >
                  Save Changes
                </Button>
              </Col>
            </Col>
          </Row>
        </Form>
      </>
    );

};

export default CustomTabDetails;