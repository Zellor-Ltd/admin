import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
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
    const commissionForm = form.getFieldsValue(true);
    await doRequest(() => saveManualCommission(commissionForm));
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
        autoComplete="off"
      >
        <Row gutter={[8, 8]}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                name="date"
                label="Date"
                getValueProps={formatMoment}
                rules={[{ required: true, message: 'Date is required.' }]}
              >
                <DatePicker format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
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
                <Input placeholder="Feed ID" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                name="creatorId"
                label="Creator"
                rules={[{ required: true, message: 'Creator is required.' }]}
              >
                <Select
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
            <Col lg={16} xs={24}>
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
                <Input placeholder="Product ID" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
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
                <Input placeholder="Quantity" />
              </Form.Item>
            </Col>
          </Col>
          <Col lg={16} xs={24}>
            <Row gutter={8} justify={isMobile ? 'end' : undefined}>
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
