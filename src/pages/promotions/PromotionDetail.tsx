import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Select,
} from 'antd';
import { RichTextEditor } from 'components/RichTextEditor';
import { useRequest } from 'hooks/useRequest';
import { Promotion } from 'interfaces/Promotion';
import { useCallback, useEffect, useState } from 'react';
import { fetchVideoFeed2, savePromotion } from 'services/DiscoClubService';
interface PromotionDetailProps {
  promotion: Promotion | undefined;
  onSave?: (record: Promotion) => void;
  onCancel?: () => void;
}

const PromotionDetail: React.FC<PromotionDetailProps> = ({
  promotion,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { doRequest, doFetch, loading } = useRequest();
  const [packages, setPackages] = useState<any[]>([]);

  const onFinish = async () => {
    const formPromotion = form.getFieldsValue(true);
    const { result } = await doRequest(() => savePromotion(formPromotion));
    formPromotion.id
      ? onSave?.(formPromotion)
      : onSave?.({ ...formPromotion, id: result });
  };

  const getPackages = useCallback(async () => {
    const { results } = await doFetch(fetchVideoFeed2);
    setPackages(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = useCallback(async () => {
    try {
      await getPackages();
    } catch {
      message.error("Couldn't fetch packages.");
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  return (
    <>
      <PageHeader title={promotion ? 'Promotion Update' : 'New Promotion'} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={promotion}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brief" name="brief">
              <RichTextEditor formField="brief" form={form} />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item name="packages" label="Packages">
              <Select mode="tags">
                {packages.map((_package: any) => (
                  <Select.Option key={_package.id} value={_package.title}>
                    {_package.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
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

export default PromotionDetail;
