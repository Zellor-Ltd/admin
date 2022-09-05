/* eslint-disable react-hooks/exhaustive-deps */
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
  Tooltip,
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
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { saveStagingProduct } from 'services/DiscoClubService';
import ProductCategoriesTrees from './ProductCategoriesTrees';
import './Products.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import { productUtils } from 'helpers/product-utils';
import { Image } from '../../interfaces/Image';
import { useRequest } from 'hooks/useRequest';
import update from 'immutability-helper';
import { SketchPicker } from 'react-color';
import { AppContext } from 'contexts/AppContext';
import { ColumnsType } from 'antd/lib/table';
import { currencyRender } from 'helpers/currencyRender';
import scrollIntoView from 'scroll-into-view';
import CopyValueToClipboard from 'components/CopyValueToClipboard';

const { categoriesKeys, categoriesFields } = categoriesSettings;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  productUtils;
interface ProductDetailProps {
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

const ProductDetail: React.FC<ProductDetailProps> = ({
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
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });
  const [_product, _setProduct] = useState(product);
  const [color, setColor] = useState<string | undefined>(product?.colour);
  const [selectedStore, setSelectedStore] = useState<Brand>();
  const [selectedTab, setSelectedTab] = useState<string>('Details');

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

  useEffect(() => {
    form.setFieldsValue({ colour: color });
  }, [color]);

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

