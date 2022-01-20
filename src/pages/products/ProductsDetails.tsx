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
import { RichTextEditor } from 'components/RichTextEditor';
import { formatMoment } from 'helpers/formatMoment';
import { categoriesSettings } from 'helpers/utils';
import { Brand } from 'interfaces/Brand';
import { ProductBrand } from '../../interfaces/ProductBrand';
import { AllCategories } from 'interfaces/Category';
import { Product } from 'interfaces/Product';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { saveProduct, saveStagingProduct } from 'services/DiscoClubService';
import ProductCategoriesTrees from './ProductCategoriesTrees';
import './Products.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import { productUtils } from 'helpers/product-utils';
import { Image } from '../../interfaces/Image';
import { useRequest } from 'hooks/useRequest';

const { categoriesKeys, categoriesFields } = categoriesSettings;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  productUtils;
interface ProductDetailsProps {
  brands: Brand[];
  productBrands: ProductBrand[];
  allCategories: any;
  onSave?: (record: Product) => void;
  onCancel?: () => void;
  product?: Product;
  setCurrentProduct: (Product) => void;
  brand?: string;
  productBrand?: string;
  isFetchingBrands: boolean;
  isFetchingProductBrand: boolean;
  onOrder?: (dragIndex: number, hoverIndex: number) => void;
  onFitTo?: (
    fitTo: 'w' | 'h',
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number
  ) => void;
  onRollback?: (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number
  ) => void;
}

