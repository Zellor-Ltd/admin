import { Button, Col, Form, InputNumber, Row, Select } from "antd";
import { Brand } from "interfaces/Brand";

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
  const onChangeBrand = (key: string) => {
    const currentValues = form.getFieldsValue(true);
    const selectedBrand: any = brands.find((brand: Brand) => brand.id === key);

    const changedBrand = { ...selectedBrand };
    if (changedBrand.selectedLogo) {
      changedBrand.selectedLogoUrl =
        selectedBrand[changedBrand.selectedLogo].url;
    }

    form.setFieldsValue({ ...changedBrand, position: currentValues.position });
  };

  const onChangeLogo = (key: string) => {
    const currentValues = form.getFieldsValue(true);
    const selectedBrand: any = brands.find(
      (brand: Brand) => brand.id === currentValues.id
    );

    currentValues.selectedLogoUrl = selectedBrand[key].url;
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
              prevValues.id !== curValues.id
            }
          >
            {({ getFieldValue }) => {
              const bra: any = brands.find(
                (brand: Brand) => brand.id === getFieldValue("id")
              );
              return (
                <Form.Item name="selectedLogo" label="Store logo">
                  <Select
                    placeholder="Please select a logo"
                    onChange={onChangeLogo}
                  >
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
          <Button type="primary" htmlType="submit">
            Save Store
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BrandForm;
