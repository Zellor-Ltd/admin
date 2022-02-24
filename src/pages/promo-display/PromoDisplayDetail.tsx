import { Button, Col, DatePicker, Form, PageHeader, Radio, Row } from 'antd';
import { RichTextEditor } from 'components/RichTextEditor';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { PromoDisplay } from 'interfaces/PromoDisplay';
import { useState } from 'react';
import { savePromoDisplay } from 'services/DiscoClubService';
interface PromoDisplayDetailProps {
  promoDisplay: any;
  onSave?: (record: PromoDisplay) => void;
  onCancel?: () => void;
}

const PromoDisplaysDetail: React.FC<PromoDisplayDetailProps> = ({
  promoDisplay,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [selectedOption, setSelectedOption] = useState<'women' | 'men'>(
    'women'
  );

  const onFinish = async () => {
    const formPromoDisplay = form.getFieldsValue(true);
    const { result } = await doRequest(() =>
      savePromoDisplay(formPromoDisplay)
    );
    formPromoDisplay.id
      ? onSave?.(formPromoDisplay)
      : onSave?.({ ...formPromoDisplay, id: result });
  };

  const handleSwitchChange = async () => {
    selectedOption === 'women'
      ? setSelectedOption('men')
      : setSelectedOption('women');
  };

  return (
    <>
      <PageHeader
        title={promoDisplay ? 'Shop Display Update' : 'New Shop Display'}
      />
      <Form
        name="promoDisplayForm"
        layout="vertical"
        form={form}
        initialValues={promoDisplay}
        onFinish={onFinish}
      >
        <Row>
          <Col lg={24} xs={24}>
            {selectedOption === 'women' && (
              <Form.Item label="Women Display HTML">
                <RichTextEditor
                  formField="womenHtml"
                  form={form}
                  editableHtml={true}
                />
              </Form.Item>
            )}
            {selectedOption === 'men' && (
              <Form.Item label="Men Display HTML">
                <RichTextEditor
                  formField="menHtml"
                  form={form}
                  editableHtml={true}
                />
              </Form.Item>
            )}
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={6} xs={24}>
            <Form.Item
              name="displayStartDate"
              label="Display Start Date"
              getValueProps={formatMoment}
              rules={[
                { required: true, message: `Display Start Date is required.` },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item
              name="displayExpireDate"
              label="Display Expire Date"
              getValueProps={formatMoment}
              rules={[
                { required: true, message: `Display Expire Date is required.` },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item
              label="Super Category"
              name="selectedOption"
              initialValue={selectedOption}
            >
              <Radio.Group buttonStyle="solid" onChange={handleSwitchChange}>
                <Radio.Button value="women">Women</Radio.Button>
                <Radio.Button value="men">Men</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
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

export default PromoDisplaysDetail;
