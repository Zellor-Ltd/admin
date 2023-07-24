import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  PageHeader,
  Row,
} from 'antd';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { useRef, useState } from 'react';
import { saveClientUser } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
import SimpleSelect from 'components/select/SimpleSelect';
import { Brand } from 'interfaces/Brand';

interface ClientUserDetailProps {
  user: any;
  brands: Brand[];
  clientId?: string;
  onSave?: (record: any) => void;
  onCancel?: () => void;
}

const ClientUserDetail: React.FC<ClientUserDetailProps> = ({
  user,
  brands,
  clientId,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const { doRequest } = useRequest({ setLoading });
  const [form] = Form.useForm();
  const toFocus = useRef<any>();

  const onFinish = async () => {
    try {
      const clientUserForm = form.getFieldsValue(true);
      const { result } = await doRequest(() => saveClientUser(clientUserForm));
      message.success('Register updated with success.');
      clientUserForm.id
        ? onSave?.(clientUserForm)
        : onSave?.({ ...clientUserForm, id: result });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    if (!toFocus.current) {
      const id = errorFields[0].name[0];
      const element = document.getElementById(id);
      scrollIntoView(element);
    }
  };

  return (
    <>
      <PageHeader
        title={user ? `${user?.firstName ?? ''} Update` : 'New Client User'}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        initialValues={user}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="First Name" name="firstName" required>
              <Input allowClear placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Last name" name="lastName" required>
              <Input allowClear placeholder="Last name" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Username (Email)"
              name="user"
              required
              rules={[
                {
                  type: 'email',
                  message: 'Please use a valid e-mail address.',
                },
              ]}
            >
              <Input allowClear placeholder="Username (Email)" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Password" name="pwd" required>
              <Input.Password
                autoComplete="off"
                allowClear
                placeholder="Password"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Description" name="description">
              <Input
                allowClear
                showCount
                maxLength={200}
                placeholder="Description"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              label="Sign up Date"
              name="signUpDate"
              getValueProps={formatMoment}
            >
              <DatePicker
                disabled
                placeholder={
                  user
                    ? 'Sign up Date'
                    : moment().format('DD/MM/YYYY').toString()
                }
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          {user?.id && (
            <Col lg={12} xs={24}>
              <Form.Item label="Client ID" name="clientId">
                <Input placeholder="No Client ID" disabled />
              </Form.Item>
            </Col>
          )}
          {!user?.id && (
            <Col lg={12} xs={24}>
              <Form.Item label="Client" name="clientId" required>
                <SimpleSelect
                  showSearch
                  data={brands}
                  style={{ width: '100%' }}
                  optionMapping={{
                    key: 'id',
                    label: 'brandName',
                    value: 'id',
                  }}
                  placeholder="Select a Client"
                  disabled={loading}
                  allowClear
                ></SimpleSelect>
              </Form.Item>
            </Col>
          )}
        </Row>
        <Row gutter={[8, 8]} justify="end">
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

export default ClientUserDetail;
