import {
  Button,
  Col,
  Form,
  message,
  PageHeader,
  Row,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { Creator } from '../../interfaces/Creator';
import { Fan } from '../../interfaces/Fan';
import { useState } from 'react';
import { saveUser } from '../../services/DiscoClubService';
import moment from 'moment';
interface GuestDetailProps {
  fan: Fan;
  onSave?: (record: Fan) => void;
  onCancel?: () => void;
}

const GuestDetail: React.FC<GuestDetailProps> = ({ fan, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const creatorColumns = [
    { title: 'UserName', dataIndex: 'userName', width: '15%' },
    {
      title: 'Name',
      dataIndex: 'firstName',
      width: '15%',
      render: (_, record: Creator) => (
        <>
          `${record.firstName}` `${record.lastName}`
        </>
      ),
    },
  ];

  const categoryColumns = [{ title: 'Name', dataIndex: 'name', width: '100%' }];

  const formatUserData = (formUser: any) => {
    const formattedUser = { ...formUser };
    if (typeof formUser.birthday === 'string') {
      formattedUser.birthday = formUser.birthday;
    }
    if (typeof formUser.birthday === 'object') {
      formattedUser.birthday = formUser.birthday.format('DD-MM-YYYY');
    }

    formattedUser.personalDetails = formattedUser.personalDetails || {};
    formattedUser.personalDetails.phone =
      formattedUser.personalDetails.phone || {};
    formattedUser.personalDetails.phone.number = formUser.phoneNumber;

    formattedUser.addresses = [
      {
        line1: formUser.line1,
        line2: '',
        city: formUser.city,
        stateOrCounty: '',
        country: formUser.country,
        postalCode: formUser.postalCode,
        isDefault: true,
      },
    ];

    return formattedUser;
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const user = form.getFieldsValue(true);
      const formattedUserData = formatUserData(user);
      const { result } = await doRequest(() => saveUser(formattedUserData));
      setLoading(false);
      message.success('Register updated with success.');
      user.id ? onSave?.(user) : onSave?.({ ...user, id: result });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Guest Update" />
      <Form
        name="userForm"
        layout="vertical"
        form={form}
        initialValues={
          fan
            ? {
                ...fan,
                phoneNumber: fan.personalDetails?.phone?.number,
                line1: fan.addresses?.[0]?.line1,
                city: fan.addresses?.[0]?.city,
                country: fan.addresses?.[0]?.country,
                postalCode: fan.addresses?.[0]?.postalCode,
                birthday: fan?.['birthday']
                  ? moment(fan?.['birthday'])
                  : undefined,
              }
            : undefined
        }
        onFinish={onFinish}
      >
        <Tabs defaultActiveKey="Details">
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Row justify="space-between">
                  <span>_id</span>
                </Row>
                <span className="info-block mt-05 mb-1">
                  {fan.id ?? <Typography.Text disabled>_id</Typography.Text>}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Name</span>
                <span className="info-block mt-05 mb-1">
                  {fan.userName ?? (
                    <Typography.Text disabled>Name</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Email</span>
                <span className="info-block mt-05 mb-1">
                  {fan.user ?? <Typography.Text disabled></Typography.Text>}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Password</span>
                <span className="info-block mt-05 mb-1">
                  {fan.pwd ?? (
                    <Typography.Text disabled>Password</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Profile</span>
                <span className="info-block mt-05 mb-1">
                  {fan.profile ?? (
                    <Typography.Text disabled>Profile</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Birthday</span>
                <span className="info-block mt-05 mb-1">
                  {fan.birthday ?? (
                    <Typography.Text disabled>Birthday</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Gender</span>
                <span className="info-block mt-05 mb-1">
                  {fan.gender ?? (
                    <Typography.Text disabled>Gender</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Phone</span>
                <span className="info-block mt-05 mb-1">
                  {fan.phoneNumber ?? (
                    <Typography.Text disabled>Phone</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Default Currency</span>
                <span className="info-block mt-05 mb-1">
                  {fan.currencyCode ?? (
                    <Typography.Text disabled>Default Currency</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Sign up Date</span>
                <span className="info-block mt-05 mb-1">
                  {fan.signUpDate ?? (
                    <Typography.Text disabled>Sign up Date</Typography.Text>
                  )}
                </span>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Address" key="Address">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <span>Address</span>
                <span className="info-block mt-05 mb-1">
                  {fan.line1 ?? (
                    <Typography.Text disabled>Address</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>City</span>
                <span className="info-block mt-05 mb-1">
                  {fan.city ?? <Typography.Text disabled>City</Typography.Text>}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Country</span>
                <span className="info-block mt-05 mb-1">
                  {fan.country ?? (
                    <Typography.Text disabled>Country</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Postal Code</span>
                <span className="info-block mt-05 mb-1">
                  {fan.postalCode ?? (
                    <Typography.Text disabled>Postal Code</Typography.Text>
                  )}
                </span>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Settings" key="Settings">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <span>Server Alias</span>
                <span className="info-block mt-05 mb-1">
                  {fan.serverAlias ?? (
                    <Typography.Text disabled>Server Alias</Typography.Text>
                  )}
                </span>
              </Col>
              <Col lg={8} xs={24}>
                <span>Group</span>
                <span className="info-block mt-05 mb-1">
                  {fan.group ?? (
                    <Typography.Text disabled>Group</Typography.Text>
                  )}
                </span>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            forceRender
            tab="Following Creators"
            key="FollowingCreators"
          >
            <Row gutter={8}>
              <Col span={24}>
                <Table
                  dataSource={fan.followingCreators}
                  columns={creatorColumns}
                />
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            forceRender
            tab="Following Categories"
            key="FollowingCategories"
          >
            <Row gutter={8}>
              <Col span={24}>
                <Table
                  dataSource={fan.followingCategories}
                  columns={categoryColumns}
                />
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
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

export default GuestDetail;