  const checkConstraintValidity = () => {
    const barcodeInput = document.getElementById('barcode') as HTMLInputElement;
    if (!barcodeInput.checkValidity()) {
      setSelectedTab('Checkout');
      scrollIntoView(barcodeInput);
    }
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

      const { result } = await doRequest(() => saveStagingProduct(formProduct));

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

  const storeColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '18%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Country',
      dataIndex: 'country',
      width: '15%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.country && b.country) return a.country.localeCompare(b.country);
        else if (a.country) return -1;
        else if (b.country) return 1;
        else return 0;
      },
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.currency && b.currency)
          return a.currency.localeCompare(b.currency);
        else if (a.currency) return -1;
        else if (b.currency) return 1;
        else return 0;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.price && b.price) return a.price - b.price;
        else if (a.price) return -1;
        else if (b.price) return 1;
        else return 0;
      },
      render: (_: number, entity: any) =>
        entity.price ? currencyRender(entity, 'price') : '-',
    },
    {
      title: 'Link',
      dataIndex: 'link',
      width: '32%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.link && b.link) return a.link.localeCompare(b.link);
        else if (a.link) return -1;
        else if (b.link) return 1;
        else return 0;
      },
      render: (value: string) => {
        return (
          <div style={{ display: 'grid', placeItems: 'stretch' }}>
            <div
              style={{
                padding: '0.5rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <Tooltip title={value}>{value}</Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Copy URL',
      dataIndex: 'link',
      width: '10%',
      render: (_, record: any) => <CopyValueToClipboard value={record.link} />,
      align: 'center',
    },
  ];

  const rowSelection = {
    onChange: (_: any, selectedRow: any) => {
      setSelectedStore(selectedRow[0]);
    },
    getCheckboxProps: () => ({
      disabled: isLive,
    }),
  };

  const handleSelectStore = async () => {
    form.setFieldsValue({ brand: selectedStore });
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
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
            message.error('Error: ' + errorField.errors[0]);
          });
        }}
        layout="vertical"
      >
        <Tabs onChange={handleTabChange} activeKey={selectedTab}>
          <Tabs.TabPane forceRender tab="Details" key="Details">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Row gutter={8} align="bottom">
                  <Col lg={12} xs={12}>
                    <Form.Item name="status" label="Status">
                      <Radio.Group disabled={isLive} buttonStyle="solid">
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
                          message: 'Master Brand is required.',
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
                        optionMapping={optionMapping}
                        placeholder={'Select a brand'}
                        loading={isFetchingBrands}
                        disabled={isFetchingBrands || isLive}
                        allowClear
                      ></SimpleSelect>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={24} xs={24}>
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
                        data={productBrands}
                        onChange={(value, productBrand) =>
                          updateForm(value, productBrand, 'productBrand')
                        }
                        style={{ width: '100%' }}
                        selectedOption={productBrand}
                        optionMapping={optionMapping}
                        placeholder={'Select a brand'}
                        loading={isFetchingProductBrand}
                        disabled={isFetchingProductBrand || isLive}
                        allowClear
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
                  <Col lg={12} xs={24}>
                    <Form.Item name="quantity" label="Quantity">
                      <InputNumber
                        placeholder="Quantity"
                        pattern="^\d*%"
                        title="Non-negative integers only."
                        disabled={isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}></Col>
                  <Col lg={12} xs={24}>
                    <Col lg={24} xs={24}>
                      <Form.Item name="variantId" label="Variant">
                        <Input
                          placeholder="Variant ID"
                          disabled={isLive}
                          pattern="^.{8}-.{4}-.{4}-.{4}-.{12}_STR$"
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={24} xs={24}>
                      <Form.Item name="colourTitle" label="Colour">
                        <Input placeholder="Colour name" disabled={isLive} />
                      </Form.Item>
                    </Col>
                    <Col lg={24} xs={24}>
                      <Form.Item name="size" label="Size">
                        <Input placeholder="Size" disabled={isLive} />
                      </Form.Item>
                    </Col>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Col lg={24} xs={24}>
                      <SketchPicker
                        color={color}
                        onChange={selectedColor => setColor(selectedColor.hex)}
                        presetColors={[
                          '#4a2f10',
                          '#704818',
                          '#9e6521',
                          '#C37D2A',
                          '#E5AC69',
                          '#F2C590',
                          '#FFD6A6',
                          '#FFF0CB',
                        ]}
                      />
                    </Col>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Categories" key="Categories">
            <Row>
              <Col span={24}>
                <Form.Item name="apiCategory" label="API Category">
                  <Input
                    style={isMobile ? { width: '100%' } : { width: '180px' }}
                    placeholder="API Category"
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
            <ProductCategoriesTrees
              categories={_product?.categories}
              allCategories={allCategories}
              form={form}
              handleCategoryChange={handleCategoryChange}
              handleCategoryDelete={handleCategoryDelete}
              disabled={isLive}
            />
            <Col lg={24} xs={24}>
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
              <Col lg={24} xs={24}>
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
              <Col lg={24} xs={24}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Gender is required.' }]}
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
              <Col lg={12} xs={24}>
                <Row gutter={8}>
                  <Col span={24}>
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
                  <Col span={24}>
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
                  <Col span={24}>
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
                  <Col span={24}>
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

                  <Col span={24}>
                    <Row
                      gutter={8}
                      justify={isMobile ? 'space-between' : undefined}
                    >
                      <Col lg={12}>
                        <Form.Item
                          name="displayDiscountPage"
                          label="Allow Use of DD?"
                          valuePropName="checked"
                        >
                          <Switch disabled={isLive} />
                        </Form.Item>
                      </Col>
                      <Col lg={12}>
                        <Form.Item
                          name="onSale"
                          label="On Sale"
                          valuePropName="checked"
                        >
                          <Switch disabled={isLive} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col lg={12} xs={24}>
                    <Form.Item name="shopifyUniqueId" label="Shopify UID">
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="magentoId" label="Magento Id">
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="urlKey" label="URL Key">
                      <Input placeholder="Product Key" disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="weight" label="Weight">
                      <InputNumber
                        placeholder="Weight in Kg"
                        disabled={isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="barcode" label="Barcode">
                      <Input
                        id="barcode"
                        pattern="^[0-9]{13}$"
                        placeholder="Barcode number"
                        disabled={isLive}
                        title="Numbers only, 13 digits."
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
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceUS" label="Price US">
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceGB" label="Price UK">
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceIE" label="Price Europe">
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>

                  <Col lg={12} xs={24}>
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
                            if (
                              maxDiscount &&
                              maxDiscount > maxPossibleDiscount
                            ) {
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
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="discoPercentage"
                      label="Disco Percentage %"
                    >
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="sku" label="SKU">
                      <Input disabled={isLive} />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="creatorPercentage" label="Creator %">
                      <InputNumber disabled={isLive} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Stores" key="Stores">
            <Row justify="end">
              <Col>
                <Button
                  disabled={isLive || !selectedStore}
                  type="primary"
                  className="mb-1"
                  loading={loading}
                  onClick={handleSelectStore}
                >
                  Select Store
                </Button>
              </Col>
            </Row>
            <Table
              className="mb-1"
              rowKey="id"
              columns={storeColumns}
              dataSource={_product?.stores}
              rowSelection={{
                type: 'radio',
                ...rowSelection,
              }}
              pagination={false}
            />
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Images" key="Images">
            <Row gutter={8}>
              <Col lg={24} xs={12}>
                <Form.Item label="Tag Image">
                  <Upload.ImageUpload
                    type="tag"
                    fileList={_product?.tagImage}
                    formProp="tagImage"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                    disabled={isLive}
                    onImageChange={(
                      image: Image,
                      _: string,
                      removed?: boolean
                    ) => handleImageChange(image, 'tagImage', removed)}
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={12}>
                <Form.Item label="Thumbnail">
                  <Upload.ImageUpload
                    type="thumbnail"
                    fileList={_product?.thumbnailUrl}
                    formProp="thumbnailUrl"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                    disabled={isLive}
                    onImageChange={(
                      image: Image,
                      _: string,
                      removed?: boolean
                    ) => handleImageChange(image, 'thumbnailUrl', removed)}
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
                      type="image"
                      maxCount={20}
                      fileList={_product?.image}
                      formProp="image"
                      form={form}
                      onAssignToTag={onAssignToTag}
                      onAssignToThumbnail={onAssignToThumbnail}
                      croppable
                      classNames="big-image-height scroll-x"
                      onOrder={onOrder}
                      onFitTo={onFitTo}
                      onRollback={onRollback}
                      disabled={isLive}
                      onImageChange={(
                        image: Image,
                        _: string,
                        removed?: boolean
                      ) => handleImageChange(image, 'image', removed)}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>

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
              disabled={isLive}
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

export default ProductDetail;
