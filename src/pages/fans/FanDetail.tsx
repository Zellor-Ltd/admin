import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { formatMoment } from 'helpers/formatMoment';
import { Category } from 'interfaces/Category';
import { Creator } from 'interfaces/Creator';
import { Currency } from 'interfaces/Currency';
import { Role } from 'interfaces/Role';
import { ServerAlias } from 'interfaces/ServerAlias';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchCategories,
  fetchCreators,
  fetchCurrencies,
  fetchProfiles,
  fetchServersList,
  saveUser,
} from 'services/DiscoClubService';
import FanGroupDropdown from './FanGroupDropdown';
interface FanDetailProps {
  fan: any;
  setDetails: any;
}

const { Option } = Select;

const prefixSelector = (prefix: string) => (
  <Form.Item initialValue={prefix || '+353'} name="dialCode" noStyle>
    <Select style={{ width: 80 }}>
      <Option value="+353">+353</Option>
      <Option value="+55">+55</Option>
      <Option value="+86">+86</Option>
      <Option value="+87">+87</Option>
    </Select>
  </Form.Item>
);

const FanDetail: React.FC<FanDetailProps> = ({ fan, setDetails }) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serversList, setServersList] = useState<ServerAlias[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;
    async function getRoles() {
      const response: any = await fetchProfiles();
      if (mounted) {
        setRoles(response.results);
        setLoading(false);
      }
    }

    const getCreatores = async () => {
      const response: any = await fetchCreators();
      setCreators(response.results);
    };
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
    setLoading(true);
    getRoles();
    getCreatores();
    getCategories();
    getServersList();
    getCurrencies();
    return () => {
      mounted = false;
    };
  }, [form]);

  const onChangeCreator = (key: string) => {
    if (key) {
      const { id, firstName, lastName, userName } =
        creators.find(creator => creator.userName === key) || {};
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
    { title: 'UserName', dataIndex: 'userName', width: '15%' },
    {
      title: 'Actions',
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
    { title: 'Name', dataIndex: 'name', width: '15%' },
    {
      title: 'Actions',
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
      await saveUser(formattedUserData);
      setLoading(false);
      message.success('Register updated with success.');
      setDetails(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={fan ? `${fan.userName} Update` : 'New Item'}
        subTitle="Fan"
      />
      <Form
        name="userForm"
        layout="vertical"
        form={form}
        initialValues={{
          ...fan,
          phoneNumber: fan.personalDetails?.phone?.number,
          line1: fan.addresses?.[0]?.line1,
          city: fan.addresses?.[0]?.city,
          country: fan.addresses?.[0]?.country,
          postalCode: fan.addresses?.[0]?.postalCode,
        }}
        onFinish={onFinish}
      >
        <Tabs defaultActiveKey="Details">
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              {fan.id && (
                <Col lg={8} xs={24}>
                  <Form.Item label="_id" name="id">
                    <Input disabled />
                  </Form.Item>
                </Col>
              )}
              <Col lg={8} xs={24}>
                <Form.Item label="Name" name="userName">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Email" name="user">
                  <Input type="email" />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Password" name="pwd">
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="profile" label="Profile">
                  <Select>
                    {roles.map(role => (
                      <Select.Option key={role.id} value={role.name}>
                        {role.name}
                      </Select.Option>
                    ))}
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
                  <Select>
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
                  <Input
                    addonBefore={prefixSelector(
                      fan.personalDetails?.phone?.dialCode
                    )}
                  />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Default Currency" name="currencyCode">
                  <Select>
                    {currencies.map(currency => (
                      <Select.Option key={currency.code} value={currency.code}>
                        {currency.code}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Address" key="Address">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item label="Address" name="line1">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="City" name="city">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Country" name="country">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item label="Postal Code" name="postalCode">
                  <Input />
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
                />
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name={'serverAlias'} label="Server Alias">
                  <Select>
                    {serversList.map(serverAlias => (
                      <Select.Option
                        key={serverAlias.alias}
                        value={serverAlias.alias}
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
            key="FollowingCreators"
          >
            <Row gutter={8}>
              <Col lg={24} xs={24}>
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
                            <Select
                              placeholder="Please select a creator"
                              onChange={onChangeCreator}
                              allowClear
                            >
                              {creators
                                .filter(
                                  creat =>
                                    !followingCreators
                                      .map(follow => follow.userName)
                                      .includes(creat.userName)
                                )
                                .map(creator => (
                                  <Select.Option
                                    key={creator.id}
                                    value={creator.userName}
                                  >
                                    {creator.userName}
                                  </Select.Option>
                                ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col lg={24} xs={24}>
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
            key="FollowingCategories"
          >
            <Row gutter={8}>
              <Col lg={24} xs={24}>
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
                              placeholder="Please select a categories"
                              onChange={onChangeCategories}
                              allowClear
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
                        <Col lg={24} xs={24}>
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
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => setDetails(false)}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default FanDetail;
