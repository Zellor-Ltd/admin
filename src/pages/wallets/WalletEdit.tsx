import {
  Button,
  Col,
  Form,
  InputNumber,
  Popconfirm,
  Row,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useRequest } from 'hooks/useRequest';
import { Wallet } from 'interfaces/Wallet';
import { WalletDetailParams } from 'interfaces/WalletTransactions';
import { useState } from 'react';
import { addBalanceToUser, resetUserBalance } from 'services/DiscoClubService';

interface WalletEditProps {
  fanId: string | undefined;
  brandId: string | undefined;
  label?: string;
  disabled?: boolean;
  wallet?: Wallet;
  onSave?: (value: number, record?: Wallet) => void;
  onReset?: (record?: Wallet) => void;
}

const WalletEdit: React.FC<WalletEditProps> = ({
  fanId,
  brandId,
  label,
  disabled,
  wallet,
  onSave,
  onReset,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading: setLoading });
  const [form] = useForm();

  const addBalance = async ({ balanceToAdd }: { balanceToAdd: number }) => {
    await doRequest(() =>
      addBalanceToUser(fanId as string, brandId as string, balanceToAdd)
    );
    onSave?.(balanceToAdd, wallet);
    form.resetFields();
  };

  const resetBalance = async () => {
    await doRequest(() => resetUserBalance(fanId as string, brandId as string));
    onReset?.(wallet);
  };

  return (
    <>
      <Col span={24}>
        <Form form={form} onFinish={addBalance}>
          {label && (
            <Typography.Title level={5} title={label}>
              {label}
            </Typography.Title>
          )}
          <Row gutter={2} style={{ display: 'flex', flexWrap: 'nowrap' }}>
            <Col span={12}>
              <Form.Item name="balanceToAdd">
                <InputNumber type="number" disabled={disabled}></InputNumber>
              </Form.Item>
            </Col>
            <Col>
              <Button
                htmlType="submit"
                loading={loading}
                type="primary"
                disabled={disabled}
              >
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
                <Button disabled={disabled} danger>
                  Reset
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </Form>
      </Col>
    </>
  );
};

export default WalletEdit;
