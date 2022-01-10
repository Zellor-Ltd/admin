import { Button, Col, Form, InputNumber, Row, Select } from 'antd';
import { Brand } from 'interfaces/Brand';
import { ProductBrand } from 'interfaces/ProductBrand';
import { useEffect, useState } from 'react';
import { fetchProductBrands } from 'services/DiscoClubService';
import { useMount } from 'react-use';

interface FormProps {
  brands: Brand[];
  brand: Brand | undefined;
  setShowBrandForm: (value: boolean) => void;
}

const BrandForm: React.FC<FormProps> = ({
  brand,
  setShowBrandForm,
  brands,
}) => {
  const [form] = Form.useForm();
  const [selectedProductBrand, setSelectedProductBrand] =
    useState<ProductBrand>();
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(brand?.selectedLogo);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

  useEffect(() => {
    onChangeProductBrandLogo(form.getFieldValue('selectedLogo'));
  }, [selectedProductBrand]);

  const onChangeBrand = (brandId: string) => {
    const currentValues = form.getFieldsValue(true);
    const selectedBrand: any = brands.find(
      (brand: Brand) => brand.id === brandId
    );
    const changedBrand = { ...selectedBrand };

    form.setFieldsValue({ ...changedBrand, position: currentValues.position });
  };

  const onChangeProductBrand = (productBrandName: string) => {
    const selectedProductBrand: any = productBrands.find(
      productBrand => productBrand.brandName === productBrandName
    );

    setSelectedProductBrand(selectedProductBrand);
  };

  useMount(() => {
    getProductBrands().then();
  });

  const getProductBrands = async () => {
    try {
      setIsFetchingProductBrands(true);
      const { results }: any = await fetchProductBrands();
      if (brand?.productBrand) {
        setSelectedProductBrand(
          results.find(prodBrand => prodBrand.brandName === brand.productBrand)
        );
      }
      setProductBrands(results);
      setIsFetchingProductBrands(false);
    } catch (e) {}
  };

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
              onChange={(productBrandName: string) =>
                onChangeProductBrand(productBrandName)
              }
              loading={isFetchingProductBrands}
              disabled={isFetchingProductBrands}
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
            <Select
              value={selectedLogo}
              placeholder="Please select a logo"
              loading={isFetchingProductBrands}
              disabled={isFetchingProductBrands}
              onChange={onChangeProductBrandLogo}
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
            initialValue={1}
          >
            <InputNumber />
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
            initialValue={0}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'y']}
            label="position Y"
            rules={[{ required: true }]}
            initialValue={0}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={['position', 0, 'z']}
            label="Z Index"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber />
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
