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
import { AppContext } from 'contexts/AppContext';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { Creator } from 'interfaces/Creator';
import { Currency } from 'interfaces/Currency';
import { ServerAlias } from 'interfaces/ServerAlias';
import { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchCurrencies,
  fetchServersList,
  saveCreator,
} from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import { DOMPurify } from 'dompurify';
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
  const [instaLink, setInstaLink] = useState<string>(creator?.userName);
  const { doRequest } = useRequest({ setLoading });
  const { isMobile } = useContext(AppContext);
  const inputRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState<string>('Details');
  const toFocus = useRef<any>();

  const onFinish = async () => {
    setLoading(true);
    try {
      const creatorForm = form.getFieldsValue(true);
      const formattedCreator = formatCreatorData(creatorForm);
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

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    if (!toFocus.current) {
      const id = errorFields[0].name[0];
      const element = document.getElementById(id);

      switch (id) {
        case 'userName':
        case 'gender':
          setActiveTabKey('Details');
          break;
        case 'birthday':
          setActiveTabKey('Extended Details');
          break;
        default:
          console.log('Something went wrong.');
      }
      scrollIntoView(element);
    }
  };

  const checkConstraintValidity = () => {
    const vat = document.getElementById('vat') as any;

    if (!vat?.checkValidity()) {
      setActiveTabKey('Extended Details');
      scrollIntoView(vat);
    }
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTabKey(activeKey);
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

  const formatCreatorData = (formUser: any) => {
    const formattedCreator = { ...formUser };
    if (typeof formUser.birthday === 'string') {
      formattedCreator.birthday = formUser.birthday;
    }
    if (typeof formUser.birthday === 'object') {
      formattedCreator.birthday = formUser.birthday.format('DD-MM-YYYY');
    }

    formattedCreator.personalDetails = formattedCreator.personalDetails || {};
    formattedCreator.personalDetails.phone =
      formattedCreator.personalDetails.phone || {};
    formattedCreator.personalDetails.phone.number = formUser.phoneNumber;

    formattedCreator.contentFocus = DOMPurify.sanitize(formUser.contentFocus);
    formattedCreator.topBrands = DOMPurify.sanitize(formUser.topBrands);

    return formattedCreator;
  };

  const handleInstaLinkFocus = (event: any) => {
    inputRef.current.blur();
    event.target.style.border = '1px solid #d9d9d9';
    if (event.target.value) window.open(event.target.value);
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <>
      <PageHeader
        title={creator ? `${creator?.firstName ?? ''} Update` : 'New Creator'}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        initialValues={{
          ...creator,
          currencyCode: creator?.currencyCode ?? 'EUR',
          displayInVideoFeed: creator?.displayInVideoFeed ?? true,
          displayInCreatorGrid: creator?.displayInCreatorGrid ?? true,
        }}
        autoComplete="off"
      >
        <Tabs
          defaultActiveKey="Details"
          activeKey={activeTabKey}
          onChange={handleTabChange}
        >
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col span={24}>
                <Row
                  gutter={24}
                  align="bottom"
                  justify={isMobile ? 'space-between' : undefined}
                >
                  <Col lg={6}>
                    <Form.Item name="status" label="Status">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="live">Live</Radio.Button>
                        <Radio.Button value="paused">Paused</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col lg={6}>
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
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      name="displayInCreatorGrid"
                      label="Display in Creator Grid"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="First Name" name="firstName">
                  <Input allowClear placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Last name" name="lastName">
                  <Input allowClear placeholder="Last name" />
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
                  <Input allowClear placeholder="Username (Email)" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Password" name="pwd">
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
                  label="Creator's Address"
                  name="creatorsAddress"
                  rules={[
                    {
                      type: 'email',
                      message: 'Please use a valid address.',
                    },
                  ]}
                >
                  <Input allowClear placeholder="Creator's Address" />
                </Form.Item>
              </Col>
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
                  <Select
                    id="gender"
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
              <Col lg={12} xs={24}>
                <Form.Item label="Phone" name="phone">
                  <InputNumber placeholder="Phone" />
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
                  <Input
                    placeholder="Display name (@unique)"
                    allowClear
                    id="userName"
                    prefix="@"
                    autoComplete="off"
                    onChange={(event: any) => setInstaLink(event.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Creator's InstaLink">
                  <Input
                    placeholder="Creator's InstaLink"
                    allowClear
                    ref={inputRef}
                    type="url"
                    className={instaLink ? 'instalink-input' : undefined}
                    value={instaLink ? `https://vlink.ie/${instaLink}` : ''}
                    onFocus={event => handleInstaLinkFocus(event)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row
              gutter={8}
              justify={isMobile ? 'space-between' : undefined}
              className={isMobile ? 'mb-n2' : ''}
            >
              <Col lg={4}>
                <Form.Item label="Cover Picture">
                  <Upload.ImageUpload
                    type="coverPictureUrl"
                    fileList={creator?.coverPictureUrl}
                    formProp="coverPictureUrl"
                    form={form}
                  />
                </Form.Item>
              </Col>
              <Col lg={4}>
                <Form.Item label="Avatar">
                  <Upload.ImageUpload
                    type="avatar"
                    fileList={creator?.avatar}
                    formProp="avatar"
                    form={form}
                  />
                </Form.Item>
              </Col>
              <Col lg={4}>
                <Form.Item label="Thumbnail">
                  <Upload.ImageUpload
                    type="thummbnail"
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
                <Form.Item label="Default Currency" name="currencyCode">
                  <Select
                    disabled={!currencies.length}
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
                  <DatePicker id="birthday" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
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
              <Col lg={12} xs={24}>
                <Form.Item label="Commission %" name="comissionPercentage">
                  <InputNumber
                    decimalSeparator="."
                    placeholder="Commission %"
                  />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="linkType" label="Link Type">
                  <Select
                    disabled={!linkType.length}
                    placeholder="Link Type"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    {linkType.map(linkType => (
                      <Select.Option
                        key={linkType.value}
                        value={linkType.value}
                        label={linkType.name}
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
                  <Input allowClear placeholder="Paypal Account" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Coupon Code" name="couponCode">
                  <Input allowClear placeholder="Coupon Code" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Discount %" name="discountPercentage">
                  <InputNumber decimalSeparator="." placeholder="Discount %" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Value Added Tax" name="vat">
                  <Input
                    allowClear
                    id="vat"
                    pattern="^[A-Za-z0-9]*"
                    title="VAT must contain only letters and numbers."
                    placeholder="Value Added Tax"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Address" key="Address">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item label="Address" name="line1">
                  <Input allowClear placeholder="Address" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="City" name="city">
                  <Input allowClear placeholder="City" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Country" name="country">
                  <Input allowClear placeholder="Country" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Postal Code" name="postalCode">
                  <InputNumber placeholder="Postal Code" />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Your Work" key="Your Work">
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item
                  label="Describe your content focus"
                  name="contentFocus"
                >
                  <Input.TextArea
                    rows={4}
                    allowClear
                    placeholder="Describe your content focus"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Top Brand collaborations you have completed"
                  name="topBrands"
                >
                  <Input.TextArea
                    rows={4}
                    allowClear
                    placeholder="Top Brand collaborations you have completed"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Your Work" name="yourWork">
                  <Input
                    allowClear
                    showCount
                    maxLength={40}
                    placeholder="Your Work"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Creator Profile" name="creatorProfile">
                  <Input allowClear placeholder="Creator Profile" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={24}>
                <Typography.Title level={4}>Target</Typography.Title>
              </Col>
              <Col span={24}>
                <Row gutter={8}>
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
                    <Form.Item name="targetGender" label="Gender">
                      <Select
                        mode="multiple"
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
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Social" key="Social">
            <Row gutter={8}>
              <Col span={24}>
                <Typography.Title level={4}>Social Channels</Typography.Title>
              </Col>
            </Row>
            <Row>
              <Col lg={12} xs={24}>
                <Form.Item name="instagram" label="Instagram">
                  <Input
                    allowClear
                    prefix={<InstagramFilled />}
                    placeholder="Instagram"
                  />
                </Form.Item>
                <Form.Item name="facebook" label="Facebook">
                  <Input
                    allowClear
                    prefix={<FacebookFilled />}
                    placeholder="Facebook"
                  />
                </Form.Item>
                <Form.Item name="tiktok" label="TikTok">
                  <Input
                    allowClear
                    prefix={<SoundFilled />}
                    placeholder="TikTok"
                  />
                </Form.Item>
                <Form.Item name="youtube" label="Youtube">
                  <Input
                    allowClear
                    prefix={<YoutubeFilled />}
                    placeholder="Youtube"
                  />
                </Form.Item>
                <Form.Item name="website" label="Website">
                  <Input
                    allowClear
                    prefix={<GlobalOutlined />}
                    placeholder="Website"
                  />
                </Form.Item>
                <Form.Item name="twitter" label="Twitter">
                  <Input
                    allowClear
                    prefix={<TwitterCircleFilled />}
                    placeholder="Twitter"
                  />
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
              onClick={checkConstraintValidity}
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
