import { MinusCircleOutlined } from "@ant-design/icons";
import { Segment } from "interfaces/Segment";
import { Tag } from "interfaces/Tag";
import { Button, Col, Form, InputNumber, Row, Select } from "antd";
import { Brand } from "interfaces/Brand";
import { Upload } from "components";
import { useEffect, useState } from "react";
import { fetchTags } from "services/DiscoClubService";

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
    setLoading(true);
    getTags();
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
          <Form.List name="tags">
            {(fields, { add, remove }) => (
              <div>
                <Button onClick={() => add()}>Add Tag</Button>
                {fields.map((field) => (
                  <Row gutter={8} key={Math.random()}>
                    <Col lg={4} xs={24}>
                      <Form.Item name={[field.name, "id"]} label="Tag">
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
                        label="Start Time">
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col lg={3} xs={24}>
                      <Form.Item
                        name={[field.name, "position", 0, "opacity"]}
                        fieldKey={[field.fieldKey, "opacity"]}
                        label="Opacity">
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col lg={3} xs={24}>
                      <Form.Item
                        name={[field.name, "position", 0, "duration"]}
                        fieldKey={[field.fieldKey, "duration"]}
                        label="duration">
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col lg={3} xs={24}>
                      <Form.Item
                        name={[field.name, "position", 0, "x"]}
                        fieldKey={[field.fieldKey, "x"]}
                        label="Position X">
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col lg={3} xs={24}>
                      <Form.Item
                        name={[field.name, "position", 0, "y"]}
                        fieldKey={[field.fieldKey, "y"]}
                        label="position Y">
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col lg={3} xs={24}>
                      <Form.Item
                        name={[field.name, "position", 0, "z"]}
                        fieldKey={[field.fieldKey, "z"]}
                        label="Z Index">
                        <InputNumber />
                      </Form.Item>
                    </Col>
                    <Col style={{ display: "flex", alignItems: "center" }}>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Col>
                  </Row>
                ))}
              </div>
            )}
          </Form.List>
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
