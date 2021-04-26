import { MinusCircleOutlined } from "@ant-design/icons";
import { Segment } from "interfaces/Segment";
import { Tag } from "interfaces/Tag";
import { Button, Col, Form, InputNumber, Row, Select, Typography } from "antd";
import { Brand } from "interfaces/Brand";
import { Upload } from "components";
import { useEffect, useState } from "react";
import { fetchBrands, fetchTags } from "services/DiscoClubService";

interface FormProps {
  segment: Segment | undefined;
  onCancel: () => void;
  onEditTag: (tag: Tag, index: number) => void;
  onEditBrand: (brand: Brand, index: number) => void;
  onAddBrand: () => void;
  onAddTag: () => void;
  formFn: any;
}

const SegmentForm: React.FC<FormProps> = ({ segment, onCancel, formFn }) => {
  const [form] = Form.useForm();
  formFn(form);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
  }, [segment, form]);

  useEffect(() => {
    let mounted = true;
    async function getTags() {
      const response: any = await fetchTags();
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

  const onChangeTag = (key: string, fieldName: number) => {
    const formTags = form.getFieldValue("tags");
    const selectedTag = tags.find((tag: Tag) => tag.id === key);
    const changedTag = { ...formTags[fieldName], ...selectedTag };
    formTags[fieldName] = changedTag;

    form.setFieldsValue({ tags: formTags });
    form.setFields([{ name: "tags", touched: true }]);
  };

  const onChangeBrand = (key: string, fieldName: number) => {
    const formBrands = form.getFieldValue("brands");
    const selectedBran = brands.find((brand: Brand) => brand.id === key);
    const changedBrand = { ...formBrands[fieldName], ...selectedBran };
    formBrands[fieldName] = changedBrand;

    form.setFieldsValue({ brands: formBrands });
    form.setFields([{ name: "brands", touched: true }]);
  };

  return (
    <Form
      form={form}
      initialValues={segment}
      name="segmentForm"
      layout="vertical">
      <Row gutter={8}>
        <Col lg={4} xs={24}>
          <Form.Item
            name="sequence"
            label="Sequence"
            rules={[{ required: true }]}>
            <InputNumber />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={8}>
        <Col lg={6} xs={24}>
          <Col lg={24} xs={24}>
            <Form.Item label="Video URL">
              <Upload.VideoUpload
                fileList={segment?.video}
                formProp="video"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item label="Thumbnail URL">
              <Upload.ImageUpload
                form={form}
                formProp="thumbnail"
                fileList={segment?.thumbnail}
              />
            </Form.Item>
          </Col>
        </Col>
        <Col lg={18} xs={24}>
          <Col lg={24} xs={24}>
            <Typography.Title level={4}>Brands</Typography.Title>
          </Col>
          <Col lg={24} xs={24}>
            <Form.List name="brands">
              {(fields, { add, remove }) => (
                <div>
                  <Button
                    onClick={() =>
                      add({
                        position: [
                          {
                            startTime: 1,
                            opacity: 1,
                            duration: 2,
                            x: 100,
                            y: 100,
                            z: 1,
                          },
                        ],
                      })
                    }>
                    Add Brand
                  </Button>
                  {fields.map((field) => (
                    <Row gutter={8} key={Math.random()}>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, "id"]}
                          label="Brand"
                          rules={[{ required: true }]}>
                          <Select
                            onChange={(key: string) =>
                              onChangeBrand(key, field.name)
                            }
                            loading={loading}>
                            {brands.map((brand) => (
                              <Select.Option key={brand.id} value={brand.id}>
                                {brand.brandName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "startTime"]}
                          fieldKey={[field.fieldKey, "startTime"]}
                          label="Start Time"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "opacity"]}
                          fieldKey={[field.fieldKey, "opacity"]}
                          label="Opacity"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "duration"]}
                          fieldKey={[field.fieldKey, "duration"]}
                          label="duration"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "x"]}
                          fieldKey={[field.fieldKey, "x"]}
                          label="Position X"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "y"]}
                          fieldKey={[field.fieldKey, "y"]}
                          label="position Y"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "z"]}
                          fieldKey={[field.fieldKey, "z"]}
                          label="Z Index"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col style={{ display: "flex", alignItems: "center" }}>
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>
          </Col>
          <Col lg={24} xs={24}>
            <Typography.Title level={4}>Tags</Typography.Title>
          </Col>
          <Col lg={24} xs={24}>
            <Form.List name="tags">
              {(fields, { add, remove }) => (
                <div>
                  <Button
                    onClick={() =>
                      add({
                        position: [
                          {
                            startTime: 1,
                            opacity: 1,
                            duration: 2,
                            x: 100,
                            y: 100,
                            z: 1,
                          },
                        ],
                      })
                    }>
                    Add Tag
                  </Button>
                  {fields.map((field) => (
                    <Row gutter={8} key={Math.random()}>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name={[field.name, "id"]}
                          label="Tag"
                          rules={[{ required: true }]}>
                          <Select
                            onChange={(key: string) =>
                              onChangeTag(key, field.name)
                            }
                            loading={loading}>
                            {tags.map((tag) => (
                              <Select.Option key={tag.id} value={tag.id}>
                                {tag.tagName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "startTime"]}
                          fieldKey={[field.fieldKey, "startTime"]}
                          label="Start Time"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "opacity"]}
                          fieldKey={[field.fieldKey, "opacity"]}
                          label="Opacity"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "duration"]}
                          fieldKey={[field.fieldKey, "duration"]}
                          label="duration"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "x"]}
                          fieldKey={[field.fieldKey, "x"]}
                          label="Position X"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "y"]}
                          fieldKey={[field.fieldKey, "y"]}
                          label="position Y"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col lg={3} xs={24}>
                        <Form.Item
                          name={[field.name, "position", 0, "z"]}
                          fieldKey={[field.fieldKey, "z"]}
                          label="Z Index"
                          rules={[{ required: true }]}>
                          <InputNumber />
                        </Form.Item>
                      </Col>
                      <Col style={{ display: "flex", alignItems: "center" }}>
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>
          </Col>
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
    </Form>
  );
};

export default SegmentForm;
