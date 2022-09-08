import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Select,
} from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { saveManualCommission } from '../../services/DiscoClubService';
import { Banner } from 'interfaces/Banner';
import { Creator } from 'interfaces/Creator';
import { formatMoment } from 'helpers/formatMoment';
import scrollIntoView from 'scroll-into-view';
interface PaymentDetailsProps {
  creators: Creator[];
  defaultCreator?: string;
  onSave?: (record: Banner) => void;
  setManualCommission: (value: boolean) => void;
}

const ManualCommission: React.FC<PaymentDetailsProps> = ({
  creators,
  defaultCreator,
  setManualCommission,
}) => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [oneOffCreator, setOneOffCreator] = useState<string>();

  const onFinish = async () => {
    try {
      const commissionForm = form.getFieldsValue(true);
      await doRequest(() => saveManualCommission(commissionForm));
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
        title="New Manual Commission"
        subTitle={isMobile ? '' : 'Send manual commission to Creator'}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        autoComplete="off"
      >
        <Row gutter={[8, 8]}>
          <Col lg={12} xs={24}>
            <Col span={24}>
              <Form.Item
                name="date"
                label="Date"
                getValueProps={formatMoment}
                rules={[{ required: true, message: 'Date is required.' }]}
              >
                <DatePicker id="date" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="feedId"
                label="Feed ID"
                rules={[
                  {
                    required: true,
                    message: 'Feed ID is required.',
                  },
                ]}
              >
                <Input id="feedId" placeholder="Feed ID" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="creatorId"
                label="Creator"
                rules={[{ required: true, message: 'Creator is required.' }]}
              >
                <Select
                  id="creatorId"
                  style={{ width: '100%' }}
                  onChange={setOneOffCreator}
                  value={oneOffCreator}
                  defaultValue={defaultCreator}
                  placeholder="Creator"
                  showSearch
                  allowClear
                  disabled={!creators.length}
                  filterOption={(input, option) =>
                    !!option?.children
                      ?.toString()
                      ?.toUpperCase()
                      .includes(input?.toUpperCase())
                  }
                >
                  {creators.map((curr: any) => (
                    <Select.Option key={curr.id} value={curr.id}>
                      {curr.firstName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="productId"
                label="Product ID"
                rules={[
                  {
                    required: true,
                    message: 'Product ID is required.',
                  },
                ]}
              >
                <Input id="productId" placeholder="Product ID" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[
                  {
                    required: true,
                    message: 'Quantity is required.',
                  },
                ]}
              >
                <InputNumber
                  pattern="^\d*$"
                  id="quantity"
                  placeholder="Quantity"
                />
              </Form.Item>
            </Col>
          </Col>
          <Col span={24}>
            <Row gutter={8} justify="end">
              <Col>
                <Button
                  type="default"
                  onClick={() => setManualCommission(false)}
                >
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
                  Send
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ManualCommission;
