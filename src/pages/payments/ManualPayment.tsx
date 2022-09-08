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
import { useContext, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { savePayment } from '../../services/DiscoClubService';
import { Banner } from 'interfaces/Banner';
import { Creator } from 'interfaces/Creator';
import scrollIntoView from 'scroll-into-view';
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
  const toFocus = useRef<any>();

  const onFinish = async () => {
    try {
      const paymentForm = form.getFieldsValue(true);

      if (paymentForm.amount === 0) {
        message.warning('Warning: Cannot send zero value payments!');
        return;
      }
      await doRequest(() => savePayment(paymentForm));
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

  const checkConstraintValidity = () => {
    const amount = document.getElementById('discoPercentage') as any;
    if (!amount?.checkValidity()) scrollIntoView(toFocus.current);
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
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        autoComplete="off"
      >
        <Row gutter={[8, 8]}>
          <Col lg={12} xs={24}>
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
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: 'Description is required.',
                  },
                ]}
              >
                <Input id="description" placeholder="Description" />
              </Form.Item>
            </Col>
            <Col span={24}>
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
                <Input id="amount" placeholder="Amount" />
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
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
              onClick={checkConstraintValidity}
            >
              Send
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ManualPayment;
