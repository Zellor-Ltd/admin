import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  PageHeader,
  Row,
  Select,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { Brand } from "interfaces/Brand";
import { Video } from "interfaces/Video";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { fetchBrands, saveProduct } from "services/DiscoClubService";
import moment from "moment";

const videoColumns: ColumnsType<Video> = [
  {
    title: "ID",
    dataIndex: "videoFeedId",
    width: "100%",
    align: "center",
  },
];

const ProductDetails: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;

    const getBrands = async () => {
      setLoading(true);
      const response: any = await fetchBrands();
      if (mounted) {
        setLoading(false);
        setBrands(response.results);
      }
    };

    getBrands();

    return () => {
      mounted = false;
    };
  }, []);

  const onFinish = async () => {
    setLoading(true);
    await saveProduct(form.getFieldsValue(true));
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Product" subTitle="Form" />
      <Form
        form={form}
        name="productForm"
        initialValues={initial}
        onFinish={onFinish}>
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item name="name" label="Name">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item name="image" label="Image">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item name="originalPrice" label="Original Price">
              <InputNumber
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value = "") => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item name="discountedPrice" label="Discounted Price">
              <InputNumber
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value = "") => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item name="tagText" label="Tag Text">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item name="currencyIsoCode" label="Currency">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item name={["brand", "brandId"]} label="Brand">
              <Select>
                {brands.map((brand) => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.brandName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item name="offerExpirationDate" label="Offer Expiration Date">
              <DatePicker
                format={(value) => moment(value).format("DD-MM-YYYY")}
              />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item name="maxDiscount" label="Max Discount">
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col lg={24}>
            <Typography.Title level={5}>Videos feed</Typography.Title>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.relatedVideoFeed !== curValues.relatedVideoFeed
              }>
              {({ getFieldValue }) => {
                const relatedVideoFeed: Video[] =
                  getFieldValue("relatedVideoFeed") || [];
                return (
                  <Table
                    columns={videoColumns}
                    dataSource={relatedVideoFeed}
                    bordered
                    rowKey={(record) => `video_${record.videoFeedId}`}
                  />
                );
              }}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Button type="default" onClick={() => history.push("/products")}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Row>
      </Form>
    </>
  );
};

export default ProductDetails;
