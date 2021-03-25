import { RouteComponentProps } from "react-router";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { saveTag, fetchProducts, fetchBrands } from "services/DiscoClubService";
import { Product } from "interfaces/Product";
import { Brand } from "interfaces/Brand";
import { useSelector } from "react-redux";

const TagDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    initial?.brand?.id
  );
  const [form] = Form.useForm();

  const {
    settings: { template = [], clickSound = [] },
  } = useSelector((state: any) => state.settings);

  useEffect(() => {
    let mounted = true;
    async function getProducts() {
      const response: any = await fetchProducts();
      if (mounted) {
        setProducts(response.results);
        setLoading(false);
      }
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      if (mounted) {
        setBrands(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getProducts();
    getBrands();
    return () => {
      mounted = false;
    };
  }, []);

  const onFinish = () => {
    form.validateFields().then(async () => {
      setLoading(true);
      try {
        const tag = form.getFieldsValue(true);
        tag.product = products.find((product) => product.id === tag.product.id);
        tag.brand = brands.find((brand) => brand.id === tag.brand.id);
        await saveTag(tag);
        setLoading(false);
        message.success("Register updated with success.");
        history.push("/tags");
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    });
  };

  const productsBySelectedBrand = () => {
    return products.filter((product) => product.brand.id === selectedBrand);
  };

  const onChangeBrand = (brandKey: string) => {
    setSelectedBrand(brandKey);
    form.setFieldsValue({ product: {} });
  };

  const onChangeTemplate = () => {
    form.setFieldsValue({ product: {} });
  };

  return (
    <>
      <PageHeader title="Tag Update" subTitle="Tag" />
      <Form
        name="tagForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}>
        <Input.Group>
          <Row gutter={8}>
            <Col lg={6} xs={24}>
              <Form.Item
                name="tagName"
                label="Tag Name"
                rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col lg={6} xs={0}>
              <Form.Item name={["brand", "id"]} label="Brand">
                <Select onChange={onChangeBrand}>
                  {brands.map((brand) => (
                    <Select.Option key={brand.id} value={brand.id}>
                      {brand.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xxl={6} md={12} xs={24}>
              <Form.Item
                name="template"
                label="Template"
                rules={[{ required: true }]}>
                <Select
                  placeholder="Please select a template"
                  onChange={onChangeTemplate}>
                  {template.map((temp: any) => (
                    <Select.Option key={temp.value} value={temp.value}>
                      {temp.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={6} xs={0}>
              <Form.Item shouldUpdate>
                {() => (
                  <Form.Item name={["product", "id"]} label="Product">
                    <Select
                      disabled={form.getFieldValue("template") === "dollar"}>
                      {productsBySelectedBrand().map((product) => (
                        <Select.Option key={product.id} value={product.id}>
                          {product.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col xxl={4} md={12} xs={24}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={4} md={12} xs={24}>
              <Form.Item
                name="duration"
                label="Duration"
                rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xxl={5} md={12} xs={24}>
              <Form.Item name="discoGold" label="Disco Gold">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={5} md={12} xs={24}>
              <Form.Item name="discoDollars" label="Disco Dollar">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xxl={6} md={12} xs={24}>
              <Form.Item
                name="clickSound"
                label="Click Sound"
                rules={[{ required: true }]}>
                <Select placeholder="Please select a click sound">
                  {clickSound.map((click: any) => (
                    <Select.Option key={click.value} value={click.value}>
                      {click.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>
        <Input.Group>
          <Row gutter={8}></Row>
        </Input.Group>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/tags")}>
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
    </>
  );
};

export default TagDetail;