const optionsMapping: SelectOption = {
  key: 'id',
  label: 'brandName',
  value: 'id',
};
interface RouteParams {
  productMode: 'staging' | 'committed';
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  brands,
  productBrands,
  allCategories,
  product,
  setCurrentProduct,
  productBrand,
  brand,
  onSave,
  onCancel,
  isFetchingBrands,
  isFetchingProductBrand,
  onOrder,
  onFitTo,
  onRollback,
}) => {
  const { productMode } = useParams<RouteParams>();
  const isStaging = productMode === 'staging';
  const saveProductFn = isStaging ? saveStagingProduct : saveProduct;
  const [loading, setLoading] = useState<boolean>(false);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const setDiscoPercentageByBrand = useCallback(
    (useInitialValue: boolean) => {
      const product = form.getFieldsValue(true);
      const selectedBrand = brands?.find(
        (brand: Brand) => brand.id === product.brand?.id
      );

      let discoPercentage;

      if (useInitialValue && product) {
        discoPercentage =
          product.discoPercentage || selectedBrand?.discoPercentage;
      } else {
        discoPercentage = selectedBrand?.discoPercentage;
      }

      form.setFieldsValue({
        discoPercentage,
      });
    },
    [brands, form, product]
  );

  const setSearchTagsByCategory = useCallback(
    (
      useInitialValue: boolean,
      selectedCategories: any[] = [],
      categoryKey?: string,
      productCategoryIndex?: number
    ) => {
      const currentCategories = getCategories(form, allCategories);
      let previousTags: string[] = [];

      if (
        productCategoryIndex !== undefined &&
        categoryKey !== undefined &&
        product &&
        product?.categories
      ) {
        previousTags = getSearchTags(
          product.categories[productCategoryIndex],
          categoryKey
        );
      }

      const selectedCategoriesSearchTags = selectedCategories
        .filter(v => v && v.searchTags)
        .map(v => v.searchTags)
        .reduce((prev, curr) => {
          return prev?.concat(curr || []);
        }, []);

      let searchTags = form.getFieldValue('searchTags') || [];
      const finalValue = Array.from(
        new Set([
          ...searchTags.filter(tag => previousTags.indexOf(tag) === -1),
          ...selectedCategoriesSearchTags,
        ])
      );
      if (useInitialValue && product) {
        searchTags = product.searchTags || finalValue;
      } else {
        searchTags = finalValue;
      }

      if (
        !!selectedCategories &&
        !!product &&
        !!product.categories &&
        productCategoryIndex !== undefined
      ) {
        product.categories[productCategoryIndex] = currentCategories;
      }

      form.setFieldsValue({
        searchTags,
      });
    },
    [form, product]
  );

  const handleCategoryDelete = (productCategoryIndex: number) => {
    removeSearchTagsByCategory(productCategoryIndex, product, form);
  };

  const handleCategoryChange = (
    selectedCategories: any,
    _productCategoryIndex: number,
    filterCategory: Function,
    categoryKey: string
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(
      false,
      selectedCategories,
      categoryKey,
      _productCategoryIndex
    );
  };

  useEffect(() => {
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
  }, [brands, setDiscoPercentageByBrand, setSearchTagsByCategory]);

  useEffect(() => {
    if (product?.ageMin && product?.ageMax)
      setageRange([product?.ageMin, product?.ageMax]);
  }, [product]);

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
      const formProduct = form.getFieldsValue(true);
      formProduct.brand = brands?.find(
        brand => brand.id === formProduct.brand?.id
      );

      categoriesFields.forEach((field, index) => {
        formProduct.categories.forEach((productCategory: any) => {
          productCategory[field] = allCategories[
            categoriesKeys[index] as keyof AllCategories
          ].find(category => category.id === productCategory[field]?.id);
        });
      });

      const { result } = await doRequest(() => saveProductFn(formProduct));

      setLoading(false);
      message.success('Register updated with success.');
      formProduct.id
        ? onSave?.(formProduct)
        : onSave?.({ ...formProduct, id: result });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const updateForm = (
    _: string,
    entity: any,
    type: 'brand' | 'productBrand'
  ) => {
    setDiscoPercentageByBrand(false);
    if (type === 'brand') {
      form.setFieldsValue({ brand: entity });
    } else {
      form.setFieldsValue({ productBrand: entity });
    }
  };

  const handleThumbnailOrTagReplacement = (prevImage: Image) => {
    if (product) {
      if (!product.image.some(img => img.url === prevImage.url)) {
        product.image.push(prevImage);
      }
    }
  };

  const onAssignToThumbnail = (file: Image) => {
    if (product) {
      const prevThumb = { ...product.thumbnailUrl };
      product.thumbnailUrl = { ...file };
      handleThumbnailOrTagReplacement(prevThumb);
      setCurrentProduct({ ...product });
    }
  };

  const onAssignToTag = (file: Image) => {
    if (product) {
      const prevTag = { ...product.tagImage };
      product.tagImage = { ...file };
      handleThumbnailOrTagReplacement(prevTag);
      setCurrentProduct({ ...product });
    }
  };

  return (
    <div className="products-details">
      <PageHeader
        title={product ? `${product?.name} Update` : 'New Product'}
        subTitle="Form"
      />
      <Form
        form={form}
        name="productForm"
        initialValues={product}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => {
          errorFields.forEach(errorField => {
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
                      name="brand"
                      label="Master Brand"
                      rules={[{ required: true }]}
                    >
                      <SimpleSelect
                        data={brands}
                        onChange={(value, brand) =>
                          updateForm(value, brand, 'brand')
                        }
                        style={{ width: '100%' }}
                        selectedOption={brand}
                        optionsMapping={optionsMapping}
                        placeholder={'Select a brand'}
                        loading={isFetchingBrands}
                        disabled={isFetchingBrands}
                        allowClear={true}
                      ></SimpleSelect>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="productBrand"
                      label="Product Brand"
                      rules={[{ required: true }]}
                    >
                      <SimpleSelect
                        data={productBrands}
                        onChange={(value, productBrand) =>
                          updateForm(value, productBrand, 'productBrand')
                        }
                        style={{ width: '100%' }}
                        selectedOption={productBrand}
                        optionsMapping={optionsMapping}
                        placeholder={'Select a brand'}
                        loading={isFetchingProductBrand}
                        disabled={isFetchingProductBrand}
                        allowClear={true}
                      ></SimpleSelect>
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
              categories={product?.categories}
              allCategories={allCategories}
              form={form}
              handleCategoryChange={handleCategoryChange}
              handleCategoryDelete={handleCategoryDelete}
            />
            <Col lg={16} xs={24}>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.category !== curValues.category
                }
              >
                {({ getFieldValue }) => (
                  <Form.Item name={'searchTags'} label="Search Tags">
                    <Select mode="tags" className="product-search-tags">
                      {getFieldValue('searchTags')?.map((searchTag: any) => (
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
                    marks={{ 12: '12', 100: '100' }}
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
                  dependencies={['originalPrice']}
                  rules={[
                    {
                      required: true,
                      message: 'Max Discount is required.',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, maxDiscount) {
                        // 3x the price
                        const maxPossibleDiscount = Math.trunc(
                          Number(getFieldValue('originalPrice')) * 3
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
                            new Error('Max discount not allowed.')
                          );
                        }
                        setMaxDiscountAlert(false);
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    parser={value => (value || '').replace(/-/g, '')}
                    precision={0}
                  />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="discoPercentage" label="Disco Percentage %">
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={4} xs={8}>
                <Form.Item
                  name="shopifyUniqueId"
                  label="Shopify Uid"
                  rules={[{}]}
                >
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="magentoId" label="Magento Id">
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="sku" label="SKU">
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
                    fileList={product?.tagImage}
                    formProp="tagImage"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item label="Thumbnail">
                  <Upload.ImageUpload
                    fileList={product?.thumbnailUrl}
                    formProp="thumbnailUrl"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item label="Image">
                  <div
                    className={
                      product ? (product.image ? 'img-upload-div' : '') : ''
                    }
                  >
                    <Upload.ImageUpload
                      maxCount={20}
                      fileList={product?.image}
                      formProp="image"
                      form={form}
                      onAssignToTag={onAssignToTag}
                      onAssignToThumbnail={onAssignToThumbnail}
                      cropable={true}
                      classNames="big-image-height scroll-x"
                      onOrder={onOrder}
                      onFitTo={onFitTo}
                      onRollback={onRollback}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>

        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              disabled={
                form.getFieldValue('brand')
                  ? (
                      brands.find(
                        item =>
                          item.brandName ===
                          form.getFieldValue('brand').brandName
                      ) as Brand
                    ).automated === true
                  : false
              }
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
