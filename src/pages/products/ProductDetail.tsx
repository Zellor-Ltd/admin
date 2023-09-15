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
import { categoryMapper } from 'helpers/categoryMapper';
import { categoryUtils } from 'helpers/categoryUtils';
import { Brand } from 'interfaces/Brand';
import { ProductBrand } from '../../interfaces/ProductBrand';
import { AllCategories } from 'interfaces/Category';
import { Product } from 'interfaces/Product';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { saveStagingProduct } from 'services/DiscoClubService';
import ProductCategoriesTrees from './ProductCategoriesTrees';
import './Products.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import { Image } from '../../interfaces/Image';
import { useRequest } from 'hooks/useRequest';
import update from 'immutability-helper';
import { SketchPicker } from 'react-color';
import { AppContext } from 'contexts/AppContext';
import { ColumnsType } from 'antd/lib/table';
import { currencyRender } from 'helpers/currencyRender';
import scrollIntoView from 'scroll-into-view';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import moment from 'moment';
import DOMPurify from 'isomorphic-dompurify';

const { categoriesKeys, categoriesFields } = categoryMapper;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  categoryUtils;
interface ProductDetailProps {
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

const ProductDetail: React.FC<ProductDetailProps> = ({
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
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
  const { doRequest } = useRequest({ setLoading });
  const [_product, _setProduct] = useState(product);
  const [color, setColor] = useState<string | undefined>(product?.colour);
  const [selectedStore, setSelectedStore] = useState<Brand>();
  const [activeTabKey, setActiveTabKey] = useState<string>('Details');
  const toFocus = useRef<any>();

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'name',
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
    const quantity = document.getElementById('quantity') as HTMLInputElement;
    const barcode = document.getElementById('barcode') as HTMLInputElement;
    const variantId = document.getElementById('variantId') as HTMLInputElement;
    const elements = [barcode, variantId, quantity];
    toFocus.current = elements.find(item => !item?.checkValidity());
    if (toFocus.current) {
      if (toFocus.current === barcode) setActiveTabKey('Checkout');
      else if (toFocus.current === variantId || quantity)
        setActiveTabKey('Details');
      scrollIntoView(toFocus.current);
    }
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

      switch (id) {
        case 'brand':
        case 'productBrand':
          setActiveTabKey('Details');
          break;
        case 'categories':
        case 'gender':
          setActiveTabKey('Categories');
          break;
        case 'originalPrice':
        case 'maxDiscoDollars':
          setActiveTabKey('Checkout');
          break;
        default:
          console.log('Something went wrong.');
      }
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Country">Country</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Currency">Currency</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Price">Price</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Copy URL">Copy URL</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'link',
      width: '10%',
      render: (_, record: any) => (
        <CopyValueToClipboard tooltipText="Copy URL" value={record.link} />
      ),
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
    setActiveTabKey(value);
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
        <Tabs onChange={handleTabChange} activeKey={activeTabKey}>
          <Tabs.TabPane forceRender tab="Details" key="Details">
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
                  <Col span={24}>
                    <Form.Item name="name" label="Short description">
                      <Input
                        allowClear
                        disabled={loadingResources || isLive}
                        placeholder="Short Description"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Long description">
                      <RichTextEditor
                        formField="description"
                        form={form}
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
                        onChange={(value, brand) =>
                          updateForm(value, brand, 'brand')
                        }
                        style={{ width: '100%' }}
                        selectedOption={brand}
                        optionMapping={optionMapping}
                        placeholder="Select a Client"
                        disabled={loadingResources || isLive}
                        allowClear
                      ></SimpleSelect>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col span={24}>
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
                    <Form.Item
                      name="goLiveDate"
                      label="Go Live Date"
                      getValueProps={formatMoment}
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        disabled={loadingResources || isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="validity"
                      label="Expiration Date"
                      getValueProps={formatMoment}
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        disabled={loadingResources || isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="quantity" label="Quantity">
                      <InputNumber
                        id="quantity"
                        placeholder="Quantity"
                        pattern="^\d*$"
                        title="Non-negative integers only."
                        disabled={loadingResources || isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}></Col>
                  <Col lg={12} xs={24}>
                    <Col span={24}>
                      <Form.Item name="variantId" label="Variant">
                        <Input
                          allowClear
                          id="variantId"
                          placeholder="Variant ID"
                          disabled={loadingResources || isLive}
                          pattern="^.{8}-.{4}-.{4}-.{4}-.{12}_STR$"
                          title="Format must be XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX_STR."
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="colourTitle" label="Colour">
                        <Input
                          allowClear
                          placeholder="Colour name"
                          disabled={loadingResources || isLive}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="size" label="Size">
                        <Input
                          allowClear
                          placeholder="Size"
                          disabled={loadingResources || isLive}
                        />
                      </Form.Item>
                    </Col>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Col span={24}>
                      <SketchPicker
                        className="product-sketch-picker"
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
                  <Tooltip title={_product?.apiCategory}>
                    <Input.TextArea
                      rows={2}
                      placeholder="No API Category"
                      disabled
                    />
                  </Tooltip>
                </Form.Item>
              </Col>
            </Row>
            <ProductCategoriesTrees
              id="categories"
              required
              categories={_product?.categories}
              allCategories={allCategories}
              form={form}
              handleCategoryChange={handleCategoryChange}
              handleCategoryDelete={handleCategoryDelete}
              disabled={loadingResources || isLive}
            />
            <Col span={24}>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.category !== curValues.category
                }
              >
                {({ getFieldValue }) => (
                  <Form.Item name="searchTags" label="Search Tags">
                    <Select
                      mode="tags"
                      className="product-search-tags"
                      disabled={loadingResources || isLive}
                      allowClear
                      showSearch
                      filterOption={filterOption}
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
              <Col span={24}>
                <Typography.Title level={4}>Target</Typography.Title>
              </Col>
              <Col span={24}>
                <Form.Item label="Age Range">
                  <Slider
                    range
                    marks={{ 12: '12', 100: '100' }}
                    min={12}
                    max={100}
                    value={ageRange}
                    onChange={onChangeAge}
                    disabled={loadingResources || isLive}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={24}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Gender is required.' }]}
                >
                  <Select
                    mode="multiple"
                    disabled={loadingResources || isLive}
                    id="gender"
                    placeholder="Gender"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
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
                    <Form.Item name="currencyIsoCodeUS" label="Currency US">
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
                    <Form.Item name="currencyIsoCodeGB" label="Currency UK">
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
                    <Form.Item name="currencyIsoCodeIE" label="Currency Europe">
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
                          <Switch disabled={loadingResources || isLive} />
                        </Form.Item>
                      </Col>
                      <Col lg={12}>
                        <Form.Item
                          name="onSale"
                          label="On Sale"
                          valuePropName="checked"
                        >
                          <Switch disabled={loadingResources || isLive} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col lg={12} xs={24}>
                    <Form.Item name="shopifyUniqueId" label="Shopify UID">
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Shopify UID"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="magentoId" label="Magento ID">
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Magento ID"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="urlKey" label="URL Key">
                      <Input
                        allowClear
                        placeholder="Product Key"
                        disabled={loadingResources || isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="weight" label="Weight">
                      <InputNumber
                        placeholder="Weight in Kg"
                        disabled={loadingResources || isLive}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="barcode" label="Barcode">
                      <Input
                        allowClear
                        id="barcode"
                        pattern="^[0-9]{13}$"
                        placeholder="Barcode number"
                        disabled={loadingResources || isLive}
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
                      <InputNumber
                        id="originalPrice"
                        disabled={loadingResources || isLive}
                        placeholder="Original Price"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceUS" label="Price US">
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Price US"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceGB" label="Price UK">
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Price UK"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="originalPriceIE" label="Price Europe">
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Price Europe"
                      />
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
                        id="maxDiscoDollars"
                        parser={value => (value || '').replace(/-/g, '')}
                        precision={0}
                        disabled={loadingResources || isLive}
                        placeholder="Max Discount in DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="discoPercentage"
                      label="Disco Percentage %"
                    >
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Disco %"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="sku" label="SKU">
                      <Input
                        allowClear
                        disabled={loadingResources || isLive}
                        placeholder="SKU"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="creatorPercentage" label="Creator %">
                      <InputNumber
                        disabled={loadingResources || isLive}
                        placeholder="Creator %"
                      />
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
                  disabled={loadingResources || isLive || !selectedStore}
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
                    onFitTo={isLive ? undefined : onFitTo}
                    onRollback={isLive ? undefined : onRollback}
                    disabled={loadingResources || isLive}
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
                    onFitTo={isLive ? undefined : onFitTo}
                    onRollback={isLive ? undefined : onRollback}
                    disabled={loadingResources || isLive}
                    onImageChange={(
                      image: Image,
                      _: string,
                      removed?: boolean
                    ) => handleImageChange(image, 'thumbnailUrl', removed)}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Image" required>
                  <div
                    className={
                      _product ? (_product.image ? 'img-upload-div' : '') : ''
                    }
                  >
                    <Upload.ImageUpload
                      type="image"
                      maxCount={isLive ? _product?.image?.length : 20}
                      fileList={_product?.image}
                      formProp="image"
                      form={form}
                      onAssignToTag={isLive ? undefined : onAssignToTag}
                      onAssignToThumbnail={
                        isLive ? undefined : onAssignToThumbnail
                      }
                      croppable={!isLive}
                      classNames="big-image-height scroll-x"
                      onOrder={isLive ? undefined : onOrder}
                      onFitTo={isLive ? undefined : onFitTo}
                      onRollback={isLive ? undefined : onRollback}
                      disabled={loadingResources || isLive}
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

export default ProductDetail;
