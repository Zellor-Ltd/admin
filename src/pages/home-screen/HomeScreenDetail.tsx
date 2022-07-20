import { Button, Col, DatePicker, Form, Input, PageHeader, Row } from 'antd';
import { formatMoment } from '../../helpers/formatMoment';
import { useRequest } from '../../hooks/useRequest';
import { useState, useContext } from 'react';
import { AppContext } from 'contexts/AppContext';
import { saveBanner } from '../../services/DiscoClubService';
import { Banner } from 'interfaces/Banner';
interface HomeScreenDetailProps {
  banner: Banner;
  onSave?: (record: Banner) => void;
  onCancel?: () => void;
}

const HomeScreenDetail: React.FC<HomeScreenDetailProps> = ({
  banner,
  onSave,
  onCancel,
}) => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const formBanner = form.getFieldsValue(true);
    const { result } = await doRequest(() => saveBanner(formBanner));
    formBanner.id
      ? onSave?.(formBanner)
      : onSave?.({ ...formBanner, id: result });
  };

  return (
    <>
      <PageHeader title={banner ? 'Banner Update' : 'New Banner'} />
      <Form
        name="bannerForm"
        layout="vertical"
        form={form}
        initialValues={banner}
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
              rules={[{ required: true, message: `Start Date is required.` }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item
              name="expireDate"
              label="Expire Date"
              getValueProps={formatMoment}
              rules={[{ required: true, message: `Expire Date is required.` }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8} justify={isMobile ? 'end' : undefined}>
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
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
  );
};

export default HomeScreenDetail;
