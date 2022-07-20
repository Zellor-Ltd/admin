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
import { useRequest } from '../../hooks/useRequest';
import { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { savePayment } from '../../services/DiscoClubService';
import { Banner } from 'interfaces/Banner';
import { Creator } from 'interfaces/Creator';

interface ManualPaymentProps {
  creators: Creator[];
  onSave?: (record: Banner) => void;
  onCancel?: () => void;
  setShowModal: (value: boolean) => void;
  setManualPayment: (value: boolean) => void;
}

const ManualPayment: React.FC<ManualPaymentProps> = ({
  creators,
  setShowModal,
  setManualPayment,
}) => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [oneOffCreator, setOneOffCreator] = useState<string>();

  const onFinish = async () => {
    const paymentForm = form.getFieldsValue(true);

    if (paymentForm.amount == 0) {
      message.warning('Warning: Cannot send zero value payments!');
      return;
    }
    await doRequest(() => savePayment(paymentForm));
  };

  const handleCancel = () => {
    setShowModal(false);
    setManualPayment(false);
  };

  return (
    <>
      <PageHeader
        title="New One-Off Payment"
        subTitle={isMobile ? '' : 'Send non-commission payment to Creator'}
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
                name="creatorId"
                label="Creator"
                rules={[{ required: true, message: `Creator is required.` }]}
              >
                <Select
                  style={{ width: '100%' }}
                  onChange={setOneOffCreator}
                  value={oneOffCreator}
                  placeholder="Creator"
                  showSearch
                  allowClear
                  disabled={!creators.length}
                  filterOption={(input, option) =>
                    !!option?.children
                      ?.toString()
                      .toUpperCase()
                      .includes(input.toUpperCase())
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
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: `Description is required.`,
                  },
                ]}
              >
                <Input placeholder="Description" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  {
                    required: true,
                    message:
                      'Amount must be a positive number with up to two decimal places.',
                    pattern: new RegExp('^([0-9]+([.]|[.][0-9][0-9]?)?)$'),
                  },
                ]}
              >
                <Input placeholder="Amount" />
              </Form.Item>
            </Col>
          </Col>
          <Col lg={16} xs={24}>
            <Row gutter={8} justify={isMobile ? 'end' : undefined}>
              <Col>
                <Button type="default" onClick={handleCancel}>
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

export default ManualPayment;