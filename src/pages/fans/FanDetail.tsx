import { DeleteOutlined } from "@ant-design/icons";
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
  Typography,
} from "antd";
import { formatMoment } from "helpers/formatMoment";
import { Category } from "interfaces/Category";
import { Creator } from "interfaces/Creator";
import { Role } from "interfaces/Role";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  fetchCategories,
  fetchCreators,
  fetchProfiles,
  saveUser,
} from "services/DiscoClubService";

const { Option } = Select;

const prefixSelector = (prefix: string) => (
  <Form.Item name="dialCode" noStyle>
    <Select defaultValue={prefix || "+353"} style={{ width: 80 }}>
      <Option value="+353">+353</Option>
      <Option value="+55">+55</Option>
      <Option value="+86">+86</Option>
      <Option value="+87">+87</Option>
    </Select>
  </Form.Item>
);

const FanDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const initial: any = location.state;
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

    setLoading(true);
    getRoles();
    getCreatores();
    getCategories();

    return () => {
      mounted = false;
    };
  }, [form]);

  const onChangeCreator = (key: string) => {
    if (key) {
      const { id, firstName, lastName, userName } =
        creators.find((creator) => creator.userName === key) || {};
      const followingCreators = form.getFieldValue("followingCreators") || [];
      form.setFieldsValue({
        followingCreators: [
          ...followingCreators,
          { creatorId: id, firstName, lastName, userName },
        ],
      });
    }
  };

  const onRemoveCreatorClick = (record: Creator) => {
    const followingCreators = form.getFieldValue("followingCreators") || [];
    form.setFieldsValue({
      followingCreators: followingCreators.filter(
        (follow: Creator) => follow.userName !== record.userName
      ),
    });
  };

  const creatorColumns = [
    { title: "UserName", dataIndex: "userName", width: "15%" },
    {
      title: "actions",
      key: "action",
      width: "5%",
      render: (value: any, record: Creator, index: number) => (
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
        categories.find((category) => category.name === key) || {};
      const followingCategories =
        form.getFieldValue("followingCategories") || [];
      form.setFieldsValue({
        followingCategories: [...followingCategories, { idCategory: id, name }],
      });
    }
  };

  const onRemoveCategoryClick = (record: Category) => {
    const followingCategories = form.getFieldValue("followingCategories") || [];
    followingCategories.splice(record, 1);
    form.setFieldsValue({
      followingCategories: followingCategories.filter(
        (follow: Category) => follow.id !== record.id
      ),
    });
  };

  const categoryColumns = [
    { title: "Name", dataIndex: "name", width: "15%" },
    {
      title: "actions",
      key: "action",
      width: "5%",
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
    formattedUser.birthday = formUser.birthday?.format("YYYY-MM-DD");

    formattedUser.personalDetails.phone.number = formUser.phoneNumber;

    formattedUser.addresses = [
      {
        line1: formUser.line1,
        line2: "",
        city: formUser.city,
        stateOrCounty: "",
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
      message.success("Register updated with success.");
      history.push("/fans");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Fan Update" subTitle="Fan" />
      <Form
        name="userForm"
        layout="vertical"
        form={form}
        initialValues={{
          ...initial,
          phoneNumber: initial.personalDetails?.phone?.number,
          line1: initial.addresses[0]?.line1,
          city: initial.addresses[0]?.city,
          country: initial.addresses[0]?.country,
          postalCode: initial.addresses[0]?.postalCode,
        }}
        onFinish={onFinish}
      >
        <Row gutter={8}>
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
                {roles.map((role) => (
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
            <Form.Item label="Gender">
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
                  initial.personalDetails?.phone?.dialCode
                )}
              />
            </Form.Item>
          </Col>
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
        <Row>
          <Col lg={24} xs={24}>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.followingCreators !== curValues.followingCreators
              }
            >
              {({ getFieldValue }) => {
                const followingCreators: Creator[] =
                  getFieldValue("followingCreators") || [];

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
                              (creat) =>
                                !followingCreators
                                  .map((follow) => follow.userName)
                                  .includes(creat.userName)
                            )
                            .map((creator) => (
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
        <Row>
          <Col lg={24} xs={24}>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.followingCategories !== curValues.followingCategories
              }
            >
              {({ getFieldValue }) => {
                const followingCategories: Category[] =
                  getFieldValue("followingCategories") || [];

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
                              (creat) =>
                                !followingCategories
                                  .map((follow) => follow.id)
                                  .includes(creat.id)
                            )
                            .map((category) => (
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
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/fans")}>
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
