import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Popconfirm,
  Radio,
  Row,
  Select,
  Slider,
  Table,
  Tabs,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { Upload } from "components";
import { RichTextEditor } from "components/RichTextEditor";
import { formatMoment } from "helpers/formatMoment";
import { useRequest } from "hooks/useRequest";
import { Brand } from "interfaces/Brand";
import { Category } from "interfaces/Category";
import { Creator } from "interfaces/Creator";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import {
  fetchCategories,
  fetchCreators,
  saveVideoFeed,
} from "services/DiscoClubService";
import BrandForm from "./BrandForm";
import "./VideoFeed.scss";
import "./VideoFeedDetail.scss";

const { Title } = Typography;

const VideoFeedDetailV2: React.FC<RouteComponentProps> = ({
  history,
  location,
}) => {
  const initial: any = location.state;

  const {
    settings: { language = [] },
  } = useSelector((state: any) => state.settings);

  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [influencers, setInfluencers] = useState<Creator[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(-1);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);

  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(-1);
  const [showBrandForm, setShowBrandForm] = useState<boolean>(false);

  const { doRequest } = useRequest({ setLoading });

  useEffect(() => {
    async function getInfluencers() {
      const response: any = await fetchCreators();
      setInfluencers(response.results);
    }
    async function getCategories() {
      const response: any = await fetchCategories();
      setCategories(response.results);
    }
    getInfluencers();
    getCategories();
  }, []);

  const onFinish = async () => {
    const item: FeedItem = feedForm.getFieldsValue(true);
    item.package = item.package?.map((pack) => ({
      ...pack,
      tags: pack.tags ? pack.tags : [],
    }));
    // item.validity = moment(item.validity).format("DD/MM/YYYY");
    await doRequest(() => saveVideoFeed(item));
    history.goBack();
  };

  const onDeleteSegment = (evt: any, index: number) => {
    evt.stopPropagation();
    const dataSource = [...feedForm.getFieldValue("package")];
    dataSource.splice(index, 1);
    feedForm.setFieldsValue({ package: [...dataSource] });

    setSelectedSegment(undefined);
    setSelectedSegmentIndex(-1);
  };

  const onAddSegment = () => {
    const packages = feedForm.getFieldValue("package");
    const sequence = packages ? packages.length + 1 : 1;
    setSelectedSegment({
      sequence,
      tags: [],
      brands: [],
    });
    setSelectedSegmentIndex(sequence);
  };

  useEffect(() => {
    if (initial?.ageMin && initial?.ageMax)
      setageRange([initial?.ageMin, initial?.ageMax]);
  }, [initial]);

  const onChangeAge = (value: [number, number]) => {
    feedForm.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setageRange(value);
  };

  const onEditSegment = (segment: Segment, segmentIndex: number) => {
    setSelectedSegment(segment);
    setSelectedSegmentIndex(segmentIndex);
  };

  const VideoUpdatePage = () => {
    return (
      <>
        <Tabs defaultActiveKey="Video Details">
          <Tabs.TabPane forceRender tab="Video Details" key="Video Details">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Form.Item name="status" label="Status">
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="live">Live</Radio.Button>
                    <Radio.Button value="paused">Paused</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="title" label="Title">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="shortDescription" label="Short description">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="category" label="Category">
                  <Select placeholder="Please select a category">
                    {categories.map((category: any) => (
                      <Select.Option key={category.name} value={category.name}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name={["creator", "id"]} label="Creator">
                  <Select
                    placeholder="Please select a creator"
                    onChange={(key: string) =>
                      feedForm.setFieldsValue({
                        creator: influencers.find(
                          (influencer) => influencer.id === key
                        ),
                      })
                    }
                  >
                    {influencers.map((influencer: any) => (
                      <Select.Option key={influencer.id} value={influencer.id}>
                        {influencer.firstName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Descriptors" key="Descriptors">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Form.Item name="description" label="Long description">
                  <RichTextEditor formField="description" form={feedForm} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="creatorHtml" label="Creator Descriptor">
                  <RichTextEditor formField="creatorHtml" form={feedForm} />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Settings" key="Settings">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Form.Item name="lengthTotal" label="Length">
                  <InputNumber />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="format" label="Format">
                  <Input />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="language" label="Language">
                  <Select placeholder="Please select a language">
                    {language.map((lang: any) => (
                      <Select.Option key={lang.value} value={lang.value}>
                        {lang.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  name="videoType"
                  label="Video Type"
                  rules={[{ required: true }]}
                >
                  <Select mode="multiple">
                    <Select.Option value="Feed">Feed</Select.Option>
                    <Select.Option value="Brand">Brand</Select.Option>
                    <Select.Option value="Review">Review</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Typography.Title level={4}>Target</Typography.Title>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item label="Slider">
                  <Slider
                    range
                    marks={{ 12: "12", 100: "100" }}
                    min={12}
                    max={100}
                    value={ageRange}
                    onChange={onChangeAge}
                  />
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item name="gender" label="Gender">
                  <Select mode="multiple">
                    <Select.Option value="Female">Female</Select.Option>
                    <Select.Option value="Male">Male</Select.Option>
                    <Select.Option value="Other">Other</Select.Option>
                    <Select.Option value="Prefer not to say">
                      Prefer not to say
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Segments" key="Segments">
            <Row gutter={8}>
              <Col lg={12} xs={24}>
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="goLiveDate"
                      label="Go Live Date"
                      getValueProps={formatMoment}
                    >
                      <DatePicker format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="validity"
                      label="Expiration Date"
                      getValueProps={formatMoment}
                    >
                      <DatePicker format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Title level={3}>Segments</Title>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.package !== curValues.package
              }
            >
              {({ getFieldValue }) => {
                const segments: Segment[] = getFieldValue("package") || [];
                return (
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    {segments.map((segment, segmentIndex) => (
                      <div
                        key={segment.sequence}
                        className={`segment-thumbnail ${
                          (selectedSegmentIndex === segmentIndex &&
                            "selected") ||
                          ""
                        }`}
                        onClick={() => onEditSegment(segment, segmentIndex)}
                      >
                        {segment?.thumbnail?.url
                          ? [
                              <img
                                alt={segment.thumbnail || "Thumbnail"}
                                src={segment.thumbnail?.url}
                                key={segment.thumbnail?.url}
                                style={{
                                  height: "256px",
                                  width: "auto",
                                }}
                              />,
                              <Button
                                icon={<DeleteOutlined />}
                                shape="circle"
                                danger
                                type="primary"
                                className="remove-button"
                                key={`botao_${segment.thumbnail?.url}`}
                                onClick={(evt) =>
                                  onDeleteSegment(evt, segmentIndex)
                                }
                              />,
                            ]
                          : [
                              <Button
                                icon={<DeleteOutlined />}
                                shape="circle"
                                type="primary"
                                danger
                                onClick={(evt) =>
                                  onDeleteSegment(evt, segmentIndex)
                                }
                              />,
                              <div>No Thumbnail</div>,
                            ]}
                      </div>
                    ))}
                  </div>
                );
              }}
            </Form.Item>
            <Button
              htmlType="button"
              style={{ margin: "8px 0px 80px 8px" }}
              onClick={onAddSegment}
            >
              Add Segment
            </Button>
          </Tabs.TabPane>
        </Tabs>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
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
    );
  };

  const brandsColumns: ColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "brandName",
      width: "15%",
    },
    {
      title: "Start time",
      dataIndex: ["position", "0", "startTime"],
      width: "15%",
    },
    {
      title: "Duration",
      dataIndex: ["position", "0", "duration"],
      width: "15%",
    },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, __, index) => (
        <>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => {
              const brands: any[] = segmentForm.getFieldValue("brands") || [];
              setSelectedBrand(brands[index]);
              setSelectedBrandIndex(index);
              setShowBrandForm(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
            <Button
              type="link"
              style={{ padding: 0, margin: 6 }}
              onClick={() => {
                const brands: any[] = segmentForm.getFieldValue("brands") || [];
                brands.splice(index, 1);
                segmentForm.setFieldsValue({
                  brands,
                });
                setSelectedSegment(segmentForm.getFieldsValue(true));
              }}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const SegmentPage = () => {
    return (
      <>
        {showBrandForm && (
          <BrandForm
            setShowBrandForm={setShowBrandForm}
            brand={selectedBrand}
          />
        )}
        <Form
          form={segmentForm}
          name="segmentForm"
          layout="vertical"
          initialValues={selectedSegment}
        >
          {!showBrandForm && (
            <>
              <Tabs defaultActiveKey="Video Details">
                <Tabs.TabPane forceRender tab="Images" key="Images">
                  <Col lg={6} xs={24}>
                    <Col lg={24} xs={24}>
                      <Form.Item label="Video">
                        <Upload.VideoUpload
                          fileList={selectedSegment!.video}
                          formProp={"video"}
                          form={segmentForm}
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={24} xs={24}>
                      <Form.Item label="Thumbnail URL">
                        <Upload.ImageUpload
                          fileList={selectedSegment!.thumbnail}
                          formProp={"thumbnail"}
                          form={segmentForm}
                        />
                      </Form.Item>
                    </Col>
                  </Col>
                </Tabs.TabPane>
                <Tabs.TabPane
                  forceRender
                  tab={`Brands (${selectedSegment!.brands?.length || 0})`}
                  key="Brands"
                >
                  <Button
                    type="default"
                    style={{ float: "right", marginBottom: "12px" }}
                    onClick={() => {
                      setSelectedBrand(undefined);
                      setSelectedBrandIndex(-1);
                      setShowBrandForm(true);
                    }}
                  >
                    New Brand
                  </Button>
                  <Table
                    rowKey="id"
                    columns={brandsColumns}
                    dataSource={selectedSegment!.brands}
                    loading={loading}
                    pagination={false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane forceRender tab="Tags" key="Tags"></Tabs.TabPane>
              </Tabs>
              <Row gutter={8} style={{ marginTop: "20px" }}>
                <Col>
                  <Button
                    type="default"
                    onClick={() => setSelectedSegment(undefined)}
                  >
                    Back
                  </Button>
                </Col>
                <Col>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Segment
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </>
    );
  };

  return (
    <div className="video-feed-detail">
      <PageHeader title="Video feed update" subTitle="Video" />
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          const { feedForm, segmentForm } = forms;
          if (name === "segmentForm") {
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
          if (name === "brandForm") {
            const { segmentForm, brandForm } = forms;
            const brands: any[] = segmentForm.getFieldValue("brands") || [];
            const newValue = brandForm.getFieldsValue(true);
            if (selectedBrandIndex > -1) {
              brands[selectedBrandIndex] = newValue;
              segmentForm.setFieldsValue({ brands: [...brands] });
            } else {
              segmentForm.setFieldsValue({
                brands: [...brands, newValue],
              });
            }
            setSelectedBrand(undefined);
            setSelectedBrandIndex(-1);
            setShowBrandForm(false);
            setSelectedSegment(segmentForm.getFieldsValue(true));
          }
        }}
      >
        {selectedSegment && <SegmentPage />}
        <Form
          form={feedForm}
          onFinish={onFinish}
          name="feedForm"
          initialValues={initial}
          onFinishFailed={({ errorFields }) => {
            errorFields.forEach((errorField) => {
              message.error(errorField.errors[0]);
            });
          }}
          layout="vertical"
          className="video-feed"
        >
          {!selectedSegment && <VideoUpdatePage />}
        </Form>
      </Form.Provider>
    </div>
  );
};

export default VideoFeedDetailV2;
