import Title from "antd/lib/typography/Title";
import { Position } from "interfaces/Position";
import { EditOutlined } from "@ant-design/icons";
import { Segment } from "interfaces/Segment";
import { Tag } from "interfaces/Tag";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Table,
} from "antd";
import { Brand } from "interfaces/Brand";
import { Upload } from "components";
import { useEffect, useState } from "react";

interface FormProps {
  segment: Segment | undefined;
  onCancel: () => void;
  onEditTag: (tag: Tag, index: number) => void;
  onDeleteTag: (index: number) => void;
  onEditBrand: (brand: Brand, index: number) => void;
  onDeleteBrand: (index: number) => void;
  onAddBrand: () => void;
  onAddTag: () => void;
}

const tagColumns = (
  onEditTag: (tag: Tag, index: number) => void
  // onDeleteTag: (index: number) => void
) => [
  {
    title: "Tag",
    dataIndex: "tagName",
  },
  {
    title: "Start time",
    dataIndex: "startTime",
    editable: true,
    number: true,
  },
  {
    title: "Movments",
    dataIndex: "position",
    render: (positions: Position[] = []) => positions.length,
  },
  {
    title: "actions",
    dataIndex: "actions",
    width: "5%",
    render: (_: any, record: Tag, index: number) => (
      <div style={{ display: "flex" }}>
        <Button type="link">
          <EditOutlined onClick={() => onEditTag(record, index)} />
        </Button>
        {/* <Popconfirm
          title="Sure to delete?"
          onConfirm={() => onDeleteTag(index)}>
          <Button type="link">
            <DeleteOutlined />
          </Button>
        </Popconfirm> */}
      </div>
    ),
  },
];

const brandColumns = (
  onEditBrand: (brand: Brand, index: number) => void,
  onDeleteBrand: (index: number) => void
) => [
  {
    title: "Brand Name",
    dataIndex: "brandName",
  },

  {
    title: "Start time",
    dataIndex: "startTime",
  },
  {
    title: "actions",
    dataIndex: "actions",
    width: "5%",
    render: (_: any, record: Brand, index: number) => (
      <div style={{ display: "flex" }}>
        <Button type="link">
          <EditOutlined onClick={() => onEditBrand(record, index)} />
        </Button>
        {/* <Popconfirm
          title="Sure to delete?"
          onConfirm={() => onDeleteBrand(index)}>
          <Button type="link">
            <DeleteOutlined />
          </Button>
        </Popconfirm> */}
      </div>
    ),
  },
];

const SegmentForm: React.FC<FormProps> = ({
  segment,
  onCancel,
  onEditTag,
  onEditBrand,
  onDeleteBrand,
  onAddTag,
  onAddBrand,
}) => {
  const [form] = Form.useForm();

  const [videoList, setVideoList] = useState<any[]>([]);
  const [thumbList, setThumbList] = useState<any[]>([]);

  useEffect(() => {
    if (segment) {
      if (segment.video.videoUrl) {
        setVideoList([
          {
            url: segment.video.videoUrl,
          },
        ]);
      }
      if (segment.video.thumbnailUrl) {
        setThumbList([
          {
            url: segment.video.thumbnailUrl,
          },
        ]);
      }
    }
  }, [segment]);

  const onChangeThumbUrl = (info: any) => {
    setThumbList(info.fileList);
    if (info.file.status === "done") {
      const response = JSON.parse(info.file.xhr.response);
      form.setFieldsValue({
        video: { thumbnailUrl: response.result.replace(";", "") },
      });
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const onChangeVideoUrl = (info: any) => {
    setVideoList(info.fileList);
    if (info.file.status === "done") {
      const response = JSON.parse(info.file.xhr.response);
      form.setFieldsValue({
        video: { videoUrl: response.result.replace(";", "") },
      });
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <Form
      form={form}
      initialValues={segment}
      name="segmentForm"
      layout="vertical">
      <Title level={1}>Edit Segment</Title>
      <Title level={3}>Influencer</Title>
      <Row gutter={8}>
        <Col lg={12} xs={24}>
          <Form.Item
            name={["influencer", "influencerName"]}
            label="Influencer Name">
            <Input />
          </Form.Item>
        </Col>
        {/* <Col lg={6} xs={0}>
          <Form.Item name={["brand", "brandId"]} label="Brand">
            <Select>
              {creators.map((creator) => (
                <Select.Option key={creator.id} value={creator.id}>
                  {creator.id}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col> */}
      </Row>

      <Title level={3}>Video</Title>
      <Row gutter={8}>
        {/* <Col lg={12} xs={24}>
          <Form.Item name={["video", "videoId"]} label="Video ID">
            <Input disabled />
          </Form.Item>
        </Col> */}
        <Col lg={8} xs={24}>
          <Form.Item label="Video URL">
            <Upload.VideoUpload
              onChange={onChangeVideoUrl}
              fileList={videoList}
              maxCount={1}
            />
          </Form.Item>
        </Col>
        <Col lg={8} xs={24}>
          <Form.Item label="Thumbnail URL">
            <Upload.ImageUpload
              onChange={onChangeThumbUrl}
              fileList={thumbList}
              maxCount={1}
            />
          </Form.Item>
        </Col>
        <Col lg={8} xs={24}>
          <Form.Item name={["video", "length"]} label="Video Length">
            <InputNumber />
          </Form.Item>
        </Col>
      </Row>
      <Title level={3}>Brands</Title>
      <Button
        htmlType="button"
        style={{ margin: "8px 0" }}
        onClick={onAddBrand}>
        Add Brand
      </Button>
      <Form.Item
        shouldUpdate={(prevValues, curValues) =>
          prevValues.brands !== curValues.brands
        }>
        {({ getFieldValue }) => {
          const brands: Brand[] = getFieldValue("brands") || [];

          return (
            <Table
              columns={brandColumns(onEditBrand, onDeleteBrand)}
              dataSource={brands}
              bordered
              rowKey={(record) => `Brand_${record.id}_${record.brandLogoUrl}`}
            />
          );
        }}
      </Form.Item>
      <Title level={3}>Tags</Title>
      <Button htmlType="button" style={{ margin: "8px 0" }} onClick={onAddTag}>
        Add Tag
      </Button>
      <Form.Item
        shouldUpdate={(prevValues, curValues) => {
          return prevValues.tags !== curValues.tags;
        }}>
        {({ getFieldValue }) => {
          const tags: Tag[] = getFieldValue("tags") || [];
          return (
            <Table
              columns={tagColumns(onEditTag)}
              dataSource={tags}
              bordered
              rowKey={(record) => `tag_${record.id}_${record.tagName}`}
            />
          );
        }}
      </Form.Item>
      <Row gutter={8}>
        <Col>
          <Button onClick={onCancel}>Cancel</Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit">
            Save Segment
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SegmentForm;
