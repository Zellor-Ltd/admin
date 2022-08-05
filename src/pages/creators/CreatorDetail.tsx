import {
  FacebookFilled,
  GlobalOutlined,
  InstagramFilled,
  SoundFilled,
  TwitterCircleFilled,
  YoutubeFilled,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Radio,
  Row,
  Select,
  Slider,
  Switch,
  Tabs,
  Typography,
} from 'antd';
import { Upload } from 'components';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { Creator } from 'interfaces/Creator';
import { Currency } from 'interfaces/Currency';
import { ServerAlias } from 'interfaces/ServerAlias';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchCurrencies,
  fetchServersList,
  saveCreator,
} from 'services/DiscoClubService';
import { RichTextEditor } from '../../components/RichTextEditor';

interface CreatorDetailProps {
  creator: any;
  onSave?: (record: Creator) => void;
  onCancel?: () => void;
  onRollback?: (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number
  ) => void;
}

const CreatorDetail: React.FC<CreatorDetailProps> = ({
  creator,
  onSave,
  onCancel,
}) => {
  const {
    settings: { linkType = [] },
  } = useSelector((state: any) => state.settings);
  const [loading, setLoading] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [serversList, setServersList] = useState<ServerAlias[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const { doRequest } = useRequest({ setLoading });

  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const formCreator = form.getFieldsValue(true);
      const formattedCreator = formatUserData(formCreator);
      const { result } = await doRequest(() => saveCreator(formattedCreator));
      setLoading(false);
      message.success('Register updated with success.');
      formattedCreator.id
        ? onSave?.(formattedCreator)
        : onSave?.({ ...formattedCreator, id: result });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCurrencies = async () => {
      const response: any = await fetchCurrencies();
      setCurrencies(response.results);
    };

    getCurrencies();
  }, []);

  useEffect(() => {
    const getServersList = async () => {
      const response: any = await fetchServersList();
      setServersList(response.results);
    };
    if (creator?.ageMin && creator?.ageMax)
      setAgeRange([creator?.ageMin, creator?.ageMax]);
    getServersList();
  }, [creator]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setAgeRange(value);
  };

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

    return formattedUser;
  };

  return (
    <>
      <PageHeader
        title={creator ? `${creator?.firstName} Update` : 'New Creator'}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => {
          errorFields.forEach(errorField => {
            message.error('Error: ' + errorField.errors[0]);
          });
        }}
        initialValues={creator}
        autoComplete="off"
      >
        <Tabs defaultActiveKey="Details">
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Row gutter={24} align="bottom">
                  <Col lg={6} xs={24}>
                    <Form.Item name="status" label="Status">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="live">Live</Radio.Button>
                        <Radio.Button value="paused">Paused</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={24}>
                    <Form.Item name="approved" label="Approved">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="true">Approved</Radio.Button>
                        <Radio.Button value="false">Not Approved</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      name="displayInVideoFeed"
                      label="Display in Video Feed"
                      valuePropName="checked"
                      initialValue
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      name="displayInCreatorGrid"
                      label="Display in Creator Grid"
                      valuePropName="checked"
                      initialValue
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="First Name" name="firstName">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Last name" name="lastName">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Username (Email)"
                  name="user"
                  rules={[
                    {
                      type: 'email',
                      message: 'Please use a valid e-mail address.',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Password" name="pwd">
                  <Input.Password autoComplete="off" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Creator's Address"
                  name="creatorsAddress"
                  rules={[
                    {
                      type: 'email',
                      message: 'Please use a valid address.',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={0}></Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[
                    {
                      required: true,
                      message: 'Gender is required.',
                    },
                  ]}
                >
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
              <Col lg={12} xs={24}>
                <Form.Item label="Phone" name="phone">
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Display name (@unique)"
                  name="userName"
                  rules={[
                    {
                      required: true,
                      message: 'Display name is required.',
                    },
                  ]}
                >
                  <Input prefix="@" autoComplete="off" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Description" name="description">
                  <Input showCount maxLength={200} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={4} xs={24}>
                <Form.Item label="Cover Picture">
                  <Upload.ImageUpload
                    fileList={creator?.coverPictureUrl}
                    formProp="coverPictureUrl"
                    form={form}
                  />
                </Form.Item>
              </Col>
              <Col lg={4} xs={24}>
                <Form.Item label="Avatar">
                  <Upload.ImageUpload
                    fileList={creator?.avatar}
                    formProp="avatar"
                    form={form}
                  />
                </Form.Item>
              </Col>
              <Col lg={4} xs={24}>
                <Form.Item label="Thumbnail">
                  <Upload.ImageUpload
                    fileList={creator?.thumbnail}
                    formProp="thumbnail"
                    form={form}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            forceRender
            tab="Extended Details"
            key="Extended Details"
          >
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Default Currency"
                  name="currencyCode"
                  rules={[
                    {
                      required: false, //ToDo: review
                      message: 'Currency code is required.',
                    },
                  ]}
                >
                  <Select defaultValue="EUR" disabled={!currencies.length}>
                    {currencies.map(currency => (
                      <Select.Option key={currency.code} value={currency.code}>
                        {currency.code}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  getValueProps={formatMoment}
                  rules={[
                    {
                      required: true,
                      message: 'Birthday is required.',
                    },
                  ]}
                >
                  <DatePicker format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
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
              <Col lg={12} xs={24}>
                <Form.Item label="Commission %" name="comissionPercentage">
                  <InputNumber decimalSeparator="." />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="linkType" label="Link Type">
                  <Select disabled={!linkType.length}>
                    {linkType.map(linkType => (
                      <Select.Option
                        key={linkType.value}
                        value={linkType.value}
                      >
                        {linkType.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  label="Paypal Account"
                  name="payPalEmail"
                  rules={[
                    {
                      type: 'email',
                      message: 'Please use a valid e-mail address.',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Coupon Code" name="couponCode">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Discount %" name="discountPercentage">
                  <InputNumber decimalSeparator="." />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Value Added Tax" name="vat">
                  <Input
                    pattern="^[A-Za-z0-9]*"
                    title="VAT must contain only letters and numbers."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Address" key="Address">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item label="Address" name="line1">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="City" name="city">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Country" name="country">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Postal Code" name="postalCode">
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Your Work" key="YourWork">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Describe your content focus"
                  name="contentFocus"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Top Brand collaborations you have completed"
                  name="topBrands"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item label="Your Work" name="yourWork">
                  <Input showCount maxLength={40} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item label="Creator Profile" name="creatorProfile">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Typography.Title level={4}>Target</Typography.Title>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Slider">
                  <Slider
                    range
                    marks={{ 12: '12', 100: '100' }}
                    min={12}
                    max={100}
                    value={ageRange}
                    onChange={onChangeAge}
                  />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="gender" label="Gender">
                  <Select mode="multiple">
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                    <Select.Option value="Prefer not to say">
                      Prefer not to say
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Social" key="Social">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Typography.Title level={4}>Social Channels</Typography.Title>
              </Col>
            </Row>
            <Row>
              <Col lg={8} xs={24}>
                <Form.Item name="instagram" label="Instagram">
                  <Input prefix={<InstagramFilled />} />
                </Form.Item>
                <Form.Item name="facebook" label="Facebook">
                  <Input prefix={<FacebookFilled />} />
                </Form.Item>
                <Form.Item name="tiktok" label="TikTok">
                  <Input prefix={<SoundFilled />} />
                </Form.Item>
                <Form.Item name="youtube" label="Youtube">
                  <Input prefix={<YoutubeFilled />} />
                </Form.Item>
                <Form.Item name="website" label="Website">
                  <Input prefix={<GlobalOutlined />} />
                </Form.Item>
                <Form.Item name="twitter" label="Twitter">
                  <Input prefix={<TwitterCircleFilled />} />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
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

export default CreatorDetail;
