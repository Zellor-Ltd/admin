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
import ProductCategoriesTrees from 'pages/products/ProductCategoriesTrees';
import 'pages/products/Products.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import { productUtils } from 'helpers/product-utils';
import { Image } from '../../interfaces/Image';
import { useRequest } from 'hooks/useRequest';
import update from 'immutability-helper';
import { SketchPicker } from 'react-color';
import { AppContext } from 'contexts/AppContext';
import { ColumnsType } from 'antd/lib/table';
//import { currencyRender } from 'helpers/currencyRender';
import scrollIntoView from 'scroll-into-view';

const { categoriesKeys, categoriesFields } = categoriesSettings;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  productUtils;

interface ProductTemplateProps {
  brands: Brand[];
  productBrands: ProductBrand[];
  allCategories: any;
  onSave?: (record: Product) => void;
  onCancel?: () => void;
  template?: Product;
  brand?: string;
  productBrand?: string;
  isFetchingBrands: boolean;
  isFetchingProductBrand: boolean;
}

const ProductTemplateDetail: React.FC<ProductTemplateProps> = ({
  brands,
  productBrands,
  allCategories,
  template,
  productBrand,
  brand,
  onSave,
  onCancel,
  isFetchingBrands,
  isFetchingProductBrand,
}) => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });
  const [_template, _setTemplate] = useState(template);
  const [color, setColor] = useState<string | undefined>(template?.colour);
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
    if (template) {
      _setTemplate(template);
    }
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
  }, [template]);

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
    [brands, form, template]
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
        template &&
        template?.categories
      ) {
        previousTags = getSearchTags(
          template.categories[productCategoryIndex],
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
      if (useInitialValue && template) {
        searchTags = template.searchTags || finalValue;
      } else {
        searchTags = finalValue;
      }

      if (
        !!selectedCategories &&
        !!template &&
        !!template.categories &&
        productCategoryIndex !== undefined
      ) {
        template.categories[productCategoryIndex] = currentCategories;
      }

      form.setFieldsValue({
        searchTags,
      });
    },
    [form, template]
  );

  const handleCategoryDelete = (productCategoryIndex: number) => {
    removeSearchTagsByCategory(productCategoryIndex, template, form);
  };

  const handleCategoryChange = (
    selectedCategories: any,
    _templateCategoryIndex: number,
    filterCategory: Function,
    categoryKey: string
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(
      false,
      selectedCategories,
      categoryKey,
      _templateCategoryIndex
    );
  };

  useEffect(() => {
    if (template?.ageMin && template?.ageMax)
      setAgeRange([template?.ageMin, template?.ageMax]);
  }, [template]);

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
    if (_template) {
      form.setFieldsValue({ thumbnailUrl: file });
      _template.thumbnailUrl = file;
      _setTemplate({ ..._template });
    }
  };

  const onAssignToTag = (file: Image) => {
    if (_template) {
      form.setFieldsValue({ tagImage: file });
      _template.tagImage = file;
      _setTemplate({ ..._template });
    }
  };

  const onOrder = (dragIndex: number, hoverIndex: number) => {
    if (_template) {
      const dragImage = _template?.image[dragIndex];
      _template.image = update(_template.image as any, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragImage],
        ],
      });

      form.setFieldsValue({ image: _template.image });
      _setTemplate({ ..._template });
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
    if (_template) {
      switch (sourceProp) {
        case 'image':
          if (_template[sourceProp][imageIndex].fitTo === fitTo) {
            _template[sourceProp][imageIndex].fitTo = undefined;
          } else {
            _template[sourceProp][imageIndex].fitTo = fitTo;
          }
          break;
        default:
          if (_template[sourceProp].fitTo === fitTo) {
            _template[sourceProp].fitTo = undefined;
          } else {
            _template[sourceProp].fitTo = fitTo;
          }
      }

      form.setFieldsValue({ ..._template });
      _setTemplate({ ..._template });
    }
  };

  const onRollback = (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number
  ) => {
    if (_template) {
      switch (sourceProp) {
        case 'image':
          _template[sourceProp][imageIndex].url = oldUrl;
          break;
        default:
          _template[sourceProp].url = oldUrl;
      }

      form.setFieldsValue({ ..._template });
      _setTemplate({ ..._template });
    }
  };

  const storeColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '25%',
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
      width: '20%',
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
      width: '15%',
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
      width: '15%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.price && b.price) return a.price - b.price;
        else if (a.price) return -1;
        else if (b.price) return 1;
        else return 0;
      },
      //render: (_: number, entity: any) => currencyRender(entity, 'price'),
    },
    {
      title: 'Link',
      dataIndex: 'link',
      width: '20%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.link && b.link) return a.link.localeCompare(b.link);
        else if (a.link) return -1;
        else if (b.link) return 1;
        else return 0;
      },
    },
  ];

  const rowSelection = {
    onChange: (_: any, selectedRow: any) => {
      setSelectedStore(selectedRow[0]);
    },
  };

  const handleSelectStore = async () => {
    form.setFieldsValue({ brand: selectedStore });
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="products-details">
      <PageHeader
        title={_template ? `${_template?.name} Update` : 'New Product Template'}
      />
      <Form
        form={form}
        name="productTemplateForm"
        initialValues={_template}
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
                      <Radio.Group buttonStyle="solid">
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
                        disabled={isFetchingBrands}
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
                        disabled={isFetchingProductBrand}
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
                    <Col lg={24} xs={24}>
                      <Form.Item name="variantId" label="Variant">
                        <Input
                          placeholder="Variant ID"
                          pattern="^.{8}-.{4}-.{4}-.{4}-.{12}_STR$"
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={24} xs={24}>
                      <Form.Item name="colourTitle" label="Colour">
                        <Input placeholder="Colour name" />
                      </Form.Item>
                    </Col>
                    <Col lg={24} xs={24}>
                      <Form.Item name="size" label="Size">
                        <Input placeholder="Size" />
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
            <ProductCategoriesTrees
              categories={_template?.categories}
              allCategories={allCategories}
              form={form}
              handleCategoryChange={handleCategoryChange}
              handleCategoryDelete={handleCategoryDelete}
            />
            <Col lg={24} xs={24}>
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
              <Col lg={24} xs={24}>
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
              <Col lg={24} xs={24}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Gender is required.' }]}
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
              <Col lg={12} xs={24}>
                <Row gutter={8}>
                  <Col span={24}>
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
                  <Col span={24}>
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
                  <Col span={24}>
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
                  <Col span={24}>
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
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col lg={12}>
                        <Form.Item
                          name="onSale"
                          label="On Sale"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col lg={12} xs={24}>
                    <Form.Item name="shopifyUniqueId" label="Shopify UID">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="magentoId" label="Magento Id">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="urlKey" label="URL Key">
                      <Input placeholder="Product Key" />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="weight" label="Weight">
                      <InputNumber placeholder="Weight in Kg" />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="barcode" label="Barcode">
                      <Input
                        id="barcode"
                        pattern="^[0-9]{13}$"
                        placeholder="Barcode number"
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
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceUS" label="Price US">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceGB" label="Price UK">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceIE" label="Price Europe">
                      <InputNumber />
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
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="discoPercentage"
                      label="Disco Percentage %"
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="sku" label="SKU">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="creatorPercentage" label="Creator %">
                      <InputNumber />
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
                  disabled={!selectedStore}
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
              rowKey="id"
              columns={storeColumns}
              //                dataSource={_template?.stores}
              rowSelection={{
                type: 'radio',
                ...rowSelection,
              }}
              pagination={false}
              className="mb-2"
            />
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Images" key="Images">
            <Row gutter={8}>
              <Col lg={24} xs={12}>
                <Form.Item label="Tag Image">
                  <Upload.ImageUpload
                    type="tag"
                    fileList={_template?.tagImage}
                    formProp="tagImage"
                    form={form}
                    onFitTo={onFitTo}
                    onRollback={onRollback}
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={12}>
                <Form.Item label="Thumbnail">
                  <Upload.ImageUpload
                    type="thumbnail"
                    fileList={_template?.thumbnailUrl}
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
                      _template ? (_template.image ? 'img-upload-div' : '') : ''
                    }
                  >
                    <Upload.ImageUpload
                      type="image"
                      maxCount={20}
                      fileList={_template?.image}
                      formProp="image"
                      form={form}
                      onAssignToTag={onAssignToTag}
                      onAssignToThumbnail={onAssignToThumbnail}
                      croppable
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

export default ProductTemplateDetail;
