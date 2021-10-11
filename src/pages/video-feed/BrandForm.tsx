import { Button, Col, Form, InputNumber, Row, Select } from "antd";
import { Brand } from "interfaces/Brand";
import { useEffect, useState } from "react";
import { fetchBrands } from "services/DiscoClubService";

interface FormProps {
  brand: Brand | undefined;
  setShowBrandForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const BrandForm: React.FC<FormProps> = ({ brand, setShowBrandForm }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;
    async function getBrands() {
      const response: any = await fetchBrands();
      if (mounted) {
        setBrands(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getBrands();
    return () => {
      mounted = false;
    };
  }, []);

  const onChangeBrand = (key: string) => {
    const selectedBrand: any = brands.find((brand: Brand) => brand.id === key);

    const changedBrand = { ...selectedBrand };
    if (changedBrand.selectedLogo) {
      changedBrand.selectedLogoUrl =
        selectedBrand[changedBrand.selectedLogo].url;
    }

    form.setFieldsValue({ brands: changedBrand });
    form.setFields([{ name: "brands", touched: true }]);
  };

  const onChangeLogo = (key: string, fieldName: number) => {
    const formBrands = form.getFieldValue("brands");
    const selectedBrand = formBrands[fieldName];

    formBrands[fieldName].selectedLogoUrl = selectedBrand[key].url;
    form.setFieldsValue({ brands: formBrands });
    form.setFields([{ name: "brands", touched: true }]);
  };

  return (
    <Form name="brandForm" form={form} initialValues={brand} layout="vertical">
      <Row gutter={8}>
        <Col lg={24} xs={24}>
          <Form.Item name="id" label="Brand" rules={[{ required: true }]}>
            <Select
              showSearch
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(key: string) => onChangeBrand(key)}
              loading={loading}
            >
              {brands.map((brand) => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.brand?.id !== curValues.brand?.id
            }
          >
            {({ getFieldValue }) => {
              const bra: any = brands.find(
                (brand: Brand) => brand.id === getFieldValue("id")
              );
              return (
                <Form.Item name="selectedLogo" label="Brand logo">
                  <Select placeholder="Please select a logo">
                    {bra?.brandLogo?.url && (
                      <Select.Option value="brandLogo">Brand</Select.Option>
                    )}

                    {bra?.colourLogo?.url && (
                      <Select.Option value="colourLogo">Colour</Select.Option>
                    )}
                    {bra?.blackLogo?.url && (
                      <Select.Option value="blackLogo">Black</Select.Option>
                    )}
                    {bra?.whiteLogo?.url && (
                      <Select.Option value="whiteLogo">White</Select.Option>
                    )}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={["position", 0, "startTime"]}
            label="Start Time"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={["position", 0, "opacity"]}
            label="Opacity"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={["position", 0, "duration"]}
            label="duration"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={["position", 0, "x"]}
            label="Position X"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={["position", 0, "y"]}
            label="position Y"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={4} xs={24}>
          <Form.Item
            name={["position", 0, "z"]}
            label="Z Index"
            rules={[{ required: true }]}
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Brand
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BrandForm;
