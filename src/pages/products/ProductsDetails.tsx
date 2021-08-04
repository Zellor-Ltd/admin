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
  Tabs,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { Upload } from "components";
import { formatMoment } from "helpers/formatMoment";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";
import { Brand } from "interfaces/Brand";
import { AllCategories } from "interfaces/Category";
import { Video } from "interfaces/Video";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { useParams } from "react-router-dom";
import {
  fetchBrands,
  saveProduct,
  saveStagingProduct,
} from "services/DiscoClubService";
import { RichTextEditor } from "components/RichTextEditor";
import ProductCategoriesTrees from "./ProductCategoriesTrees";
import { Product } from "interfaces/Product";
import "./ProductsDetails.scss";

const { categoriesKeys, categoriesFields } = categoriesSettings;

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

interface RouteParams {
  productMode: "staging" | "commited";
}

const ProductDetails: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const { productMode } = useParams<RouteParams>();
  const isStaging = productMode === "staging";
  const saveProductFn = isStaging ? saveStagingProduct : saveProduct;
  const productsListPathname = isStaging ? "/staging-products" : "/products";
  const initial = location.state as unknown as Product | undefined;
  const [loading, setLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();

  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const setPaymentUrlsByBrand = useCallback(
    (useInitialValue: boolean) => {
      const product = form.getFieldsValue(true);
      const selectedBrand = brands?.find(
        (brand: Brand) => brand.id === product.brand?.id
      );

      let confirmationUrl, cancelationUrl;

      if (useInitialValue && initial) {
        confirmationUrl =
          initial.confirmationUrl || selectedBrand?.confirmationUrl;
        cancelationUrl =
          initial.cancelationUrl || selectedBrand?.cancelationUrl;
      } else {
        confirmationUrl = selectedBrand?.confirmationUrl;
        cancelationUrl = selectedBrand?.cancelationUrl;
      }

      form.setFieldsValue({
        confirmationUrl,
        cancelationUrl,
      });
    },
    [brands, form, initial]
  );

  const setSearchTagsByCategory = useCallback(
    (useInitialValue: boolean, selectedCategories: any[] = []) => {
      const selectedCategoriesSearchTags = selectedCategories
        .filter((v) => v && v.searchTags)
        .map((v) => v.searchTags)
        .reduce((prev, curr) => {
          return prev?.concat(curr || []);
        }, []);

      let searchTags = form.getFieldValue("searchTags") || [];
      const finalValue = Array.from(
        new Set([...searchTags, ...selectedCategoriesSearchTags])
      );
      if (useInitialValue && initial) {
        searchTags = initial.searchTags || finalValue;
      } else {
        searchTags = finalValue;
      }

      form.setFieldsValue({
        searchTags,
      });
    },
    [form, initial]
  );

  const handleCategoryChange = (
    selectedCategories: any,
    productCategoryIndex: number,
    filterCategory: Function
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(false, selectedCategories);
  };

  useEffect(() => {
    setPaymentUrlsByBrand(true);
    setSearchTagsByCategory(true);
  }, [brands, setPaymentUrlsByBrand, setSearchTagsByCategory]);

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

    getBrands();
    fetchAllCategories();
    return () => {
      mounted = false;
    };
  }, [fetchAllCategories]);

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

      categoriesFields.forEach((field, index) => {
        product.categories.forEach((productCategory: any) => {
          productCategory[field] = allCategories[
            categoriesKeys[index] as keyof AllCategories
          ].find((category) => category.id === productCategory[field]?.id);
        });
      });

      await saveProductFn(product);

      setLoading(false);
      message.success("Register updated with success.");
      history.push(productsListPathname);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="products-details">
      <PageHeader title="Product" subTitle="Form" />
      <Form
        form={form}
        name="productForm"
        initialValues={initial}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => {
          errorFields.forEach((errorField) => {
            message.error(errorField.errors[0]);
          });
        }}
        layout="vertical"
      >
        <Tabs defaultActiveKey="Details">
          <Tabs.TabPane tab="Details" key="Details">
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
                    <Form.Item label="Long description">
                      <RichTextEditor formField="description" form={form} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name={["brand", "id"]}
                      label="Brand"
                      rules={[{ required: true }]}
                    >
                      <Select onChange={() => setPaymentUrlsByBrand(false)}>
                        {brands.map((brand) => (
                          <Select.Option key={brand.id} value={brand.id}>
                            {brand.brandName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={16} xs={24}>
                    <Form.Item
                      name="confirmationUrl"
                      label="Payment Confirmation URL"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={16} xs={24}>
                    <Form.Item
                      name="cancelationUrl"
                      label="Payment Cancelation URL"
                      rules={[{ required: true }]}
                    >
                      <Input />
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
                      label="Max Discount in DD"
                      rules={[{ required: true }]}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="originalPrice" label="Price">
                      <InputNumber
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value = "") =>
                          value.replace(/\$\s?|(,*)/g, "")
                        }
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
                  <Col lg={8} xs={24}>
                    <Form.Item name="checkout" label="Checkout">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="disco">Disco</Radio.Button>
                        <Radio.Button value="external">External</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="requireMobilePurchaseStatus"
                      label="Log Completed Purchases?"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="displayDiscountPage"
                      label="Allow Use of D-Dollars?"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item name="weight" label="Weight">
                      <Input type="number" placeholder="Weight in Kg" />
                    </Form.Item>
                  </Col>
                  <Col lg={16} xs={24}>
                    <Form.Item
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.checkout !== curValues.checkout
                      }
                    >
                      {({ getFieldValue }) =>
                        getFieldValue("checkout") === "external" && (
                          <Form.Item
                            name="externalCheckout"
                            label="External Checkout URL"
                            rules={[{ required: true }]}
                            style={{ marginBottom: "0px" }}
                          >
                            <Input />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Categories" key="Categories">
            <ProductCategoriesTrees
              categories={initial?.categories}
              allCategories={allCategories}
              form={form}
              handleCategoryChange={handleCategoryChange}
            />
            <Col lg={16} xs={24}>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.category !== curValues.category
                }
              >
                {({ getFieldValue }) => (
                  <Form.Item name={"searchTags"} label="Search Tags">
                    <Select mode="tags">
                      {getFieldValue("searchTags")?.map((searchTag: any) => (
                        <Select.Option key={searchTag} value={searchTag}>
                          {searchTag}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Typography.Title level={4}>Target</Typography.Title>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Age Range">
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
            </Row>
            <Row gutter={8}>
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
          </Tabs.TabPane>
          <Tabs.TabPane tab="Images" key="Images">
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
          </Tabs.TabPane>
        </Tabs>

        <Row gutter={8}>
          <Col>
            <Button
              type="default"
              onClick={() => history.push(productsListPathname)}
            >
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              disabled={initial?.brand.automated === true && !isStaging}
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductDetails;
