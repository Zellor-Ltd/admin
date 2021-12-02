import { Button, Col, DatePicker, Form, Input, PageHeader, Row } from 'antd';
import { RichTextEditor } from '../../components/RichTextEditor';
import { formatMoment } from '../../helpers/formatMoment';
import { useRequest } from '../../hooks/useRequest';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { saveBanner } from '../../services/DiscoClubService';

const HomeScreenDetail: React.FC<RouteComponentProps> = props => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const banner = form.getFieldsValue(true);
    await doRequest(() => saveBanner(banner));
    history.goBack();
  };

  return (
    <>
      <PageHeader title="Banner Update" subTitle="Banner" />
      <Form
        name="bannerForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row>
          <Col lg={12} xs={24}>
            <Form.Item label="HTML" name="html">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={6} xs={24}>
            <Form.Item
              name="startDate"
              label="Start Date"
              getValueProps={formatMoment}
              rules={[{ required: true }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item
              name="expireDate"
              label="Expire Date"
              getValueProps={formatMoment}
              rules={[{ required: true }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
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

export default HomeScreenDetail;
