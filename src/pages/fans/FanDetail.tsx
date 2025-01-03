import { DeleteOutlined } from '@ant-design/icons';
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
  Table,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { Category } from 'interfaces/Category';
import { Creator } from 'interfaces/Creator';
import { Currency } from 'interfaces/Currency';
import { Fan } from 'interfaces/Fan';
import { ServerAlias } from 'interfaces/ServerAlias';
import { useEffect, useRef, useState } from 'react';
import {
  fetchCategories,
  fetchCurrencies,
  fetchServersList,
  resetUser,
  saveUser,
} from 'services/DiscoClubService';
import FanGroupDropdown from './FanGroupDropdown';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
interface FanDetailProps {
  fan: any;
  onSave?: (record: Fan) => void;
  onCancel?: () => void;
}

const { Option } = Select;

const filterOption = (input: string, option: any) => {
  return !!option?.children
    ?.toString()
    ?.toUpperCase()
    .includes(input?.toUpperCase());
};

const prefixSelector = (prefix: string) => (
  <Form.Item name="dialCode" noStyle>
    <Select
      style={{ width: 80 }}
      allowClear
      showSearch
      filterOption={filterOption}
      placeholder="Dial Code"
    >
      <Option value="+353">+353</Option>
      <Option value="+55">+55</Option>
      <Option value="+86">+86</Option>
      <Option value="+87">+87</Option>
    </Select>
  </Form.Item>
);

