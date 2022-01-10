import { Button, Col, Form, Input, PageHeader, Row, Select } from 'antd';
import { RichTextEditor } from 'components/RichTextEditor';
import { useRequest } from 'hooks/useRequest';
import { Promotion } from 'interfaces/Promotion';
import { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchVideoFeed2, savePromotion } from 'services/DiscoClubService';
interface PromotionDetailProps {
  promotion: Promotion | undefined;
  setDetails: Function;
}

const PromotionDetail: React.FC<PromotionDetailProps> = ({
  promotion,
  setDetails,
}) => {
  const [form] = Form.useForm();
  const { doRequest, doFetch, loading } = useRequest();
  const [packages, setPackages] = useState<any[]>([]);

  const onFinish = async () => {
    const promotion = form.getFieldsValue(true);
    await doRequest(() => savePromotion(promotion));
    setDetails(false);
  };

  const getPackages = useCallback(async () => {
    const { results } = await doFetch(fetchVideoFeed2);
    setPackages(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = useCallback(async () => {
    await getPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  return (
    <>
      <PageHeader
        title={
          promotion
            ? `${promotion?.brand} Promotion Update`
            : 'Promotion Update'
        }
        subTitle="Promotion"
      />
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
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => setDetails(false)}>
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

export default PromotionDetail;
