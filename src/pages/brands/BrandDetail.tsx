import {
  Button,
  Col,
  Table,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Radio,
  RadioChangeEvent,
  Row,
  Tabs,
  Select,
  Switch,
  Typography,
  Popconfirm,
} from 'antd';
import { Upload } from 'components';
import { RichTextEditor } from 'components/RichTextEditor';
import { Brand } from 'interfaces/Brand';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRequest } from 'hooks/useRequest';
import { TwitterPicker } from 'react-color';
import { useSelector } from 'react-redux';
import { RouteComponentProps, Link } from 'react-router-dom';
import { saveBrand } from 'services/DiscoClubService';
import { BrandVault } from '../../interfaces/BrandVault';
import {
  fetchBrandVault,
  deleteBrandVault,
  saveBrandVault,
} from 'services/DiscoClubService';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import moment from 'moment';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const BrandDetail: React.FC<RouteComponentProps> = (props: any) => {
  const { history, location } = props;
  const detailsPathname = `${location.pathname}/vault`;
  const initial = location.state as Brand;
  const [loading, setLoading] = useState<boolean>(false);
  const [vaults, setVaults] = useState<BrandVault[]>([]);
  const [currentVault, setCurrentVault] = useState<BrandVault>();
  const [activeTabKey, setActiveTabKey] = React.useState('Details');
  const [vaultOptions, setVaultOptions] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const { doRequest } = useRequest({ setLoading });
  const [form] = Form.useForm();
  const [vaultForm] = Form.useForm();

  const {
    settings: { checkoutType = [] },
  } = useSelector((state: any) => state.settings);

  const [checkoutTypeList, setCheckoutTypeList] =
    useState<string[]>(checkoutType);

  const fetchVaults = async () => {
    if (initial) {
      if (initial.shopName) {
        const { results } = await doFetch(() =>
          fetchBrandVault(initial.shopName as string)
        );
        setVaults(results);
      }
    }
  };

  useEffect(() => {
    if (activeTabKey === 'Secrets') {
      setVaultOptions(false);
      fetchVaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabKey]);

  const deleteItem = async (vault: BrandVault) => {
    deleteBrandVault(vault.id);
    setActiveTabKey('Details');
  };

  const saveItem = async (vault: any) => {
    const key = vaultForm.getFieldValue('key');
    const shopName = vaultForm.getFieldValue('shopName');
    const apiShopName = vaultForm.getFieldValue('apiShopName');
    const token = vaultForm.getFieldValue('token');
    if (vault === undefined) {
      const newVault = {
        key: key,
        shopName: shopName,
        apiShopName: apiShopName,
        token: token,
      };
      await doRequest(() => saveBrandVault(newVault));
    } else {
      vault.key = key;
      vault.shopName = shopName;
      vault.apiShopName = apiShopName;
      vault.token = token;
      await doRequest(() => saveBrandVault(vault));
    }
    setActiveTabKey('Details');
    setActiveTabKey('Secrets');
  };

  const editVault = (vault: any) => {
    setCurrentVault(vault);
    setVaultOptions(true);
  };

  const newItem = () => {
    const template = {
      shopName: initial.shopName,
      id: '',
      apiShopName: '',
      tokenType: '',
      token: '',
    };
    setCurrentVault(template as BrandVault);
    setVaultOptions(true);
  };

  const columns: ColumnsType<BrandVault> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      width: '12%',
      align: 'center',
    },
    {
      title: 'Shop Name',
      dataIndex: 'shopName',
      width: '15%',
      align: 'center',
    },
    {
      title: 'API Shop Name',
      dataIndex: 'apiShopName',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Token',
      dataIndex: 'token',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: BrandVault) => (
        <>
          <Link
            to={{ pathname: detailsPathname, state: record }}
            onClick={() => editVault(record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const onFinish = async () => {
    setLoading(true);
    try {
      const brand = form.getFieldsValue(true);
      await saveBrand(brand);
      setLoading(false);
      message.success('Register updated with success.');
      history.goBack();
    } catch (error) {
      setLoading(false);
    }
  };

  const handleCheckoutTypeChange = (e: RadioChangeEvent) => {
    const type = e.target.value;
    const isExternal = type === 'external';
    if (!isExternal) {
      setCheckoutTypeList([
        checkoutType.find((item: any) => item.name === 'Disco'),
      ]);
      form.setFieldsValue({
        checkout: 'Disco',
      });
    } else {
      setCheckoutTypeList(checkoutType);
    }
    form.setFieldsValue({
      requireMobilePurchaseStatus: isExternal,
    });
  };

  const changeTab = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const returnFromVault = () => {
    setVaultOptions(false);
    if (currentVault?.id) {
      history.goBack();
    }
  };

  const BrandVaultForm: React.FC<any> = () => {
    return (
      <>
        {vaultOptions ? (
          <Form name="brandVaultForm" layout="vertical" form={vaultForm}>
            <Col>
              <Col lg={12} xs={24}>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="Key"
                    name="key"
                    rules={[{ required: true }]}
                    initialValue={currentVault?.key || ''}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="Shop Name"
                    name="shopName"
                    rules={[{ required: true }]}
                    initialValue={initial.shopName}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="API Shop Name"
                    name="apiShopName"
                    rules={[{ required: true }]}
                  >
                    <Input value={currentVault?.apiShopName || ''} />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="Token"
                    name="token"
                    rules={[{ required: true }]}
                  >
                    <Input type="password" value={currentVault?.token || ''} />
                  </Form.Item>
                </Col>
              </Col>
              <Row gutter={8}>
                <Col>
                  <Button type="default" onClick={() => returnFromVault()}>
                    Cancel
                  </Button>
                </Col>
                <Col>
                  <Button
                    loading={loading}
                    type="primary"
                    onClick={() => saveItem(currentVault)}
                  >
                    Save Vault
                  </Button>
                </Col>
              </Row>
            </Col>
          </Form>
        ) : (
          <Col>
            <Row gutter={8}>
              <Col>
                <Button key="1" onClick={() => newItem()}>
                  New Item
                </Button>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={24}>
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={vaults}
                  loading={loading}
                />
              </Col>
            </Row>
          </Col>
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title={`${initial.brandName} Update`}
        subTitle="Master Brand"
      />
      <Form
        name="brandForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Tabs
          defaultActiveKey="Details"
          activeKey={activeTabKey}
          onChange={changeTab}
        >
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col lg={3} xs={3}>
                <Form.Item
                  name="automated"
                  label="Automated"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Col lg={16} xs={24}>
                  <Form.Item label="Master Brand Name" name="brandName">
                    <Input />
                  </Form.Item>
                </Col>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Master Brand Color"
                  name="brandTxtColor"
                  rules={[{ required: true }]}
                  valuePropName="color"
                >
                  <ColorPicker />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name={'fitTo'}
                    label="Master Brand Default Image Sizing"
                  >
                    <Select placeholder="Please select a sizing option">
                      <Select.Option key="w" value="w" label="Width">
                        Width
                      </Select.Option>
                      <Select.Option key="h" value="h" label="Height">
                        Height
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane forceRender tab="Checkout" key="Checkout">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Col lg={16} xs={24}>
                  <Form.Item label="Master Brand Name" name="brandName">
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="checkoutType"
                    label="Checkout Type"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group
                      buttonStyle="solid"
                      onChange={handleCheckoutTypeChange}
                    >
                      <Radio.Button value="internal">Internal</Radio.Button>
                      <Radio.Button value="external">External</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="checkout"
                    label="Checkout"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select a checkout type">
                      {checkoutTypeList.map((curr: any) => (
                        <Select.Option key={curr.value} value={curr.value}>
                          {curr.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="confirmationUrl"
                    label="External Payment Confirmation URL"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="cancelationUrl"
                    label="External Payment Cancelation URL"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.checkout !== curValues.checkout
                    }
                  >
                    {({ getFieldValue }) => (
                      <Form.Item
                        name="requireMobilePurchaseStatus"
                        label="Log Completed Purchases?"
                        valuePropName="checked"
                      >
                        <Switch
                          disabled={getFieldValue('checkout') === 'Disco'}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
                <Col lg={8} xs={8}>
                  <Form.Item
                    name="discoPercentage"
                    label="Disco Percentage %"
                    rules={[{ required: true }]}
                  >
                    <InputNumber />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="shopName"
                    label="Shop Name (without https:// or spaces)"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="casey-temp.myshopify.com" />
                  </Form.Item>
                </Col>
              </Col>
              <Col lg={12} xs={24}>
                <Col lg={24} xs={24}>
                  <Form.Item label="Pre-Checkout Message (With Discount)">
                    <RichTextEditor
                      formField="overlayHtmlWithDiscount"
                      form={form}
                    />
                  </Form.Item>
                </Col>
                <Col lg={24} xs={24}>
                  <Form.Item label="Pre-Checkout Message (WithOUT Discount)">
                    <RichTextEditor
                      formField="overlayHtmlWithoutDiscount"
                      form={form}
                    />
                  </Form.Item>
                </Col>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane forceRender tab="Images" key="Images">
            <Col lg={12} xs={24}>
              <Row>
                <Col lg={6} xs={24}>
                  <Form.Item label="Colour">
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.colourLogo}
                      form={form}
                      formProp="colourLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item label="Black">
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.blackLogo}
                      form={form}
                      formProp="blackLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item label="White">
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.whiteLogo}
                      form={form}
                      formProp="whiteLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Logo Round"
                    rules={[{ required: true }]}
                    name="brandLogo"
                  >
                    <Upload.ImageUpload
                      fileList={initial?.brandLogo}
                      maxCount={1}
                      form={form}
                      formProp="brandLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Upload Card"
                    name="brandCard"
                    rules={[{ required: true }]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.brandCard}
                      form={form}
                      formProp="brandCard"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Thumbnail"
                    name="thumbnail"
                    rules={[{ required: false }]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.thumbnail}
                      form={form}
                      formProp="thumbnail"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Typography.Title style={{ marginBottom: '4vh' }} level={5}>
                Store Page Display
              </Typography.Title>
              <Row>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Mast Head Image"
                    name="mastHead"
                    rules={[{ required: true }]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.mastHead}
                      form={form}
                      formProp="mastHead"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={24}>
                  <Form.Item
                    label="Avatar"
                    name="avatar"
                    rules={[{ required: true }]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={initial?.avatar}
                      form={form}
                      formProp="avatar"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Secrets" key="Secrets">
            <BrandVaultForm />
          </Tabs.TabPane>
        </Tabs>
        {activeTabKey !== 'Secrets' && (
          <Row gutter={8}>
            <Col>
              <Button type="default" onClick={() => history.goBack()}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button loading={loading} type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    </>
  );
};

export default BrandDetail;

const ColorPicker: React.FC<any> = props => {
  const { onChange } = props;
  return (
    <TwitterPicker onChangeComplete={(value: any) => onChange(value.hex)} />
  );
};
