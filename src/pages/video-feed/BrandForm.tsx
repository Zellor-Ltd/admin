import { Button, Col, Form, InputNumber, Row, Select } from 'antd';
import { Brand } from 'interfaces/Brand';
import { ProductBrand } from 'interfaces/ProductBrand';
import { useState, useEffect } from 'react';
import { fetchProductBrands } from 'services/DiscoClubService';

interface FormProps {
  brands: Brand[];
  brand: Brand | undefined;
  setShowBrandForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const BrandForm: React.FC<FormProps> = ({
  brand,
  setShowBrandForm,
  brands,
}) => {
  const [form] = Form.useForm();
  const [selectedProductBrand, setSelectedProductBrand] =
    useState<ProductBrand>();
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

  const onChangeBrand = (key: string) => {
    const currentValues = form.getFieldsValue(true);
    const selectedBrand: any = brands.find((brand: Brand) => brand.id === key);

    const changedBrand = { ...selectedBrand };

    form.setFieldsValue({ ...changedBrand, position: currentValues.position });
  };

  useEffect(() => {
    getProductBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProductBrands = async () => {
    try {
      const { results }: any = await fetchProductBrands();
      if (brand?.productBrand) {
        setSelectedProductBrand(
          results.find(prodBrand => prodBrand.brandName === brand.productBrand)
        );
      }
      setProductBrands(results);
    } catch (e) {}
  };

  const onChangeLogo = (input: string) => {
    const currentValues = form.getFieldsValue(true);

    currentValues.selectedLogo = input;
    form.setFieldsValue({ ...currentValues });
  };

  return (
    <Form name="brandForm" form={form} initialValues={brand} layout="vertical">
      <Row gutter={8}>
        <Col lg={24} xs={24}>
          <Form.Item name="id" label="Store" rules={[{ required: true }]}>
            <Select
              showSearch
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(key: string) => onChangeBrand(key)}
            >
              {brands.map(brand => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={24} xs={24}>
          <Form.Item
            name="productBrand"
            label="Product Brand"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(key: string) => onChangeBrand(key)}
            >
              {productBrands.map(productBrand => (
                <Select.Option
                  key={productBrand.id}
                  value={productBrand.brandName}
                >
                  {productBrand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item name="selectedLogo" label="Product Brand logo">
            <Select placeholder="Please select a logo" onChange={onChangeLogo}>
              {selectedProductBrand?.brandLogo?.url && (
                <Select.Option value="brandLogo">Brand</Select.Option>
              )}

              {selectedProductBrand?.colourLogo?.url && (
                <Select.Option value={selectedProductBrand?.colourLogo?.url}>
                  Colour
                </Select.Option>
              )}
              {selectedProductBrand?.blackLogo?.url && (
                <Select.Option value={selectedProductBrand?.blackLogo?.url}>
                  Black
                </Select.Option>
              )}
              {selectedProductBrand?.brandName && (
                <Select.Option value={selectedProductBrand?.brandName}>
                  Text
                </Select.Option>
              )}
              <Select.Option value="">None</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'startTime']}
            label="Start Time"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'opacity']}
            label="Opacity"
            rules={[{ required: true }]}
          >
            <InputNumber defaultValue={1} />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'duration']}
            label="duration"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'x']}
            label="Position X"
            rules={[{ required: true }]}
          >
            <InputNumber defaultValue={0} />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'y']}
            label="position Y"
            rules={[{ required: true }]}
          >
            <InputNumber defaultValue={0} />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'z']}
            label="Z Index"
            rules={[{ required: true }]}
          >
            <InputNumber defaultValue={1} />
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
