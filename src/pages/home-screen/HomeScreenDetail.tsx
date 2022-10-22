import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  PageHeader,
  Row,
} from 'antd';
import { formatMoment } from '../../helpers/formatMoment';
import { useRequest } from '../../hooks/useRequest';
import { useState } from 'react';
import { saveBanner } from '../../services/DiscoClubService';
import { Banner } from 'interfaces/Banner';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
import DOMPurify from 'isomorphic-dompurify';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    try {
      const bannerForm = form.getFieldsValue(true);
      if (bannerForm.html)
        bannerForm.html = DOMPurify.sanitize(bannerForm.html);
      const { result } = await doRequest(() => saveBanner(bannerForm));
      bannerForm.id
        ? onSave?.(bannerForm)
        : onSave?.({ ...bannerForm, id: result });
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    const id = errorFields[0].name[0];
    const element = document.getElementById(id);

    scrollIntoView(element);
  };

  return (
    <>
      <PageHeader title={banner ? 'Banner Update' : 'New Banner'} />
      <Form
        name="bannerForm"
        layout="vertical"
        form={form}
        initialValues={{
          ...banner,
          startDate: banner?.['startDate']
            ? moment(banner?.['startDate'])
            : undefined,
          expireDate: banner?.['expireDate']
            ? moment(banner?.['expireDate'])
            : undefined,
        }}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
      >
        <Row>
          <Col lg={12} xs={24}>
            <Col span={24}>
              <Form.Item label="HTML" name="html">
                <Input allowClear placeholder="HTML" />
              </Form.Item>
            </Col>
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  getValueProps={formatMoment}
                  rules={[
                    { required: true, message: 'Start Date is required.' },
                  ]}
                >
                  <DatePicker id="startDate" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="expireDate"
                  label="Expire Date"
                  getValueProps={formatMoment}
                  rules={[
                    { required: true, message: 'Expire Date is required.' },
                  ]}
                >
                  <DatePicker id="expireDate" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
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
