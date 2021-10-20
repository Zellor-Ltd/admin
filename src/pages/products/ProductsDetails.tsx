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
} from "antd";
import { Upload } from "components";
import { RichTextEditor } from "components/RichTextEditor";
import { formatMoment } from "helpers/formatMoment";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";
import { Brand } from "interfaces/Brand";
import { AllCategories } from "interfaces/Category";
import { Product } from "interfaces/Product";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps, useParams } from "react-router-dom";
import {
  fetchBrands,
  saveProduct,
  saveStagingProduct,
} from "services/DiscoClubService";
import ProductCategoriesTrees from "./ProductCategoriesTrees";
import "./Products.scss";

const { categoriesKeys, categoriesFields } = categoriesSettings;

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

  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);

  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

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

  const setDiscoPercentageByBrand = useCallback(
    (useInitialValue: boolean) => {
      const product = form.getFieldsValue(true);
      const selectedBrand = brands?.find(
        (brand: Brand) => brand.id === product.brand?.id
      );

      let discoPercentage;

      if (useInitialValue && initial) {
        discoPercentage =
          initial.discoPercentage || selectedBrand?.discoPercentage;
      } else {
        discoPercentage = selectedBrand?.discoPercentage;
      }

      form.setFieldsValue({
        discoPercentage,
      });
    },
    [brands, form, initial]
  );

  const handleCategoryChange = (
    selectedCategories: any,
    _productCategoryIndex: number,
    filterCategory: Function
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(false, selectedCategories);
  };

  useEffect(() => {
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
  }, [brands, setDiscoPercentageByBrand, setSearchTagsByCategory]);

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
      history.goBack();
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
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Row gutter={8}>
                  <Col lg={20} xs={24}>
                    <Form.Item name="status" label="Status">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="live">Live</Radio.Button>
                        <Radio.Button value="paused">Paused</Radio.Button>
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
                </Row>
              </Col>
              <Col lg={12} xs={24}>
                <Row gutter={8}>
                  <Col lg={24} xs={24}>
                    <Form.Item
                      name={["brand", "id"]}
                      label="Master Brand"
                      rules={[{ required: true }]}
                    >
                      <Select onChange={() => setDiscoPercentageByBrand(false)}>
                        {brands.map((brand) => (
                          <Select.Option key={brand.id} value={brand.id}>
                            {brand.brandName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
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
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Categories" key="Categories">
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
                    <Select mode="tags" className="product-search-tags">
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
          <Tabs.TabPane forceRender tab="Checkout" key="Checkout">
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCode" label="Default Currency">
                  <Select placeholder="Please select a currency">
                    {currency.map((curr: any) => (
                      <Select.Option key={curr.value} value={curr.value}>
                        {curr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item
                  name="originalPrice"
                  label="Default Price"
                  rules={[{ required: true }]}
                >
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCodeUS" label="Currency US">
                  <Select placeholder="Please select a currency">
                    {currency.map((curr: any) => (
                      <Select.Option key={curr.value} value={curr.value}>
                        {curr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="originalPriceUS" label="Price US" rules={[{}]}>
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCodeGB" label="Currency UK">
                  <Select placeholder="Please select a currency">
                    {currency.map((curr: any) => (
                      <Select.Option key={curr.value} value={curr.value}>
                        {curr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item name="originalPriceGB" label="Price UK" rules={[{}]}>
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCodeIE" label="Currency Europe">
                  <Select placeholder="Please select a currency">
                    {currency.map((curr: any) => (
                      <Select.Option key={curr.value} value={curr.value}>
                        {curr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={8} xs={24}>
                <Form.Item
                  name="originalPriceIE"
                  label="Price Europe"
                  rules={[{}]}
                >
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={4} xs={8}>
                <Form.Item
                  name="displayDiscountPage"
                  label="Allow Use of DD?"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item
                  name="maxDiscoDollars"
                  label="Max Discount in DD"
                  dependencies={["originalPrice"]}
                  rules={[
                    {
                      required: true,
                      message: "Max Discount is required.",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, maxDiscount) {
                        // 3x the price
                        const maxPossibleDiscount = Math.trunc(
                          Number(getFieldValue("originalPrice")) * 3
                        );
                        if (maxDiscount && maxDiscount > maxPossibleDiscount) {
                          if (!maxDiscountAlert) {
                            setTimeout(
                              () =>
                                alert(
                                  `The largest amount of DD you can apply for this price is ${maxPossibleDiscount}.`
                                ),
                              100
                            );
                          }
                          setMaxDiscountAlert(true);
                          return Promise.reject(
                            new Error("Max discount not allowed.")
                          );
                        }
                        setMaxDiscountAlert(false);
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    parser={(value) => (value || "").replace(/-/g, "")}
                    precision={0}
                  />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="discoPercentage" label="Disco Percentage %">
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item
                  name="shopifyUniqueId"
                  label="Shopify Uid"
                  rules={[{}]}
                >
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={4} xs={8}>
                <Form.Item name="weight" label="Weight">
                  <Input type="number" placeholder="Weight in Kg" />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Images" key="Images">
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