const FanDetail: React.FC<FanDetailProps> = ({ fan, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serversList, setServersList] = useState<ServerAlias[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [activeTabKey, setActiveTabKey] = useState<string>('Details');
  const toFocus = useRef<any>();

  useEffect(() => {
    const getCategories = async () => {
      const response: any = await fetchCategories();
      setCategories(response.results);
    };
    const getServersList = async () => {
      const response: any = await fetchServersList();
      setServersList(response.results);
    };
    const getCurrencies = async () => {
      const response: any = await fetchCurrencies();
      setCurrencies(response.results);
    };
    getCategories();
    getServersList();
    getCurrencies();
  }, [form]);

  const onChangeCreator = (creator: Creator) => {
    if (creator) {
      const { id, firstName, lastName, userName } = creator;
      const followingCreators = form.getFieldValue('followingCreators') || [];
      form.setFieldsValue({
        followingCreators: [
          ...followingCreators,
          { creatorId: id, firstName, lastName, userName },
        ],
      });
    }
  };

  const onRemoveCreatorClick = (record: Creator) => {
    const followingCreators = form.getFieldValue('followingCreators') || [];
    form.setFieldsValue({
      followingCreators: followingCreators.filter(
        (follow: Creator) => follow.userName !== record.userName
      ),
    });
  };

  const creatorColumns = [
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="UserName">UserName</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'userName',
      width: '15%',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      render: (_: any, record: Creator) => (
        <>
          <Button
            type="link"
            style={{ padding: 0, margin: 6 }}
            onClick={() => onRemoveCreatorClick(record)}
          >
            <DeleteOutlined />
          </Button>
        </>
      ),
    },
  ];

  const onChangeCategories = (key: string) => {
    if (key) {
      const { id, name } =
        categories.find(category => category.name === key) || {};
      const followingCategories =
        form.getFieldValue('followingCategories') || [];
      form.setFieldsValue({
        followingCategories: [...followingCategories, { idCategory: id, name }],
      });
    }
  };

  const onRemoveCategoryClick = (record: Category) => {
    const followingCategories = form.getFieldValue('followingCategories') || [];
    followingCategories.splice(record, 1);
    form.setFieldsValue({
      followingCategories: followingCategories.filter(
        (follow: Category) => follow.id !== record.id
      ),
    });
  };

  const categoryColumns = [
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '15%',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      render: (value: any, record: Category, index: number) => (
        <>
          <Button
            type="link"
            style={{ padding: 0, margin: 6 }}
            onClick={() => onRemoveCategoryClick(record)}
          >
            <DeleteOutlined />
          </Button>
        </>
      ),
    },
  ];

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
    } catch (error: any) {
      setLoading(false);
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    if (!toFocus.current) {
      const id = errorFields[0].name[0];
      const element = document.getElementById(id);

      switch (id) {
        case 'userName':
          setActiveTabKey('Details');
          break;
        default:
          console.log('Something went wrong.');
      }
      scrollIntoView(element);
    }
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  return (
    <>
      <PageHeader
        title={fan ? `${fan.userName ?? ''} Update` : 'New Fan'}
        extra={[
          <Button
            key="1"
            type="primary"
            disabled={!fan}
            onClick={() => resetUser(fan.id)}
          >
            Reset User
          </Button>,
        ]}
      />
      <Form
        name="userForm"
        layout="vertical"
        form={form}
        initialValues={
          fan
            ? {
                ...fan,
                phoneNumber: fan?.personalDetails?.phone?.number,
                dialCode:
                  fan?.dialCode ??
                  fan?.personalDetails?.phone?.dialCode ??
                  '+353',
                line1: fan?.addresses?.[0]?.line1,
                city: fan?.addresses?.[0]?.city,
                country: fan?.addresses?.[0]?.country,
                postalCode: fan?.addresses?.[0]?.postalCode,
                birthday: fan?.['birthday']
                  ? moment(fan?.['birthday'])
                  : undefined,                  
                signUpDate: fan?.['signUpDate']
                ? moment(fan?.['signUpDate'])
                : undefined,
              }
            : undefined
        }
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
      >
        <Tabs
          defaultActiveKey="Details"
          activeKey={activeTabKey}
          onChange={handleTabChange}
        >
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              {fan && (
                <Col lg={8} xs={24}>
                  <Form.Item label="_id" name="id">
                    <Input allowClear disabled />
                  </Form.Item>
                </Col>
              )}
              <Col lg={8} xs={24}>
                <Form.Item
                  label="Name"
                  name="userName"
                  rules={[
                    {
                      required: true,
                      message: 'Username is required.',
                    },
                  ]}
                >
                  <Input allowClear id="userName" placeholder="Name" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Email" name="user">
                  <Input allowClear type="email" placeholder="Email" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Password" name="pwd">
                  <Input.Password allowClear placeholder="Password" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="profile" label="Profile">
                  <Select
                    placeholder="Please select a profile"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    <Select.Option key="Fan" value="Fan" label="Fan">
                      Fan
                    </Select.Option>
                    <Select.Option
                      key="Creator"
                      value="Creator"
                      label="Creator"
                    >
                      Creator
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  getValueProps={formatMoment}
                >
                  <DatePicker format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="gender" label="Gender">
                  <Select
                    placeholder="Gender"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                    <Select.Option value="Prefer not to say">
                      Prefer not to say
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Phone" name="phoneNumber">
                  <InputNumber
                    placeholder="Phone"
                    style={{
                      width: '100%',
                    }}
                    addonBefore={
                      (fan
                        ? prefixSelector(fan.personalDetails?.phone?.dialCode)
                        : undefined) as unknown as string
                    }
                  />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Default Currency" name="currencyCode">
                  <Select
                    placeholder="Default Currency"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    {currencies.map(currency => (
                      <Select.Option key={currency.code} value={currency.code}>
                        {currency.code}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item
                  label="Sign up Date"
                  name="signUpDate"
                  getValueProps={formatMoment}
                >
                  <DatePicker
                    disabled
                    placeholder={
                      fan
                        ? 'Sign up Date'
                        : moment().format('DD/MM/YYYY').toString()
                    }
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Address" key="Address">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item label="Address" name="line1">
                  <Input allowClear placeholder="Address" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="City" name="city">
                  <Input allowClear placeholder="City" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Country" name="country">
                  <Input allowClear placeholder="Country" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Postal Code" name="postalCode">
                  <InputNumber placeholder="Postal Code" />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Settings" key="Settings">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <FanGroupDropdown
                  form={form}
                  loading={loading}
                  setLoading={setLoading}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="serverAlias" label="Server Alias">
                  <Select
                    placeholder="Server Alias"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    {serversList.map(serverAlias => (
                      <Select.Option
                        key={serverAlias.alias}
                        value={serverAlias.alias}
                        label={serverAlias.name}
                      >
                        {serverAlias.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            forceRender
            tab="Following Creators"
            key="Following Creators"
          >
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.followingCreators !== curValues.followingCreators
                  }
                >
                  {({ getFieldValue }) => {
                    const followingCreators: Creator[] =
                      getFieldValue('followingCreators') || [];

                    return (
                      <>
                        <Col lg={8} xs={24}>
                          <Typography.Title level={5}>
                            Following Creators
                          </Typography.Title>
                          <Form.Item>
                          <CreatorsMultipleFetchDebounceSelect
                            onChangeCreator={(_, creator) => onChangeCreator(creator)}
                          />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Table
                            dataSource={followingCreators}
                            columns={creatorColumns}
                          />
                        </Col>
                      </>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            forceRender
            tab="Following Categories"
            key="Following Categories"
          >
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.followingCategories !==
                    curValues.followingCategories
                  }
                >
                  {({ getFieldValue }) => {
                    const followingCategories: Category[] =
                      getFieldValue('followingCategories') || [];

                    return (
                      <>
                        <Col lg={8} xs={24}>
                          <Typography.Title level={5}>
                            Following Categories
                          </Typography.Title>
                          <Form.Item>
                            <Select
                              placeholder="Please select a Category"
                              onChange={onChangeCategories}
                              allowClear
                              showSearch
                              filterOption={filterOption}
                            >
                              {categories
                                .filter(
                                  creat =>
                                    !followingCategories
                                      .map(follow => follow.id)
                                      .includes(creat.id)
                                )
                                .map(category => (
                                  <Select.Option
                                    key={category.id}
                                    value={category.name}
                                  >
                                    {category.name}
                                  </Select.Option>
                                ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Table
                            dataSource={followingCategories}
                            columns={categoryColumns}
                          />
                        </Col>
                      </>
                    );
                  }}
                </Form.Item>
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

export default FanDetail;
