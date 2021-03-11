import React, { useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Tag } from "interfaces/Tag";
import { Position } from "interfaces/Position";
import { RouteComponentProps } from "react-router-dom";
import ModalTag from "./ModalTag";
import { Brand } from "interfaces/Brand";
import ModalBrand from "./ModalBrand";
import { saveVideoFeed } from "services/DiscoClubService";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Table,
  Typography,
} from "antd";

const { Option } = Select;

const { Title } = Typography;

const VideoFeedDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;

  const [form] = Form.useForm();
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(0);
  const [tagModalVisible, setTagModalVisible] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<Array<Position>>(
    []
  );

  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [brandModalVisible, setBrandModalVisible] = useState<boolean>(false);

  const onAddBrand = () => {
    setSelectedBrand(void 0);
    setBrandModalVisible(true);
  };

  const onCancelBrandModal = () => {
    setBrandModalVisible(false);
  };

  const onEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandModalVisible(true);
  };

  const onAddTag = () => {
    setSelectedTag(void 0);
    setSelectedPositions([]);
    setTagModalVisible(true);
  };

  const hideTagModal = () => {
    setTagModalVisible(false);
  };

  const onFinish = () => {
    saveVideoFeed(form.getFieldsValue(true));
  };

  const onEditTag = (tag: Tag, index: number) => {
    setSelectedTag(tag);
    setTagModalVisible(true);
    setSelectedTagIndex(index);
    setSelectedPositions(tag.position || []);
  };

  const onDeletePosition = (index: number) => {
    const dataSource = [...selectedPositions];
    dataSource.splice(index, 1);
    setSelectedPositions(dataSource);
  };

  const onDeleteBrand = (index: number) => {
    const brand: Brand[] = form.getFieldValue("brand") || [];
    brand.splice(index, 1);
    form.setFieldsValue({ brand: [...brand] });
  };

  const onDeleteTag = (index: number) => {
    const tags: Tag[] = form.getFieldValue("tags") || [];
    tags.splice(index, 1);
    form.setFieldsValue({ tags: [...tags] });
  };

  const onSavePosition = (row: Position, index: number) => {
    const newData = [...selectedPositions];
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setSelectedPositions(newData);
  };

  const onAddPosition = () => {
    setSelectedPositions([
      ...selectedPositions,
      {
        key: `${Math.random()}`,
        startTime: 0,
        opacity: 0,
        x: 0,
        y: 0,
        z: 0,
      },
    ]);
  };

  const brandColumns = [
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
      render: (_: any, record: Brand, index: number) => (
        <div style={{ display: "flex" }}>
          <Button type="link">
            <EditOutlined onClick={() => onEditBrand(record)} />
          </Button>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => onDeleteBrand(index)}>
            <Button type="link">
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const tagColumns = [
    {
      title: "Product Name",
      dataIndex: "productName",
    },
    {
      title: "Product Id",
      dataIndex: "productId",
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
      render: (_: any, record: Tag, index: number) => (
        <div style={{ display: "flex" }}>
          <Button type="link">
            <EditOutlined onClick={() => onEditTag(record, index)} />
          </Button>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => onDeleteTag(index)}>
            <Button type="link">
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Video feed update" subTitle="Video" />
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "tagForm") {
            const { feedForm } = forms;
            const tags: Tag[] = feedForm.getFieldValue("tags") || [];
            values.position = selectedPositions;
            setSelectedPositions([]);
            if (selectedTag) {
              tags[selectedTagIndex].position = selectedPositions;
              feedForm.setFieldsValue({ tags: [...tags] });
            } else {
              feedForm.setFieldsValue({ tags: [...tags, values] });
            }
            setTagModalVisible(false);
          }

          if (name === "brandForm") {
            const { feedForm } = forms;
            const brands: Brand[] = feedForm.getFieldValue("brands") || [];
            if (selectedBrand) {
              feedForm.setFieldsValue({ brands: [...brands] });
            } else {
              feedForm.setFieldsValue({ brands: [...brands, values] });
            }
            setBrandModalVisible(false);
          }
        }}>
        <Form
          form={form}
          onFinish={onFinish}
          name="feedForm"
          initialValues={initial}>
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Form.Item name={["video", "title"]} label="Title">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={12} xs={24}>
              <Form.Item name={["video", "category"]} label="Category">
                <Select placeholder="Please select a category">
                  <Option value="Category 1">Category 1</Option>
                  <Option value="Category 2">Category 2</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={24}>
              <Form.Item name={["video", "videoUrl"]} label="Video Url">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={24}>
              <Form.Item name={["video", "thumbnailUrl"]} label="Thumbnail Url">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={8} xs={24}>
              <Form.Item name={["video", "format"]} label="Format">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name={["video", "length"]} label="Length">
                <InputNumber />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name={["video", "language"]} label="Language">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={8} xs={24}>
              <Form.Item name={["video", "target"]} label="Target">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name={["video", "modelRelease"]} label="Model Release">
                <InputNumber />
              </Form.Item>
            </Col>
            <Col lg={8} xs={24}>
              <Form.Item name={["video", "market"]} label="Market">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Button
            htmlType="button"
            style={{ margin: "8px 0" }}
            onClick={onAddBrand}>
            Add Brand
          </Button>
          <Title level={3}>Brands</Title>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.brands !== curValues.brands
            }>
            {({ getFieldValue }) => {
              const brands: Brand[] = getFieldValue("brands") || [];

              return (
                <Table
                  columns={brandColumns}
                  dataSource={brands}
                  bordered
                  rowKey={(record) =>
                    `Brand_${record.brandId}_${record.brandLogoUrl}`
                  }
                />
              );
            }}
          </Form.Item>
          <Button
            htmlType="button"
            style={{ margin: "8px 0" }}
            onClick={onAddTag}>
            Add Tag
          </Button>
          <Title level={3}>Tags</Title>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.tags !== curValues.tags
            }>
            {({ getFieldValue }) => {
              const tags: Tag[] = getFieldValue("tags") || [];
              return (
                <Table
                  columns={tagColumns}
                  dataSource={tags}
                  bordered
                  rowKey={(record) =>
                    `tag_${record.tagId}_${record.productDiscount}`
                  }
                />
              );
            }}
          </Form.Item>

          <Button type="default" onClick={() => history.push("/video-feed")}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form>
        <ModalBrand
          visible={brandModalVisible}
          brand={selectedBrand}
          onCancel={onCancelBrandModal}
        />
        <ModalTag
          visible={tagModalVisible}
          onCancel={hideTagModal}
          tag={selectedTag}
          selectedPositions={selectedPositions}
          onDeletePosition={onDeletePosition}
          onSavePosition={onSavePosition}
          onAddPosition={onAddPosition}
        />
      </Form.Provider>
    </>
  );
};

export default VideoFeedDetail;
