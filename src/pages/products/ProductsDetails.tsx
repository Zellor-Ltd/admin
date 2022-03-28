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
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { saveProduct, saveStagingProduct } from 'services/DiscoClubService';
import ProductCategoriesTrees from './ProductCategoriesTrees';
import './Products.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import { productUtils } from 'helpers/product-utils';
import { Image } from '../../interfaces/Image';
import { useRequest } from 'hooks/useRequest';
import update from 'immutability-helper';

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
  brand?: string;
  productBrand?: string;
  isFetchingBrands: boolean;
  isFetchingProductBrand: boolean;
  isLive: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  brands,
  productBrands,
  allCategories,
  product,
  productBrand,
  brand,
  onSave,
  onCancel,
  isFetchingBrands,
  isFetchingProductBrand,
  isLive,
}) => {
  const saveProductFn = isLive ? saveProduct : saveStagingProduct;
  const [loading, setLoading] = useState<boolean>(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });
  const [_product, _setProduct] = useState(product);

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  useEffect(() => {
    if (product) {
      _setProduct(product);
    }
  }, [product]);

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
    [brands, form]
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
    [form, product, allCategories]
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
      setAgeRange([product?.ageMin, product?.ageMax]);
  }, [product]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setAgeRange(value);
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
      formProduct.id
        ? onSave?.(formProduct)
        : onSave?.({ ...formProduct, id: result._id });
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

  const onAssignToThumbnail = (file: Image) => {
    if (_product) {
      form.setFieldsValue({ thumbnailUrl: file });
      _product.thumbnailUrl = file;
      _setProduct({ ..._product });
    }
  };

  const onAssignToTag = (file: Image) => {
    if (_product) {
      form.setFieldsValue({ tagImage: file });
      _product.tagImage = file;
      _setProduct({ ..._product });
    }
  };

  const onOrder = (dragIndex: number, hoverIndex: number) => {
    if (_product) {
      const dragImage = _product?.image[dragIndex];
      _product.image = update(_product.image as any, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragImage],
        ],
      });

      form.setFieldsValue({ image: _product.image });
      _setProduct({ ..._product });
    }
  };

  const onFitTo = (
    fitTo: 'w' | 'h',
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number
  ) => {
    if (!sourceProp) {
      throw new Error('missing sourceProp parameter');
    }
    if (_product) {
      switch (sourceProp) {
        case 'image':
          if (_product[sourceProp][imageIndex].fitTo === fitTo) {
            _product[sourceProp][imageIndex].fitTo = undefined;
          } else {
            _product[sourceProp][imageIndex].fitTo = fitTo;
          }
          break;
        default:
          if (_product[sourceProp].fitTo === fitTo) {
            _product[sourceProp].fitTo = undefined;
          } else {
            _product[sourceProp].fitTo = fitTo;
          }
      }

      form.setFieldsValue({ ..._product });
      _setProduct({ ..._product });
    }
  };

  const onRollback = (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number
  ) => {
    if (_product) {
      switch (sourceProp) {
        case 'image':
          _product[sourceProp][imageIndex].url = oldUrl;
          break;
        default:
          _product[sourceProp].url = oldUrl;
      }

      form.setFieldsValue({ ..._product });
      _setProduct({ ..._product });
    }
  };

  return (
    <div className="products-details">
      <PageHeader
        title={_product ? `${_product?.name} Update` : 'New Product'}
      />
      <Form
        form={form}
        name="productForm"
        initialValues={_product}
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
                      <Radio.Group disabled={isLive} buttonStyle="solid">
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
                      <Switch disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item name="name" label="Short description">
                      <Input disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Long description">
                      <RichTextEditor
                        formField="description"
                        form={form}
                        disabled={isLive}
                      />
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
                      rules={[
                        {
                          required: true,
                          message: `Master Brand is required.`,
                        },
                      ]}
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
                        disabled={isFetchingBrands || isLive}
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
                      rules={[
                        {
                          required: true,
                          message: `Product Brand is required.`,
                        },
                      ]}
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
                        disabled={isFetchingProductBrand || isLive}
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
                      <DatePicker format="DD/MM/YYYY" disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="validity"
                      label="Expiration Date"
                      getValueProps={formatMoment}
                    >
                      <DatePicker format="DD/MM/YYYY" disabled={isLive} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Categories" key="Categories">
            <ProductCategoriesTrees
              categories={_product?.categories}
              allCategories={allCategories}
              form={form}
              handleCategoryChange={handleCategoryChange}
              handleCategoryDelete={handleCategoryDelete}
              disabled={isLive}
            />
            <Col lg={16} xs={24}>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.category !== curValues.category
                }
              >
                {({ getFieldValue }) => (
                  <Form.Item name={'searchTags'} label="Search Tags">
                    <Select
                      mode="tags"
                      className="product-search-tags"
                      disabled={isLive}
                    >
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
                    disabled={isLive}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: `Gender is required.` }]}
                >
                  <Select mode="multiple" disabled={isLive}>
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
                  <Select
                    placeholder="Please select a currency"
                    disabled={isLive}
                  >
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
                  rules={[
                    { required: true, message: `Default Price is required.` },
                  ]}
                >
                  <InputNumber disabled={isLive} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCodeUS" label="Currency US">
                  <Select
                    placeholder="Please select a currency"
                    disabled={isLive}
                  >
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
                  <InputNumber disabled={isLive} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCodeGB" label="Currency UK">
                  <Select
                    placeholder="Please select a currency"
                    disabled={isLive}
                  >
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
                  <InputNumber disabled={isLive} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={8} xs={24}>
                <Form.Item name="currencyIsoCodeIE" label="Currency Europe">
                  <Select
                    placeholder="Please select a currency"
                    disabled={isLive}
                  >
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
                  <InputNumber disabled={isLive} />
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
                  <Switch disabled={isLive} />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item
                  name="onSale"
                  label="On Sale"
                  valuePropName="checked"
                >
                  <Switch disabled={isLive} />
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
                    disabled={isLive}
                  />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="discoPercentage" label="Disco Percentage %">
                  <InputNumber disabled={isLive} />
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
                  <InputNumber disabled={isLive} />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="magentoId" label="Magento Id">
                  <InputNumber disabled={isLive} />
                </Form.Item>
              </Col>
              <Col lg={4} xs={8}>
                <Form.Item name="sku" label="SKU">
                  <InputNumber disabled={isLive} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col lg={4} xs={8}>
                <Form.Item name="weight" label="Weight">
                  <InputNumber placeholder="Weight in Kg" disabled={isLive} />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Images" key="Images">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Form.Item label="Tag Image">
                  <Upload.ImageUpload
                    fileList={form.getFieldValue('tagImage')}
                    formProp="tagImage"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                    disabled={isLive}
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item label="Thumbnail">
                  <Upload.ImageUpload
                    fileList={form.getFieldValue('thumbnailUrl')}
                    formProp="thumbnailUrl"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                    disabled={isLive}
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item label="Image">
                  <div
                    className={
                      _product ? (_product.image ? 'img-upload-div' : '') : ''
                    }
                  >
                    <Upload.ImageUpload
                      maxCount={20}
                      fileList={form.getFieldValue('image')}
                      formProp="image"
                      form={form}
                      onAssignToTag={onAssignToTag}
                      onAssignToThumbnail={onAssignToThumbnail}
                      cropable={true}
                      classNames="big-image-height scroll-x"
                      onOrder={onOrder}
                      onFitTo={onFitTo}
                      onRollback={onRollback}
                      disabled={isLive}
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
              disabled={isLive}
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
