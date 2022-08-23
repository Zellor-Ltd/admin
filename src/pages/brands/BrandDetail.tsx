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
  Modal,
} from 'antd';
import { Upload } from 'components';
import { RichTextEditor } from 'components/RichTextEditor';
import { Brand } from 'interfaces/Brand';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRequest } from 'hooks/useRequest';
import { TwitterPicker } from 'react-color';
import { useSelector } from 'react-redux';
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
import scrollIntoView from 'scroll-into-view';
import { Link } from 'react-router-dom';
interface BrandDetailProps {
  onSave?: (record: Brand) => void;
  onCancel?: () => void;
  brand?: Brand;
}

const BrandDetail: React.FC<BrandDetailProps> = ({
  brand,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [vaults, setVaults] = useState<BrandVault[]>([]);
  const [currentVault, setCurrentVault] = useState<any>();
  const [activeTabKey, setActiveTabKey] = React.useState('Details');
  const [vaultOptions, setVaultOptions] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const { doRequest } = useRequest({ setLoading });
  const [form] = Form.useForm();
  const [vaultForm] = Form.useForm();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [internalCheckout, setInternalCheckout] = useState<boolean>(
    brand?.checkoutType === 'internal'
  );

  const {
    settings: { checkoutType = [] },
  } = useSelector((state: any) => state.settings);

  const [checkoutTypeList, setCheckoutTypeList] =
    useState<string[]>(checkoutType);

  const fetchVaults = async () => {
    if (brand) {
      if (brand.shopName) {
        const { results } = await doFetch(() =>
          fetchBrandVault(brand.shopName as string)
        );
        setVaults(results);
      }
    }
  };

  useEffect(() => {
    for (let i = 2; i < 12; i += 2) {
      if (document.getElementById(`rc-editable-input-${i}`)) {
        var picker: any = document.getElementById(`rc-editable-input-${i}`);
        picker.value = brand?.brandTxtColor;
        break;
      }
    }
  });

  useEffect(() => {
    if (activeTabKey === 'Secrets') {
      setVaultOptions(false);
      fetchVaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabKey]);

  useEffect(() => {
    if (!vaultOptions) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [vaultOptions]);

  const deleteItem = async (vault: BrandVault, index: number) => {
    deleteBrandVault(vault.id);
    setVaults(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
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

  const editVault = (vault: any, index: number) => {
    setLastViewedIndex(index);
    setCurrentVault(vault);
    vaultForm.resetFields();
    setVaultOptions(true);
  };

  const newItem = () => {
    setLastViewedIndex(vaults.length);
    setCurrentVault({ shopName: brand?.shopName ?? '' });
    vaultForm.resetFields();
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
      render: (value: string, record: BrandVault, index: number) => (
        <Link
          to={window.location.pathname}
          onClick={() => editVault(record, index)}
        >
          {value}
        </Link>
      ),
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
      render: (_, record: BrandVault, index: number) => (
        <>
          <Button type="link" onClick={() => editVault(record, index)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record, index)}
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
    try {
      const formBrand = form.getFieldsValue(true);
      const response: any = await saveBrand(formBrand);
      message.success('Register updated with success.');
      formBrand.id
        ? onSave?.(formBrand)
        : onSave?.({ ...formBrand, id: response.result });
    } catch (error) {
      console.log(error as string);
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
      setInternalCheckout(true);
    } else {
      setCheckoutTypeList(checkoutType);
      setInternalCheckout(false);
    }
  };

  const changeTab = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const returnFromVault = () => {
    setVaultOptions(false);
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
                    rules={[{ required: true, message: `Key is required.` }]}
                    initialValue={currentVault?.key}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="Shop Name"
                    name="shopName"
                    rules={[
                      { required: true, message: `Shop Name is required.` },
                    ]}
                    initialValue={brand ? brand.shopName : ''}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="API Shop Name"
                    name="apiShopName"
                    rules={[
                      { required: true, message: `API Shop Name is required.` },
                    ]}
                    initialValue={currentVault?.apiShopName}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    label="Token"
                    name="token"
                    rules={[{ required: true, message: `Token is required.` }]}
                    initialValue={currentVault?.token}
                  >
                    <Input type="password" />
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
              <Col span={24}>
                <Table
                  rowClassName={(_, index) => `scrollable-row-${index}`}
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

  const onConfirmPropagate = () => {
    form.setFieldsValue({ propagationNeeded: true });
    setShowModal(false);
  };

  const onCancelPropagate = () => {
    form.setFieldsValue({ propagationNeeded: false });
    setShowModal(false);
  };

  const handleCreatorPercentageChange = (input: number) => {
    form.setFieldsValue({ creatorPercentage: input });
    setShowModal(true);
  };

  return (
    <>
      <PageHeader
        title={
          vaultOptions
            ? 'Vault Update'
            : brand
            ? `${brand.brandName} Update`
            : 'New Master Brand'
        }
      />
      <Form
        className=""
        name="brandForm"
        layout="vertical"
        form={form}
        initialValues={brand}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => {
          errorFields.forEach(errorField => {
            message.error('Error: ' + errorField.errors[0]);
          });
        }}
      >
        <Tabs
          defaultActiveKey="Details"
          activeKey={activeTabKey}
          onChange={changeTab}
          tabBarExtraContent={
            activeTabKey === 'Secrets' &&
            !vaultOptions && (
              <Button key="1" onClick={() => newItem()}>
                New Vault
              </Button>
            )
          }
        >
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8} align="bottom">
              <Col lg={4} xs={8}>
                <Form.Item
                  name="automated"
                  label="Automated"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item
                  name="showOutOfStock"
                  label="Show Out of Stock"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col lg={5} xs={8}>
                <Form.Item
                  name="removeVideo"
                  label="Remove video if no product"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item label="Master Brand Name" name="brandName">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Master Brand Color"
                  name="brandTxtColor"
                  rules={[
                    {
                      required: true,
                      message: 'Master Brand Color is required.',
                    },
                  ]}
                >
                  <ColorPicker />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
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
                    rules={[
                      { required: true, message: 'Checkout Type is required.' },
                    ]}
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
                    shouldUpdate
                    name="externalCheckoutType"
                    label="External Checkout Type"
                    rules={[
                      {
                        required: !internalCheckout,
                        message: 'External Checkout Type is required.',
                      },
                    ]}
                  >
                    <Select
                      disabled={internalCheckout}
                      placeholder="Select an external checkout type"
                    >
                      <Select.Option key={1} value={'Option 1'}>
                        Option 1
                      </Select.Option>
                      <Select.Option key={2} value={'Option 2'}>
                        Option 2
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="checkout"
                    label="Checkout"
                    rules={[
                      { required: true, message: 'Checkout is required.' },
                    ]}
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
                    rules={[
                      {
                        required: true,
                        message:
                          'External Payment Confirmation URL is required.',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="cancelationUrl"
                    label="External Payment Cancelation URL"
                    rules={[
                      {
                        required: true,
                        message:
                          'External Payment Cancelation URL is required.',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Row gutter={4}>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="discoPercentage"
                      label="Disco Percentage %"
                      rules={[
                        {
                          required: true,
                          message: 'Disco Percentage is required.',
                        },
                      ]}
                    >
                      <InputNumber
                        pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                        title="positive integers"
                        min={0}
                        max={100}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="creatorPercentage"
                      label="Creator %"
                      rules={[
                        {
                          required: true,
                          message: 'Creator Percentage is required.',
                        },
                      ]}
                    >
                      <InputNumber
                        pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                        title="positive integers"
                        min={0}
                        max={100}
                        onChange={input => handleCreatorPercentageChange(input)}
                      />
                      <Modal
                        title="Apply to all products?"
                        visible={showModal}
                        onOk={onConfirmPropagate}
                        onCancel={onCancelPropagate}
                        okText="Yes"
                        cancelText="No"
                      >
                        <p>
                          Would you like to apply this creator percentage to all{' '}
                          {brand?.brandName} products?
                        </p>
                      </Modal>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={4}>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="maxDiscoDollarPercentage"
                      label="Max Disco Dollar %"
                      rules={[
                        {
                          required: true,
                          message: 'Max Disco Dollar percentage is required.',
                        },
                      ]}
                    >
                      <InputNumber
                        pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                        title="positive integers"
                        min={0}
                        max={100}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="initialFreeDdAmount"
                      label="Initial Free Disco Dollars"
                      rules={[
                        {
                          required: true,
                          message: 'Initial Free Disco Dollars is required.',
                        },
                      ]}
                    >
                      <InputNumber
                        pattern="^[0-9]*$"
                        title="positive integers"
                        min={0}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={4}>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="returnPeriod"
                      label="Return Period (days)"
                      initialValue={14}
                      rules={[
                        {
                          required: true,
                          message: 'Return Period is required.',
                        },
                      ]}
                    >
                      <InputNumber
                        pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                        title="positive integers"
                        min={1}
                        max={100}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Col lg={16} xs={24}>
                  <Form.Item
                    name="shopName"
                    label="Shop Name (without https:// or spaces)"
                    rules={[
                      { required: true, message: 'Shop Name is required.' },
                    ]}
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
            <Col lg={16} xs={24}>
              <Row className="mx-1">
                <Col lg={6} xs={12}>
                  <Form.Item label="Colour">
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.colourLogo}
                      form={form}
                      formProp="colourLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item label="Black">
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.blackLogo}
                      form={form}
                      formProp="blackLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item label="White">
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.whiteLogo}
                      form={form}
                      formProp="whiteLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item
                    label="Logo Round"
                    rules={[
                      { required: true, message: 'Logo Round is required.' },
                    ]}
                    name="brandLogo"
                  >
                    <Upload.ImageUpload
                      fileList={brand?.brandLogo}
                      maxCount={1}
                      form={form}
                      formProp="brandLogo"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item
                    label="Upload Card"
                    name="brandCard"
                    rules={[
                      { required: true, message: 'Upload Card is required.' },
                    ]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.brandCard}
                      form={form}
                      formProp="brandCard"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item
                    label="Thumbnail"
                    name="thumbnail"
                    rules={[
                      { required: false, message: `Thumbnail is required.` },
                    ]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.thumbnail}
                      form={form}
                      formProp="thumbnail"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item
                    label="Store Buy Button"
                    name="storeBuyButton"
                    rules={[
                      {
                        required: false,
                        message: `Store Buy Button is required.`,
                      },
                    ]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.storeBuyButton}
                      form={form}
                      formProp="storeBuyButton"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Typography.Title style={{ marginBottom: '4vh' }} level={5}>
                Store Page Display
              </Typography.Title>
              <Row className="mx-1">
                <Col lg={6} xs={12}>
                  <Form.Item
                    label="Masthead Image"
                    name="mastHead"
                    rules={[
                      {
                        required: true,
                        message: 'Masthead Image is required.',
                      },
                    ]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.mastHead}
                      form={form}
                      formProp="mastHead"
                    />
                  </Form.Item>
                </Col>
                <Col lg={6} xs={12}>
                  <Form.Item
                    label="Avatar"
                    name="avatar"
                    rules={[{ required: true, message: 'Avatar is required.' }]}
                  >
                    <Upload.ImageUpload
                      maxCount={1}
                      fileList={brand?.avatar}
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
        )}
      </Form>
    </>
  );
};

export default BrandDetail;

const ColorPicker: React.FC<any> = props => {
  const { onChange } = props;

  const _onChange = input => {
    onChange(input);
    for (let i = 2; i < 12; i += 2) {
      if (document.getElementById(`rc-editable-input-${i}`)) {
        var picker: any = document.getElementById(`rc-editable-input-${i}`);
        picker.value = input;
        break;
      }
    }
  };

  return (
    <TwitterPicker onChangeComplete={(value: any) => _onChange(value.hex)} />
  );
};
