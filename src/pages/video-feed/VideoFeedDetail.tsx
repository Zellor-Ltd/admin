import React, { useState } from "react";
import { EditOutlined } from "@ant-design/icons";
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
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  // Popconfirm,
  Row,
  Select,
  Table,
  Typography,
} from "antd";
import { Segment } from "interfaces/Segment";
import { formatMoment } from "helpers/formatMoment";
import SegmentForm from "./SegmentForm";
import { FeedItem } from "interfaces/FeedItem";

const { Option } = Select;

const { Title } = Typography;

const VideoFeedDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(0);
  const [tagModalVisible, setTagModalVisible] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<Array<Position>>(
    []
  );

  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(-1);
  const [brandModalVisible, setBrandModalVisible] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(-1);

  const onAddBrand = () => {
    setSelectedBrand(void 0);
    setSelectedBrandIndex(-1);
    setBrandModalVisible(true);
  };

  const onCancelBrandModal = () => {
    setBrandModalVisible(false);
  };

  const onCancelSegmentForm = () => {
    setSelectedSegment(void 0);
  };

  const onEditBrand = (brand: Brand, index: number) => {
    setSelectedBrand(brand);
    setSelectedBrandIndex(index);
    setBrandModalVisible(true);
  };

  const onAddTag = () => {
    setSelectedTag(void 0);
    setSelectedTagIndex(-1);
    setSelectedPositions([]);
    setTagModalVisible(true);
  };

  const onEditSegment = (segment: Segment, index: number) => {
    setSelectedSegment(segment);
    setSelectedSegmentIndex(index);
  };

  const hideTagModal = () => {
    setTagModalVisible(false);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const item: FeedItem = form.getFieldsValue(true);
      item.package = item.package.map((pack) => ({
        ...pack,
        brands: pack.brands ? pack.brands : [],
        tags: pack.tags ? pack.tags : [],
      }));
      // item.validity = moment(item.validity).format("DD/MM/YYYY");
      await saveVideoFeed(item);
      message.success("Register updated with success.");
      setLoading(false);
      history.push("/feed");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
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

  const onAddSegment = () => {
    setSelectedSegment({
      brands: [],
      influencer: {},
      tags: [],
      video: {},
    });
    setSelectedSegmentIndex(-1);
  };

  const segmentColumns = [
    {
      title: "Video Length",
      dataIndex: ["video", "length"],
    },
    {
      title: "Influencer",
      dataIndex: ["influencer", "influencerName"],
    },
    {
      title: "actions",
      dataIndex: "actions",
      width: "5%",
      render: (_: any, record: Segment, index: number) => (
        <div style={{ display: "flex" }}>
          <Button type="link">
            <EditOutlined onClick={() => onEditSegment(record, index)} />
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

  return (
    <>
      <PageHeader title="Video feed update" subTitle="Video" />
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "tagForm") {
            const { segmentForm } = forms;
            const tags: any[] = segmentForm.getFieldValue("tags") || [];

            if (selectedTagIndex > -1) {
              tags[selectedTagIndex] = values;
              tags[selectedTagIndex].position = selectedPositions;
              segmentForm.setFieldsValue({ tags: [...tags] });
            } else {
              values.position = selectedPositions;
              segmentForm.setFieldsValue({ tags: [...tags, values] });
            }

            setSelectedPositions([]);
            setTagModalVisible(false);
          }

          if (name === "brandForm") {
            const { segmentForm } = forms;
            const brands: any[] = segmentForm.getFieldValue("brands") || [];
            if (selectedBrandIndex > -1) {
              brands[selectedBrandIndex] = values;
              segmentForm.setFieldsValue({ brands: [...brands] });
            } else {
              segmentForm.setFieldsValue({ brands: [...brands, values] });
            }

            setBrandModalVisible(false);
          }

          if (name === "segmentForm") {
            const { feedForm, segmentForm } = forms;
            const segments: any[] = feedForm.getFieldValue("package") || [];
            if (selectedSegmentIndex > -1) {
              segments[selectedSegmentIndex] = segmentForm.getFieldsValue(true);
              feedForm.setFieldsValue({ package: [...segments] });
            } else {
              feedForm.setFieldsValue({
                package: [...segments, segmentForm.getFieldsValue(true)],
              });
            }
            setSelectedSegment(undefined);
            setSelectedSegmentIndex(-1);
          }
        }}>
        <>
          <Form
            form={form}
            onFinish={onFinish}
            name="feedForm"
            initialValues={initial}
            layout="vertical">
            {!selectedSegment && (
              <>
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Form.Item name="title" label="Title">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="category" label="Category">
                      <Select placeholder="Please select a category">
                        <Option value="Category 1">Category 1</Option>
                        <Option value="Category 2">Category 2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={8}>
                  <Col lg={8} xs={24}>
                    <Form.Item name="format" label="Format">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item name="lengthTotal" label="Length">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item name="language" label="Language">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={8} xs={24}>
                    <Form.Item name="target" label="Target">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item name="modelRelease" label="Model Release">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item name="market" label="Market">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="validity"
                      label="Expiration Date"
                      getValueProps={formatMoment}>
                      <DatePicker format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  htmlType="button"
                  style={{ margin: "8px 0" }}
                  onClick={onAddSegment}>
                  Add Segment
                </Button>
                <Title level={3}>Segments</Title>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.package !== curValues.package
                  }>
                  {({ getFieldValue }) => {
                    const segments: Segment[] = getFieldValue("package") || [];

                    return (
                      <Table
                        columns={segmentColumns}
                        dataSource={segments}
                        bordered
                        rowKey={() => `Package_${Math.random()}`}
                      />
                    );
                  }}
                </Form.Item>

                <Row gutter={8}>
                  <Col>
                    <Button
                      type="default"
                      onClick={() => history.push("/feed")}>
                      Cancel
                    </Button>
                  </Col>
                  <Col>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </>
        {selectedSegment && (
          <SegmentForm
            segment={selectedSegment}
            onCancel={onCancelSegmentForm}
            onEditTag={onEditTag}
            onDeleteTag={onDeleteTag}
            onEditBrand={onEditBrand}
            onDeleteBrand={onDeleteBrand}
            onAddBrand={onAddBrand}
            onAddTag={onAddTag}
          />
        )}
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
