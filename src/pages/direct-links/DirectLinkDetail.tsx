/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Select,
} from 'antd';
import { RichTextEditor } from 'components/RichTextEditor';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Creator } from 'interfaces/Creator';
import React, { useEffect, useState } from 'react';
import { fetchProducts, saveDirectLink } from 'services/DiscoClubService';
import '@pathofdev/react-tag-input/build/index.css';
import { ProductBrand } from 'interfaces/ProductBrand';
import DOMPurify from 'isomorphic-dompurify';
import { Product } from 'interfaces/Product';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { SelectOption } from 'interfaces/SelectOption';

interface DirectLinkDetailProps {
  onSave?: (record: any, newItem?: boolean, cloning?: boolean) => void;
  onCancel?: () => void;
  directLink?: any;
  brands: Brand[];
  creators: Creator[];
  productBrands: ProductBrand[];
  setDetails?: (boolean) => void;
}

const DirectLinkDetail: React.FC<DirectLinkDetailProps> = ({
  onSave,
  onCancel,
  directLink,
  brands,
  creators,
  productBrands,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [userInput, setUserInput] = useState<string | undefined>(
    directLink?.product?.name
  );
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [disableProducts, setDisableProducts] = useState<boolean>(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator>();
  const [selectedMasterBrand, setSelectedMasterBrand] = useState<Brand>();
  const [selectedProductBrand, setSelectedProductBrand] =
    useState<ProductBrand>();
  const [selectedProduct, setSelectedProduct] = useState<Product>();

  const optionMapping: SelectOption = {
    label: 'name',
    value: 'id',
    key: 'id',
  };

  useEffect(() => {
    if (brands.length && creators.length && productBrands.length)
      setLoaded(true);
  }, [brands, creators, productBrands]);

  const onFinish = async () => {
    try {
      const item = form.getFieldsValue(true);

      if (item.description)
        item.description = DOMPurify.sanitize(item.description);

      if (item.creator)
        item.creator = {
          id: selectedCreator!.id,
          userName: selectedCreator!.userName,
          firstName: selectedCreator!.firstName,
        };

      if (item.masterBrand)
        item.masterBrand = {
          id: selectedMasterBrand!.id,
          brandName: selectedMasterBrand!.brandName,
        };

      if (item.productBrand)
        item.productBrand = {
          id: selectedProductBrand!.id,
          brandName: selectedProductBrand!.brandName,
        };

      if (item.product)
        item.product = { id: selectedProduct!.id, name: selectedProduct!.name };

      // adding record
      if (!directLink?.id) {
        const response = await doRequest(() => saveDirectLink(item, true));
        onSave?.({ ...item, id: response.result }, true, false);
      }

      // updating record
      if (directLink?.id) {
        await doRequest(() => saveDirectLink(item));
        onSave?.(item);
        return;
      }
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const getProducts = async (input?: string, loadNextPage?: boolean) => {
    setUserInput(input);
    const pageToUse = !!!loadNextPage ? 0 : optionsPage;
    const response = await doFetch(() =>
      fetchProducts({
        limit: 30,
        page: pageToUse,
        query: input,
        unclassified: false,
        productBrandId: selectedProductBrand?.id,
      })
    );
    setOptionsPage(pageToUse + 1);

    if (pageToUse === 0) setProducts(response.results);
    else setProducts(prev => [...prev.concat(response.results)]);
    setDisableProducts(false);

    return response.results;
  };

  const handleCreatorChange = (value?: string) => {
    const entity = creators.find(item => item.id === value);
    setSelectedCreator(entity);
  };

  const handleMasterBrandChange = (value?: string) => {
    const entity = brands.find(item => item.id === value);
    setSelectedMasterBrand(entity);
  };

  const handleProductBrandChange = (value?: string) => {
    const entity = productBrands.find(item => item.id === value);
    setSelectedProductBrand(entity);
    getProducts();
  };

  const handleProductChange = (value?: string) => {
    const entity = products.find(item => item.id === value);
    setSelectedProduct(entity);
    setUserInput(value);
  };

  return (
    <div>
      <PageHeader
        title={directLink ? 'Direct Link Update' : 'New Direct Link'}
      />
      <Form
        form={form}
        onFinish={onFinish}
        name="form"
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        layout="vertical"
        initialValues={directLink}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col span={24}>
              <Form.Item label="Link" name="link">
                <Input allowClear placeholder="Link" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <RichTextEditor formField="description" form={form} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Creator" name={['creator', 'id']}>
                <Select
                  disabled={!loaded}
                  placeholder="Select a Creator"
                  allowClear
                  showSearch
                  style={{ width: '100%' }}
                  filterOption={filterOption}
                  onChange={(value: any) => handleCreatorChange(value)}
                >
                  {creators.map(creator => (
                    <Select.Option
                      key={creator.id}
                      value={creator.id}
                      label={creator.firstName}
                    >
                      {creator.firstName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Master Brand" name={['masterBrand', 'id']}>
                <Select
                  placeholder="Select a Master Brand"
                  disabled={!loaded}
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  onChange={(value: any) => handleMasterBrandChange(value)}
                >
                  {brands.map((brand: Brand) => (
                    <Select.Option
                      key={brand.id}
                      value={brand.id}
                      label={brand.brandName}
                    >
                      {brand.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Product Brand" name={['productBrand', 'id']}>
                <Select
                  placeholder="Select a Product Brand"
                  disabled={!loaded}
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  onChange={(value: string) => handleProductBrandChange(value)}
                >
                  {productBrands.map((productBrand: ProductBrand) => (
                    <Select.Option
                      key={productBrand.id}
                      value={productBrand.id}
                      label={productBrand.brandName}
                    >
                      {productBrand.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Product" name={['product', 'id']}>
                <MultipleFetchDebounceSelect
                  style={{ width: '100%' }}
                  onInput={getProducts}
                  onChange={(value: any) => handleProductChange(value)}
                  onClear={setUserInput}
                  optionMapping={optionMapping}
                  placeholder="Type to search a Product"
                  disabled={!loaded || disableProducts}
                  input={userInput}
                  options={products}
                ></MultipleFetchDebounceSelect>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="URL" name="url">
                <Input allowClear placeholder="URL" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Link Type" name="linkType">
                <Select
                  placeholder="Select a Link Type"
                  disabled={!loaded}
                  allowClear
                  showSearch
                  filterOption={filterOption}
                >
                  <Select.Option key="Product" value="Product" label="Product">
                    Product
                  </Select.Option>
                  <Select.Option key="Other" value="Other" label="Other">
                    Other
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8} justify="end" className="my-1">
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
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
    </div>
  );
};

export default DirectLinkDetail;
