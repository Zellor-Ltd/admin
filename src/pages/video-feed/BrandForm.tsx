import { Button, Col, Form, InputNumber, Row, Select } from "antd";
import { Brand } from "interfaces/Brand";
import { Segment } from "interfaces/Segment";
import { useEffect, useState } from "react";
import { fetchBrands } from "services/DiscoClubService";

interface FormProps {
  segment: Segment | undefined;
  form: any;
  onCancel: () => void;
}

const BrandForm: React.FC<FormProps> = ({ segment, onCancel, form }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <>
      <Row gutter={8}>
        <Col lg={24} xs={24}>
          <Form.Item
            name={["brand", "id"]}
            label="Brand"
            rules={[{ required: true }]}
          >
            <Select>
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
              const bra = getFieldValue("brand");
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
          <Button onClick={onCancel}>Cancel</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Segment
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default BrandForm;
