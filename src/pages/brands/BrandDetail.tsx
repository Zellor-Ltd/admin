import {
  Button,
  Col,
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
} from "antd";
import { Upload } from "components";
import { RichTextEditor } from "components/RichTextEditor";
import { Brand } from "interfaces/Brand";
import { useState } from "react";
import useFilter from "hooks/useFilter";
import { TwitterPicker } from "react-color";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { saveBrand } from "services/DiscoClubService";
import { PauseModal } from "./PauseModal";
import {
  deleteBrandVault,
  fetchBrandVault,
} from "../../services/DiscoClubService";
import EditableTable, { EditableColumnType } from "components/EditableTable";
import { SelectBrand } from "components/SelectBrand";

const BrandDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const detailsPathname = `${location.pathname}/brandvault`;
  const initial = location.state as unknown as Brand;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [paused, setPaused] = useState<boolean>(initial.paused || false);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);

  const {
    settings: { checkoutType = [] },
  } = useSelector((state: any) => state.settings);

  const onFinish = async () => {
    setLoading(true);
    try {
      const brand = form.getFieldsValue(true);
      await saveBrand(brand);
      setLoading(false);
      message.success("Register updated with success.");
      history.goBack();
    } catch (error) {
      setLoading(false);
    }
  };

  const {
    arrayList: orders,
    setArrayList: setOrders,
    filteredArrayList: filteredOrders,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Brand>([]);

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction("brandName");
      return;
    }
    addFilterFunction("brandName", (brands) =>
      brands.filter((brand) => brand.brandName === _selectedBrand.brandName)
    );
  };

  const onCompletePausedAction = () => {
    form.setFieldsValue({
      paused: !paused,
    });
    setPaused(!paused);
  };

  const handlePausedChange = () => {
    setShowPauseModal(true);
  };

  const handleCheckoutTypeChange = (e: RadioChangeEvent) => {
    const type = e.target.value;
    form.setFieldsValue({
      requireMobilePurchaseStatus: type === "external",
    });
  };

  return (
    <>
      <PageHeader title="Brand Update" subTitle="Brand" />
      <Form
        name="brandForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Tabs defaultActiveKey="Details">
          <Tabs.TabPane tab="Details" key="Details">
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
              <Col lg={3} xs={3}>
                <Form.Item label="Paused" valuePropName="checked">
                  <Switch onChange={handlePausedChange} checked={paused} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Col lg={16} xs={24}>
                  <Form.Item label="Brand Name" name="brandName">
                    <Input />
                  </Form.Item>
                </Col>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Brand Color"
                  name="brandTxtColor"
                  rules={[{ required: true }]}
                  valuePropName="color"
                >
                  <ColorPicker />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Checkout" key="Checkout">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Col lg={16} xs={24}>
                  <Form.Item label="Brand Name" name="brandName">
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
                      {checkoutType.map((curr: any) => (
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
                          disabled={getFieldValue("checkout") === "Disco"}
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

          <Tabs.TabPane tab="Images" key="Images">
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
            </Col>
          </Tabs.TabPane>
        </Tabs>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" onClick={onFinish}>
              Save Changes
            </Button>
          </Col>
        </Row>
        <PauseModal
          showPauseModal={showPauseModal}
          setShowPauseModal={setShowPauseModal}
          brandId={initial.id}
          isBrandPaused={paused}
          onOk={onCompletePausedAction}
        />
      </Form>
    </>
  );
};

export default BrandDetail;

const ColorPicker: React.FC<any> = (props) => {
  const { onChange } = props;
  return (
    <TwitterPicker onChangeComplete={(value: any) => onChange(value.hex)} />
  );
};
