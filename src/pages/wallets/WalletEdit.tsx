import {
  Button,
  Col,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { useRequest } from 'hooks/useRequest';
import { Wallet } from 'interfaces/Wallet';
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
  const { isMobile } = useContext(AppContext);

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
      <Col lg={12} xs={24}>
        <Form
          form={form}
          className={isMobile ? 'mx-0' : ''}
          onFinish={addBalance}
          onFinishFailed={({ errorFields }) => {
            errorFields.forEach(errorField => {
              message.error('Error: ' + errorField.errors[0]);
            });
          }}
        >
          {label && (
            <Typography.Title level={5} title={label}>
              {label}
            </Typography.Title>
          )}
          <Row
            gutter={2}
            className={isMobile ? 'mb-1' : ''}
            style={
              isMobile
                ? {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }
                : { display: 'flex', flexWrap: 'nowrap' }
            }
          >
            <Col lg={12} xs={24}>
              <Form.Item
                rules={[
                  {
                    type: 'number',
                    required: true,
                    message: 'Balance must be a number.',
                  },
                ]}
                name="balanceToAdd"
              >
                <InputNumber
                  disabled={disabled}
                  placeholder="Enter a Value"
                ></InputNumber>
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
