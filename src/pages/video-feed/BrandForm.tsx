/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Form, InputNumber, Row, Select } from 'antd';
import { Brand } from 'interfaces/Brand';
import { ProductBrand } from 'interfaces/ProductBrand';
import { useEffect, useState } from 'react';
import { useMount } from 'react-use';
import { find } from 'lodash';

interface FormProps {
  brands: Brand[];
  productBrands: ProductBrand[];
  brand: Brand | undefined;
  setShowBrandForm: (value: boolean) => void;
}

const BrandForm: React.FC<FormProps> = ({
  brand,
  setShowBrandForm,
  brands,
  productBrands,
}) => {
  const [form] = Form.useForm();
  const [selectedProductBrand, setSelectedProductBrand] =
    useState<ProductBrand>();
  const [selectedLogo, setSelectedLogo] = useState(brand?.selectedLogo);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    onChangeProductBrandLogo(form.getFieldValue('selectedLogo'));
  }, [selectedProductBrand]);

  const onChangeBrand = (brandId: string) => {
    const currentValues = form.getFieldsValue(true);
    const selectedBrand: any = find(brands, { id: brandId });
    const changedBrand = { ...selectedBrand };

    form.setFieldsValue({ ...changedBrand, position: currentValues.position });
  };

  const onChangeProductBrand = (productBrandId: string) => {
    const selectedProductBrand: any = find(productBrands, {
      id: productBrandId,
    });

    setSelectedProductBrand(selectedProductBrand);
    form.setFieldsValue({
      productBrand: selectedProductBrand,
    });
  };

  useMount(() => {
    setLoaded(true);
    if (brand?.productBrand?.id) {
      setSelectedProductBrand(
        find(productBrands, { id: brand.productBrand?.id })
      );
    }
  });

  const onChangeProductBrandLogo = (
    productBrandKey: 'whiteLogo' | 'colourLogo' | 'blackLogo' | 'brandName' | ''
  ) => {
    const currentValues = form.getFieldsValue(true);

    if (selectedProductBrand) {
      if (selectedProductBrand[productBrandKey]) {
        switch (productBrandKey) {
          case 'whiteLogo':
          case 'colourLogo':
          case 'blackLogo':
            currentValues.selectedLogoUrl =
              selectedProductBrand[productBrandKey]?.url;
            break;
          case 'brandName':
            currentValues.selectedLogoUrl =
              selectedProductBrand[productBrandKey];
            break;
          case '':
          default:
            currentValues.selectedLogoUrl = undefined;
        }
      } else {
        currentValues.selectedLogoUrl = undefined;
        currentValues.selectedLogo = '';
        productBrandKey = '';
      }
    }

    form.setFieldsValue({ ...currentValues });
    setSelectedLogo(productBrandKey);
  };

  const filterOption = (input: string, option: any) => {
    return !!option?.children
      ?.toString()
      ?.toUpperCase()
      .includes(input?.toUpperCase());
  };

  return (
    <Form name="brandForm" form={form} initialValues={brand} layout="vertical">
      <Row gutter={8}>
        <Col span={24}>
          <Form.Item name="id" label="Store" rules={[{ required: true }]}>
            <Select
              showSearch
              allowClear
              placeholder="Please select a Store"
              disabled={!loaded}
              filterOption={filterOption}
              onChange={(brandId: string) => onChangeBrand(brandId)}
            >
              {brands.map(brand => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name={['productBrand', 'id']}
            label="Product Brand"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Please select a Product Brand"
              filterOption={filterOption}
              onChange={(productBrandName: string) =>
                onChangeProductBrand(productBrandName)
              }
              disabled={!loaded}
            >
              {productBrands.map(productBrand => (
                <Select.Option key={productBrand.id} value={productBrand.id}>
                  {productBrand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'startTime']}
            label="Start Time"
            rules={[{ required: true }]}
          >
            <InputNumber disabled={!loaded} placeholder="Start Time" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'opacity']}
            label="Opacity"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber disabled={!loaded} placeholder="Opacity" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'duration']}
            label="Duration"
            rules={[{ required: true }]}
          >
            <InputNumber disabled={!loaded} placeholder="Duration" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'x']}
            label="Position X"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber disabled={!loaded} placeholder="Position X" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'y']}
            label="Position Y"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber disabled={!loaded} placeholder="Position Y" />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'z']}
            label="Z Index"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber disabled={!loaded} placeholder="Z Index" />
          </Form.Item>
        </Col>
        <Col lg={12} xs={24}>
          <Form.Item name="selectedLogo" label="Product Brand logo">
            <Select
              allowClear
              showSearch
              value={selectedLogo}
              placeholder="Please select a logo"
              disabled={!loaded}
              onChange={onChangeProductBrandLogo}
              filterOption={filterOption}
            >
              {selectedProductBrand?.whiteLogo?.url && (
                <Select.Option value="whiteLogo">White</Select.Option>
              )}

              {selectedProductBrand?.colourLogo?.url && (
                <Select.Option value="colourLogo">Colour</Select.Option>
              )}
              {selectedProductBrand?.blackLogo?.url && (
                <Select.Option value="blackLogo">Black</Select.Option>
              )}
              {selectedProductBrand?.brandName && (
                <Select.Option value="brandName">Text</Select.Option>
              )}
              <Select.Option value="">None</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col>
          <Button onClick={() => setShowBrandForm(false)}>Cancel</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit">
            Save Store
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BrandForm;
