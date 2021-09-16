import React, { useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Tag } from "interfaces/Tag";
import { Position } from "interfaces/Position";
import { RouteComponentProps } from "react-router-dom";
import ModalTag from "./ModalTag";
import { Brand } from "interfaces/Brand";
import ModalBrand from "./ModalBrand";
import {
  fetchCategories,
  fetchCreators,
  fetchUsers,
  lockFeedToUser,
  saveVideoFeed,
  unlockFeed,
} from "services/DiscoClubService";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  PageHeader,
  Radio,
  Row,
  Select,
  Slider,
  Tabs,
  Typography,
} from "antd";
import { Segment } from "interfaces/Segment";
import { formatMoment } from "helpers/formatMoment";
import SegmentForm from "./SegmentForm";
import { FeedItem } from "interfaces/FeedItem";
import { useSelector } from "react-redux";
import { User } from "interfaces/User";
import "./VideoFeed.scss";
import { Creator } from "interfaces/Creator";
import { Category } from "interfaces/Category";
import { RichTextEditor } from "components/RichTextEditor";
import "./VideoFeedDetail.scss";
import { useRequest } from "hooks/useRequest";

const { Title } = Typography;

const VideoFeedDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;

  const {
    settings: { language = [] },
  } = useSelector((state: any) => state.settings);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalAddFeedToUser, setModalAddFeedToUser] = useState<boolean>(false);
  const [modalRemoveFeedFromUser, setModalRemoveFeedFromUser] =
    useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(0);
  const [tagModalVisible, setTagModalVisible] = useState<boolean>(false);
  const [selectedPositions, setSelectedPositions] = useState<Array<Position>>(
    []
  );
  const [influencers, setInfluencers] = useState<Creator[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(-1);
  const [brandModalVisible, setBrandModalVisible] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(-1);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [segForm, setSegForm] = useState<any>();

  const { doRequest } = useRequest({ setLoading });

  useEffect(() => {
    async function getUsers() {
      const response: any = await fetchUsers();

      setUsers(response.results);
    }
    async function getInfluencers() {
      const response: any = await fetchCreators();
      setInfluencers(response.results);
    }
    async function getCategories() {
      const response: any = await fetchCategories();
      setCategories(response.results);
    }
    getUsers();
    getInfluencers();
    getCategories();
  }, []);

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
    if (segForm?.isFieldsTouched()) {
      console.log(segForm.getFieldsValue(true));
      segForm.submit();
    }
    setTimeout(() => {
      setSelectedSegment(segment);
      setSelectedSegmentIndex(index);
    }, 1);
  };

  const hideTagModal = () => {
    setTagModalVisible(false);
  };

  const onFinish = async () => {
    const item: FeedItem = form.getFieldsValue(true);
    item.package = item.package?.map((pack) => ({
      ...pack,
      tags: pack.tags ? pack.tags : [],
    }));
    // item.validity = moment(item.validity).format("DD/MM/YYYY");
    await doRequest(() => saveVideoFeed(item));
    history.goBack();
  };

  const onEditTag = (tag: Tag, index: number) => {
    setSelectedTag(tag);
    setTagModalVisible(true);
    setSelectedTagIndex(index);
    setSelectedPositions(tag.position || []);
  };

  const onDeleteSegment = (evt: any, index: number) => {
    evt.stopPropagation();
    const dataSource = [...form.getFieldValue("package")];
    dataSource.splice(index, 1);
    form.setFieldsValue({ package: [...dataSource] });

    setSelectedSegment(undefined);
    setSelectedSegmentIndex(-1);
  };

  const onDeletePosition = (index: number) => {
    const dataSource = [...selectedPositions];
    dataSource.splice(index, 1);
    setSelectedPositions(dataSource);
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
    const packages = form.getFieldValue("package");
    setSelectedSegment({
      sequence: packages ? packages.length + 1 : 1,
      tags: [],
    });
    setSelectedSegmentIndex(-1);
  };

  const onUnlockFeedClick = async () => {
    await doRequest(() => unlockFeed(selectedUser));
    setSelectedUser("");
    setModalRemoveFeedFromUser(false);
  };

  const onModalAddFeedUserOkClick = async () => {
    await doRequest(() => lockFeedToUser(initial.id, selectedUser));
    setSelectedUser("");
    setModalAddFeedToUser(false);
  };

  const onModalAddFeedUserChange = (value: string) => {
    setSelectedUser(value);
  };

  const setChildForm = (form: any) => {
    setTimeout(() => {
      setSegForm(form);
    }, 1);
  };

  useEffect(() => {
    if (initial?.ageMin && initial?.ageMax)
      setageRange([initial?.ageMin, initial?.ageMax]);
  }, [initial]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setageRange(value);
  };

  return (
    <div className="video-feed-detail">
      <PageHeader title="Video feed update" subTitle="Video" />
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "tagForm") {
            const { segmentForm, tagForm } = forms;
            const tags: any[] = segmentForm.getFieldValue("tags") || [];

            const newValue = tagForm.getFieldsValue(true);
            if (selectedTagIndex > -1) {
              tags[selectedTagIndex] = newValue;
              tags[selectedTagIndex].position = selectedPositions;
              segmentForm.setFieldsValue({ tags: [...tags] });
            } else {
              newValue.position = selectedPositions;
              segmentForm.setFieldsValue({ tags: [...tags, newValue] });
            }

            setSelectedPositions([]);
            setTagModalVisible(false);
          }

          if (name === "brandForm") {
            const { segmentForm, brandForm } = forms;
            const brands: any[] = segmentForm.getFieldValue("brands") || [];
            const newValue = brandForm.getFieldsValue(true);
            if (selectedBrandIndex > -1) {
              brands[selectedBrandIndex] = newValue;
              segmentForm.setFieldsValue({ brands: [...brands] });
            } else {
              segmentForm.setFieldsValue({ brands: [...brands, newValue] });
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
        }}
      >
        <>
          <Form
            form={form}
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
            <Tabs defaultActiveKey="Video Details">
              <Tabs.TabPane tab="Video Details" key="Video Details">
                <Row gutter={8}>
                  <Col lg={24} xs={24}>
                    <Form.Item name="status" label="Status">
                      <Radio.Group buttonStyle="solid">
                        <Radio.Button value="live">Live</Radio.Button>
                        <Radio.Button value="paused">Paused</Radio.Button>
                        <Radio.Button value="expired">Expired</Radio.Button>
                        <Radio.Button value="pending">Pending</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item name="title" label="Title">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item
                      name="shortDescription"
                      label="Short description"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item name="category" label="Category">
                      <Select placeholder="Please select a category">
                        {categories.map((category: any) => (
                          <Select.Option
                            key={category.name}
                            value={category.name}
                          >
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
                          form.setFieldsValue({
                            creator: influencers.find(
                              (influencer) => influencer.id === key
                            ),
                          })
                        }
                      >
                        {influencers.map((influencer: any) => (
                          <Select.Option
                            key={influencer.id}
                            value={influencer.id}
                          >
                            {influencer.firstName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Descriptors" key="Descriptors">
                <Row gutter={8}>
                  <Col lg={24} xs={24}>
                    <Form.Item name="description" label="Long description">
                      <RichTextEditor formField="description" form={form} />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item name="creatorHtml" label="Creator Descriptor">
                      <RichTextEditor formField="creatorHtml" form={form} />
                    </Form.Item>
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Settings" key="Settings">
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
              <Tabs.TabPane tab="Segments" key="Segments">
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
            <Row gutter={8} hidden={!!selectedSegment}>
              <Col>
                <Button type="default" onClick={() => history.goBack()}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button type="primary" onClick={onFinish} loading={loading}>
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Form>
        </>

        {selectedSegment && (
          <SegmentForm
            segment={selectedSegment}
            onCancel={onCancelSegmentForm}
            onEditTag={onEditTag}
            onEditBrand={onEditBrand}
            onAddBrand={onAddBrand}
            onAddTag={onAddTag}
            formFn={setChildForm}
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
        <Modal
          visible={modalAddFeedToUser}
          onCancel={() => setModalAddFeedToUser(false)}
          onOk={() => onModalAddFeedUserOkClick()}
          okButtonProps={{ disabled: !selectedUser }}
          title="Lock feed to User"
        >
          <Select
            onChange={onModalAddFeedUserChange}
            placeholder="Please select user"
            style={{ width: "100%" }}
          >
            {users.map((user: any) => (
              <Select.Option key={user.id} value={user.id}>
                {`${user.name} - ${user.user}`}
              </Select.Option>
            ))}
          </Select>
        </Modal>
        <Modal
          visible={modalRemoveFeedFromUser}
          onCancel={() => setModalRemoveFeedFromUser(false)}
          onOk={() => onUnlockFeedClick()}
          okButtonProps={{ disabled: !selectedUser }}
          title="Unlock user feed"
        >
          <Select
            onChange={onModalAddFeedUserChange}
            placeholder="Please select user"
            style={{ width: "100%" }}
          >
            {users.map((user: any) => (
              <Select.Option key={user.id} value={user.id}>
                {`${user.name} - ${user.user}`}
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </Form.Provider>
    </div>
  );
};

export default VideoFeedDetail;
