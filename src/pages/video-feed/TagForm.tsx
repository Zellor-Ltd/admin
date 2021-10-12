import { Button, Col, Form, InputNumber, Row, Select } from "antd";
import { Brand } from "interfaces/Brand";
import { Tag } from "interfaces/Tag";
import { useEffect, useState } from "react";
import { fetchBrands, fetchTags } from "services/DiscoClubService";

interface FormProps {
  tag: Tag | undefined;
  setShowTagForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const TagForm: React.FC<FormProps> = ({ tag, setShowTagForm }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(
    tag?.brand?.id || ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;
    async function getTags() {
      const response: any = await fetchTags({});
      if (mounted) {
        setTags(response.results);
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
    getTags();
    getBrands();
    return () => {
      mounted = false;
    };
  }, []);

  const onChangeTag = (key: string) => {
    const currentValues = form.getFieldsValue(true);
    const selectedTag = tags.find((tag: Tag) => tag.id === key);

    setSelectedBrand((prev) => {
      prev = selectedTag?.brand?.id || "";
      return prev;
    });

    form.setFieldsValue({ ...selectedTag });
  };

  const handleBrandFilter = (value: any) => {
    setFilteredTags((prev) => {
      if (value) {
        prev = tags.filter((tag) => tag.brand?.id === value);
      } else {
        prev = tags;
      }
      return [...prev];
    });
    setSelectedBrand(value);
    if (value) {
      form.setFieldsValue({ id: "" });
    }
  };

  return (
    <Form name="tagForm" form={form} initialValues={tag} layout="vertical">
      <Row gutter={8}>
        <Col lg={12} xs={24}>
          <Form.Item label="Brand">
            <Select
              showSearch
              allowClear
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              loading={loading}
              onChange={(v) => handleBrandFilter(v)}
              value={selectedBrand}
            >
              {brands.map((brand) => (
                <Select.Option key={brand.id} value={brand.id}>
                  {brand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={12} xs={24}>
          <Form.Item name={"id"} label="Tag" rules={[{ required: true }]}>
            <Select
              onChange={(key: string) => onChangeTag(key)}
              loading={loading}
            >
              {filteredTags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  {tag.tagName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={["position", 0, "startTime"]}
            fieldKey={"startTime"}
            label="Start Time"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={["position", 0, "opacity"]}
            fieldKey={"opacity"}
            label="Opacity"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={["position", 0, "duration"]}
            fieldKey={"duration"}
            label="duration"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={["position", 0, "x"]}
            fieldKey={"x"}
            label="Position X"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={["position", 0, "y"]}
            fieldKey={"y"}
            label="Position Y"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
        <Col lg={3} xs={24}>
          <Form.Item
            name={["position", 0, "z"]}
            fieldKey={"z"}
            label="Z Index"
            rules={[{ required: true }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col>
          <Button onClick={() => setShowTagForm(false)}>Cancel</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Tag
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default TagForm;
