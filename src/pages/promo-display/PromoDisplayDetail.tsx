import { Button, Col, DatePicker, Form, message, PageHeader, Row } from 'antd';
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
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
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

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'superCategory',
    value: 'id',
  };

  useMount(async () => {
    await fetchAllCategories();
  });

  const onFinish = async () => {
    try {
      const formPromoDisplay = form.getFieldsValue(true);
      const { result } = await doRequest(() =>
        savePromoDisplay(formPromoDisplay)
      );
      formPromoDisplay.id
        ? onSave?.(formPromoDisplay)
        : onSave?.({ ...formPromoDisplay, id: result });
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
      <PageHeader
        title={promoDisplay ? 'Shop Display Update' : 'New Shop Display'}
      />
      <Form
        name="promoDisplayForm"
        layout="vertical"
        form={form}
        initialValues={{
          ...promoDisplay,
          displayStartDate: promoDisplay?.['displayStartDate']
            ? moment(promoDisplay?.['displayStartDate'])
            : undefined,
          displayExpireDate: promoDisplay?.['displayExpireDate']
            ? moment(promoDisplay?.['displayExpireDate'])
            : undefined,
        }}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
      >
        <Row>
          <Col lg={24} xs={24}>
            <Form.Item label="Display HTML">
              <RichTextEditor
                formField="displayHtml"
                form={form}
                editableHtml
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={8} xs={24}>
            <Form.Item
              name="displayStartDate"
              label="Display Start Date"
              getValueProps={formatMoment}
              rules={[
                { required: true, message: 'Display Start Date is required.' },
              ]}
            >
              <DatePicker id="displayStartDate" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item
              name="displayExpireDate"
              label="Display Expire Date"
              getValueProps={formatMoment}
              rules={[
                { required: true, message: 'Display Expire Date is required.' },
              ]}
            >
              <DatePicker id="displayExpireDate" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Super Category" name="superCategoryId">
              <SimpleSelect
                showSearch
                data={allCategories['Super Category'].filter(item => {
                  return (
                    item.superCategory === 'Women' ||
                    item.superCategory === 'Men'
                  );
                })}
                style={{ width: '100%' }}
                selectedOption={promoDisplay?.superCategoryId}
                optionMapping={optionMapping}
                placeholder="Select a Super Category"
                loading={fetchingCategories}
                disabled={fetchingCategories}
                allowClear
              ></SimpleSelect>
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

export default PromoDisplaysDetail;
