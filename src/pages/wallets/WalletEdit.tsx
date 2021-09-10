import {
  Button,
  Col,
  Form,
  InputNumber,
  Popconfirm,
  Row,
  Typography,
} from "antd";
import { useForm } from "antd/lib/form/Form";
import { useRequest } from "hooks/useRequest";
import { useState } from "react";
import { addBalanceToUser, resetUserBalance } from "services/DiscoClubService";

interface WalletEditProps {
  fanId: string;
  brandId: string;
  getResources: () => Promise<any>;
  label?: string;
}

const WalletEdit: React.FC<WalletEditProps> = ({
  fanId,
  brandId,
  getResources,
  label,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading: setLoading });
  const [form] = useForm();

  const addBalance = async ({ balanceToAdd }: { balanceToAdd: number }) => {
    await doRequest(() => addBalanceToUser(fanId, brandId, balanceToAdd));
    form.resetFields();
    await getResources();
  };

  const resetBalance = async () => {
    await doRequest(() => resetUserBalance(fanId, brandId));
    await getResources();
  };

  return (
    <>
      <Col lg={12} xs={24}>
        <Form form={form} onFinish={addBalance}>
          {label && (
            <Typography.Title level={5} title={label}>
              {label}
            </Typography.Title>
          )}
          <Row gutter={4}>
            <Col lg={8} xs={8}>
              <Form.Item name="balanceToAdd">
                <InputNumber></InputNumber>
              </Form.Item>
            </Col>
            <Col lg={12} xs={12}>
              <Row gutter={4}>
                <Col>
                  <Button htmlType="submit" loading={loading} type="primary">
                    Add
                  </Button>
                </Col>
                <Col>
                  <Popconfirm
                    title="Are you sure？"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={resetBalance}
                  >
                    <Button danger>Reset</Button>
                  </Popconfirm>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Col>
    </>
  );
};

export default WalletEdit;
