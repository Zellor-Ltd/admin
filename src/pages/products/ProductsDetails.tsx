import { ColumnsType } from "antd/lib/table";
import { Brand } from "interfaces/Brand";
import { Video } from "interfaces/Video";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  fetchBrands,
  fetchCategories,
  saveProduct,
} from "services/DiscoClubService";
import { formatMoment } from "helpers/formatMoment";
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
  Table,
  Typography,
} from "antd";
import { useSelector } from "react-redux";
import { Upload } from "components";
import { Category } from "interfaces/Category";

const videoColumns: ColumnsType<Video> = [
  {
    title: "ID",
    dataIndex: "videoFeedId",
    width: "50%",
    align: "center",
  },
  {
    title: "Thumbnail URL",
    dataIndex: "thumbnailUrl",
    width: "50%",
  },
];

const ProductDetails: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  useEffect(() => {
    let mounted = true;

    const getBrands = async () => {
      setLoading(true);
      const response: any = await fetchBrands();
      if (mounted) {
        setLoading(false);
        setBrands(response.results);
      }
    };
    async function getCategories() {
      const response: any = await fetchCategories();
      setCategories(response.results);
    }

    getBrands();
    getCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initial?.ageMin && initial?.ageMax)
      setageRange([initial?.ageMin, initial?.ageMax]);
  }, [initial]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setageRange(value);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const product = form.getFieldsValue(true);
      product.brand = brands?.find((brand) => brand.id === product.brand?.id);

      product.category = categories?.find(
        (category) => category.id === product.category?.id
      );
      await saveProduct(product);

      setLoading(false);
      message.success("Register updated with success.");
      history.push("/products");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Product" subTitle="Form" />
      <Form
        form={form}
        name="productForm"
        initialValues={initial}
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Row gutter={8}>
              <Col lg={20} xs={24}>
                <Form.Item name="status" label="Status">
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="live">Live</Radio.Button>
                    <Radio.Button value="paused">Paused</Radio.Button>
                    <Radio.Button value="expired">Expired</Radio.Button>
                    <Radio.Button value="pending">Pending</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col lg={4} xs={24}>
                <Form.Item
                  name="outOfStock"
                  label="Out of stock"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="name" label="Short description">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="description" label="Long description">
                  <Input.TextArea rows={5} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col lg={12} xs={24}>
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item name="currencyIsoCode" label="Currency">
                  <Select placeholder="Please select a currency">
                    {currency.map((curr: any) => (
                      <Select.Option key={curr.value} value={curr.value}>
                        {curr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="maxDiscoDollars"
                  label="Max Discount"
                  rules={[{ required: true }]}
                >
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="originalPrice" label="Normal Price">
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value = "") => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="discountedPrice" label="Discounted Price">
                  <InputNumber
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value = "") => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>

              <Col lg={24} xs={24}>
                <Form.Item name="tagText" label="Tag Text">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="goLiveDate"
                  label="Go Live Date"
                  getValueProps={formatMoment}
                >
                  <DatePicker format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="validity"
                  label="Expiration Date"
                  getValueProps={formatMoment}
                >
                  <DatePicker format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name={["brand", "id"]} label="Brand">
                  <Select>
                    {brands.map((brand) => (
                      <Select.Option key={brand.id} value={brand.id}>
                        {brand.brandName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name={["category", "id"]}
                  label="Category"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Please select a category">
                    {categories.map((category: any) => (
                      <Select.Option key={category.id} value={category.id}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="checkout" label="Checkout">
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="disco">Disco</Radio.Button>
                    <Radio.Button value="external">External</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col lg={16} xs={24}>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.checkout !== curValues.checkout
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue("checkout") === "external" ? (
                      <Form.Item
                        name="externalCheckout"
                        label="External Checkout URL"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </Col>
            </Row>
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
                marks={{ 12: "12", 100: "100" }}
                min={12}
                max={100}
                value={ageRange}
                onChange={onChangeAge}
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
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
        <Row gutter={8}>
          <Col lg={24} xs={24}>
            <Form.Item label="Tag Image">
              <Upload.ImageUpload
                fileList={initial?.tagImage}
                formProp="tagImage"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item label="Thumbnail">
              <Upload.ImageUpload
                fileList={initial?.thumbnailUrl}
                formProp="thumbnailUrl"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item label="Image">
              <Upload.ImageUpload
                maxCount={20}
                fileList={initial?.image}
                formProp="image"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col lg={24}>
            <Typography.Title level={5}>Videos feed</Typography.Title>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.relatedVideoFeed !== curValues.relatedVideoFeed
              }
            >
              {({ getFieldValue }) => {
                const relatedVideoFeed: Video[] =
                  getFieldValue("relatedVideoFeed") || [];
                return (
                  <Table
                    columns={videoColumns}
                    dataSource={relatedVideoFeed}
                    bordered
                    rowKey={(record) => `video_${record.videoFeedId}`}
                  />
                );
              }}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/products")}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ProductDetails;
