/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Radio,
  Row,
  Select,
  Switch,
} from 'antd';
import { Upload } from 'components';
import { categoryMapper } from 'helpers/categoryMapper';
import { categoryUtils } from 'helpers/categoryUtils';
import { Brand } from 'interfaces/Brand';
import { ProductBrand } from '../../interfaces/ProductBrand';
import { AllCategories } from 'interfaces/Category';
import { Product } from 'interfaces/Product';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { saveStagingProduct } from 'services/DiscoClubService';
import './Products.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import { Image } from '../../interfaces/Image';
import { useRequest } from 'hooks/useRequest';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
import DOMPurify from 'isomorphic-dompurify';

const { categoriesKeys, categoriesFields } = categoryMapper;
const { getSearchTags, getCategories } = categoryUtils;
interface ShortProductDetailProps {
  brands: Brand[];
  productBrands: ProductBrand[];
  allCategories: any;
  onSave?: (record: Product) => void;
  onCancel?: () => void;
  product?: Product;
  brand?: string;
  productBrand?: string;
  isLive: boolean;
  template?: boolean;
  loadingResources?: boolean;
}

const ShortProductDetail: React.FC<ShortProductDetailProps> = ({
  brands,
  productBrands,
  allCategories,
  product,
  productBrand,
  brand,
  onSave,
  onCancel,
  isLive,
  template,
  loadingResources,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [_product, _setProduct] = useState(product);
  const toFocus = useRef<any>();

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  useEffect(() => {
    if (product) {
      _setProduct(product);
    }
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
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

  const checkConstraintValidity = () => {
    const quantity = document.getElementById('quantity') as HTMLInputElement;
    const barcode = document.getElementById('barcode') as HTMLInputElement;
    const variantId = document.getElementById('variantId') as HTMLInputElement;
    const elements = [barcode, variantId, quantity];
    toFocus.current = elements.find(item => !item?.checkValidity());
    if (toFocus.current) scrollIntoView(toFocus.current);
  };

  const handleFinishFailed = (errorFields: any[]) => {
    let errorIndex = 0;
    if (
      errorFields[0].name[0] !== 'brand' &&
      errorFields[0].name[0] !== 'productBrand'
    ) {
      if (errorFields[errorFields.length - 1].name[0] === 'categories')
        errorIndex = errorFields.length - 1;

      if (errorFields[errorFields.length - 2]?.name[0] === 'categories')
        errorIndex = errorFields.length - 2;
    }

    message.error('Error: ' + errorFields[errorIndex].errors[0]);

    if (!toFocus.current) {
      const id = errorFields[errorIndex].name[0];
      const element = document.getElementById(id);
      scrollIntoView(element);
    }
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const productForm = form.getFieldsValue(true);
      if (productForm.description)
        productForm.description = DOMPurify.sanitize(productForm.description);
      else
        productForm.brand = brands?.find(
          brand => brand.id === productForm.brand?.id
        );

      categoriesFields.forEach((field, index) => {
        productForm.categories.forEach((productCategory: any) => {
          productCategory[field] = allCategories[
            categoriesKeys[index] as keyof AllCategories
          ].find(category => category.id === productCategory[field]?.id);
        });
      });

      const { result } = await doRequest(() => saveStagingProduct(productForm));

      setLoading(false);
      productForm.id
        ? onSave?.(productForm)
        : onSave?.({ ...productForm, id: result._id });
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

  const handleImageChange = (
    _: Image,
    sourceProp: string,
    removed?: boolean
  ) => {
    if (removed) {
      if (sourceProp !== 'image')
        form.setFieldsValue({ [sourceProp]: undefined });
      else
        form.setFieldsValue({
          image: form
            .getFieldValue([sourceProp])
            .filter((item: any) => item.status !== 'removed'),
        });
    }
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <div className="products-details">
      <PageHeader
        title={
          _product
            ? `${_product?.name ?? ''} Update`
            : template
            ? 'New Product Template'
            : 'New Product'
        }
      />
      <Form
        form={form}
        name="productForm"
        initialValues={{
          ..._product,
          goLiveDate: _product?.['goLiveDate']
            ? moment(_product?.['goLiveDate'])
            : undefined,
          validity: _product?.['validity']
            ? moment(_product?.['validity'])
            : undefined,
          currencyIsoCode: _product?.currencyIsoCode ?? 'EUR',
        }}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        layout="vertical"
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item
              name="brand"
              label="Client"
              rules={[
                {
                  required: true,
                  message: 'Client is required.',
                },
              ]}
            >
              <SimpleSelect
                showSearch
                id="brand"
                data={brands}
                onChange={(value, brand) => updateForm(value, brand, 'brand')}
                style={{ width: '100%' }}
                selectedOption={brand}
                optionMapping={optionMapping}
                placeholder="Select a Client"
                disabled={loadingResources || isLive}
                allowClear
              ></SimpleSelect>
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              name="productBrand"
              label="Product Brand"
              rules={[
                {
                  required: true,
                  message: 'Product Brand is required.',
                },
              ]}
            >
              <SimpleSelect
                showSearch
                id="productBrand"
                data={productBrands}
                onChange={(value, productBrand) =>
                  updateForm(value, productBrand, 'productBrand')
                }
                style={{ width: '100%' }}
                selectedOption={productBrand}
                optionMapping={optionMapping}
                placeholder="Select a Product Brand"
                disabled={loadingResources || isLive}
                allowClear
              ></SimpleSelect>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item name="currencyIsoCode" label="Default Currency">
                  <Select
                    placeholder="Please select a currency"
                    disabled={loadingResources || isLive}
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    {currency.map((curr: any) => (
                      <Select.Option
                        key={curr.value}
                        value={curr.value}
                        label={curr.name}
                      >
                        {curr.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="urlKey" label="URL Key">
                  <Input
                    allowClear
                    placeholder="Product Key"
                    disabled={loadingResources || isLive}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col lg={12} xs={24}>
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item
                  name="originalPrice"
                  label="Default Price"
                  rules={[
                    {
                      required: true,
                      message: 'Default Price is required.',
                    },
                  ]}
                >
                  <InputNumber
                    id="originalPrice"
                    disabled={loadingResources || isLive}
                    placeholder="Original Price"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="name" label="Short description">
                  <Input
                    allowClear
                    disabled={loadingResources || isLive}
                    placeholder="Short Description"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Row gutter={8} align="bottom">
              <Col lg={12} xs={12}>
                <Form.Item name="status" label="Status">
                  <Radio.Group
                    disabled={loadingResources || isLive}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="live">Live</Radio.Button>
                    <Radio.Button value="paused">Paused</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col lg={12} xs={12}>
                <Form.Item
                  name="outOfStock"
                  label="Out of stock"
                  valuePropName="checked"
                >
                  <Switch disabled={loadingResources || isLive} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item label="Tag Image">
              <Upload.ImageUpload
                type="tag"
                fileList={_product?.tagImage}
                formProp="tagImage"
                form={form}
                onFitTo={isLive ? undefined : onFitTo}
                onRollback={isLive ? undefined : onRollback}
                disabled={loadingResources || isLive}
                onImageChange={(image: Image, _: string, removed?: boolean) =>
                  handleImageChange(image, 'tagImage', removed)
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
          <Col>
            <Button
              type="default"
              onClick={() => onCancel?.()}
              className="mb-1"
            >
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              className="mb-1"
              disabled={loadingResources || isLive}
              type="primary"
              htmlType="submit"
              loading={loading}
              onClick={checkConstraintValidity}
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ShortProductDetail;
