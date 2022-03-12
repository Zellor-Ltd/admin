import { Button, Col, DatePicker, Form, PageHeader, Row } from 'antd';
import { RichTextEditor } from 'components/RichTextEditor';
import SimpleSelect from 'components/select/SimpleSelect';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { PromoDisplay } from 'interfaces/PromoDisplay';
import { useState } from 'react';
import { savePromoDisplay } from 'services/DiscoClubService';
import useAllCategories from 'hooks/useAllCategories';
import { useMount } from 'react-use';
import { SelectOption } from 'interfaces/SelectOption';
interface PromoDisplayDetailProps {
  promoDisplay?: any;
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
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'superCategory',
    value: 'id',
  };

  useMount(async () => {
    await fetchAllCategories();
  });

  const onFinish = async () => {
    const formPromoDisplay = form.getFieldsValue(true);
    const { result } = await doRequest(() =>
      savePromoDisplay(formPromoDisplay)
    );
    formPromoDisplay.id
      ? onSave?.(formPromoDisplay)
      : onSave?.({ ...formPromoDisplay, id: result });
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
            <Form.Item label="Display HTML">
              <RichTextEditor
                formField="displayHtml"
                form={form}
                editableHtml={true}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
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
            <Form.Item label="Super Category" name="superCategoryId">
              <SimpleSelect
                data={allCategories['Super Category'].filter(item => {
                  return (
                    item.superCategory === 'Women' ||
                    item.superCategory === 'Men'
                  );
                })}
                style={{ width: '100%' }}
                selectedOption={promoDisplay?.superCategoryId}
                optionsMapping={optionsMapping}
                placeholder={'Select a Super Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories}
                allowClear={true}
              ></SimpleSelect>
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
