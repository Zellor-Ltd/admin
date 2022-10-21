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
import DOMPurify from 'isomorphic-dompurify';
interface PromotionDetailProps {
  promotion: Promotion | undefined;
  onSave?: (record: Promotion, newItem?: boolean) => void;
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
    const promotionForm = form.getFieldsValue(true);
    if (promotionForm.brief)
      promotionForm.brief = DOMPurify.sanitize(promotionForm.brief);
    const { result } = await doRequest(() => savePromotion(promotionForm));
    promotionForm.id
      ? onSave?.(promotionForm)
      : onSave?.({ ...promotionForm, id: result }, true);
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
      message.error("Error: Couldn't fetch packages.");
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

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
              <Input allowClear placeholder="Description" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brief" name="brief">
              <RichTextEditor formField="brief" form={form} />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item name="packages" label="Packages">
              <Select
                mode="tags"
                placeholder="Packages"
                allowClear
                showSearch
                filterOption={filterOption}
              >
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
