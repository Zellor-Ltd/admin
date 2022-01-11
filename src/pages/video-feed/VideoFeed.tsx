import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  PageHeader,
  Popconfirm,
  Radio,
  Row,
  Select,
  Slider,
  Table,
  Tabs,
  Tag as AntTag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  deleteVideoFeed,
  fetchBrands,
  fetchCategories,
  fetchCreators,
  fetchVideoFeed,
  saveVideoFeed,
} from 'services/DiscoClubService';
import useFilter from 'hooks/useFilter';
import { Brand } from 'interfaces/Brand';
import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';
import { RichTextEditor } from 'components/RichTextEditor';
import { Upload } from 'components';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { Category } from 'interfaces/Category';
import { Creator } from 'interfaces/Creator';
import { Tag } from 'interfaces/Tag';
import { useSelector } from 'react-redux';
import BrandForm from './BrandForm';
import TagForm from './TagForm';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
import SimpleSelect from 'components/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';

const { Content } = Layout;
const { Title } = Typography;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [currentItem, setCurrentItem] = useState<FeedItem>();

  const {
    settings: { language = [] },
  } = useSelector((state: any) => state.settings);

  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [content, setContent] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [videoTab, setVideoTab] = useState<string>('Video Details');
  const [segmentTab, setSegmentTab] = useState<string>('Images');
  const [categories, setCategories] = useState<Category[]>([]);

  const defaultVideoTab = 'Video Details';
  const defaultSegmentTab = 'Images';
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();

  const [influencers, setInfluencers] = useState<Creator[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(-1);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);

  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(-1);
  const [showBrandForm, setShowBrandForm] = useState<boolean>(false);

  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(-1);
  const [showTagForm, setShowTagForm] = useState<boolean>(false);

  const [hashtags, setHashtags] = useState<string[]>([]);

  const [pageTitle, setPageTitle] = useState<string>('Video Update');
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);

  const { doRequest } = useRequest({ setLoading });

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const {
    setArrayList: setFilteredItems,
    filteredArrayList: filteredItems,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<FeedItem>([]);

  useEffect(() => {
    getDetailsResources();
    if (currentItem && currentItem.hashtags) {
      setHashtags(currentItem.hashtags);
    } else {
      setHashtags([]);
    }
  }, []);

  useEffect(() => {
    if (currentItem?.ageMin && currentItem?.ageMax)
      setAgeRange([currentItem?.ageMin, currentItem?.ageMax]);
  }, [currentItem]);

  useEffect(() => {
    if (showBrandForm)
      setPageTitle(
        `Store ${
          selectedBrandIndex > -1
            ? `${selectedBrandIndex + 1} Update`
            : 'Creation'
        }`
      );
    else if (showTagForm)
      setPageTitle(
        `Tag ${
          selectedTagIndex > -1 ? `${selectedTagIndex + 1} Update` : 'Creation'
        }`
      );
    else {
      setPageTitle(
        currentItem
          ? currentItem?.title.length > 50
            ? `${currentItem.title.slice(0, 50)} (...) Update`
            : `${currentItem.title} Update`
          : 'Update'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSegment, showBrandForm, showTagForm, currentItem]);

  useEffect(() => {
    feedForm.setFieldsValue(currentItem);
    segmentForm.setFieldsValue(currentItem);
  }, [currentItem]);

  useEffect(() => {
    if (!isEditing) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [isEditing]);

  const fetch = async (_brand?: Brand) => {
    setLoading(true);
    try {
      const response: any = await fetchVideoFeed();
      setLoading(false);
      setFilteredItems(response.results);
      setContent(response.results);
    } catch (error) {
      message.error('Error to get feed');
      setLoading(false);
    }

    if (_brand) {
      addFilterFunction('brandName', feedItems =>
        feedItems.filter(feedItem => {
          if (!feedItem.package) return false;
          for (let i = 0; i < feedItem.package.length; i++) {
            if (feedItem.package[i].brands) {
              for (let j = 0; j < feedItem.package[i].brands.length; j++) {
                return (
                  feedItem.package[i].brands[j].brandName === _brand.brandName
                );
              }
            } else {
              return false;
            }
          }
        })
      );
    }
  };

  const getResources = (_brand?: Brand) => {
    fetch(_brand);
    setLoaded(true);
  };

  const getDetailsResources = async () => {
    async function getInfluencers() {
      const response: any = await fetchCreators();
      setInfluencers(response.results);
    }
    async function getCategories() {
      const response: any = await fetchCategories();
      setCategories(response.results);
    }
    async function getBrands() {
      setIsFetchingBrands(true);
      const response: any = await fetchBrands();
      setBrands(response.results);
      setIsFetchingBrands(false);
    }
    setLoading(true);
    await Promise.all([getInfluencers(), getCategories(), getBrands()]);
    setLoading(false);
  };

  const onFinish = async () => {
    const item: FeedItem = feedForm.getFieldsValue(true);
    item.goLiveDate = moment(item.goLiveDate).format();
    item.validity = moment(item.validity).format();

    item.package = item.package?.map(pack => {
      const segment: any = {
        ...pack,
        tags: pack.tags ? pack.tags : [],
      };
      // TODO: FIND THE ROOT CAUSE FOR THIS SELF REFERENCE
      delete segment.package;
      return segment;
    });

    await doRequest(() => saveVideoFeed(item));

    resetForm();
    refreshItem(item);
    setIsEditing(false);
  };

  const onChangeAge = (value: [number, number]) => {
    feedForm.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setAgeRange(value);
  };

  const onEditSegment = (segment: Segment, segmentIndex: number) => {
    setSelectedSegment(segment);
    setSelectedSegmentIndex(segmentIndex);
  };

  const onDeleteSegment = (evt: any, index: number) => {
    evt.stopPropagation();
    const dataSource = [...feedForm.getFieldValue('package')];
    dataSource.splice(index, 1);
    feedForm.setFieldsValue({ package: [...dataSource] });

    setSelectedSegment(undefined);
    setSelectedSegmentIndex(-1);
  };

  const onAddSegment = () => {
    const packages = feedForm.getFieldValue('package');
    const sequence = packages ? packages.length + 1 : 1;
    setSelectedSegment({
      sequence,
      tags: [],
      brands: [],
    });
    setSelectedSegmentIndex(sequence - 1);
  };

  const deleteItem = async (_id: string) => {
    setLoading(true);
    await deleteVideoFeed(_id);
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === _id) {
        const index = i;
        setFilteredItems(prev => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
    setLoading(false);
  };

  const refreshItem = async (record: any) => {
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === record.id) {
        content[i] = record;
        setFilteredItems([...content]);
        break;
      }
    }
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (loaded) {
      if (!_selectedBrand) {
        removeFilterFunction('brandName');
        return;
      }
      addFilterFunction('brandName', feedItems =>
        feedItems.filter(feedItem => {
          if (!feedItem.package) return false;
          for (let i = 0; i < feedItem.package.length; i++) {
            if (feedItem.package[i].brands) {
              for (let j = 0; j < feedItem.package[i].brands.length; j++) {
                return (
                  feedItem.package[i].brands[j].brandName ===
                  _selectedBrand.brandName
                );
              }
            } else {
              return false;
            }
          }
        })
      );
    } else {
      if (_selectedBrand) {
        getResources(_selectedBrand);
      } else {
        getResources();
      }
    }
  };

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterFeed = () => {
    return filteredItems.filter(item =>
      item.title?.toUpperCase().includes(filterText.toUpperCase())
    );
  };

  const onEditItem = (record: any, index: number) => {
    setLastViewedIndex(index);
    setCurrentItem(record);
    setIsEditing(true);
  };

  const onCancel = () => {
    resetForm();
    setIsEditing(false);
    setVideoTab('Video Details');
  };

  const newItem = () => {
    setIsEditing(true);
  };

  const resetForm = () => {
    const template = {
      category: '',
      creator: {
        id: '',
        status: '',
        userName: '',
        creatorId: '',
        firstName: '',
        lastName: '',
      },
      description: '',
      format: '',
      gender: [],
      goLiveDate: '',
      hCreationDate: '',
      hLastUpdate: '',
      id: '',
      language: '',
      package: [],
      shortDescription: '',
      status: '',
      title: '',
      validity: '',
      videoType: [],
      video: {},
      lengthTotal: 0,
      market: '',
      modelRelease: '',
      target: '',
      _id: '',
    };
    setCurrentItem(template);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: ColumnsType<FeedItem> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: '18%',
      render: (value: string, record: FeedItem, index: number) => (
        <Link
          onClick={() => onEditItem(record, index)}
          to={{ pathname: window.location.pathname, state: record }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Segments',
      dataIndex: 'package',
      render: (pack: Array<any> = []) => <AntTag>{pack.length}</AntTag>,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Length',
      dataIndex: 'lengthTotal',
      width: '5%',
      align: 'center',
    },
    {
      title: 'Expiration Date',
      dataIndex: 'validity',
      width: '5%',
      render: (validity: Date) =>
        validity ? new Date(validity).toLocaleDateString() : '-',
      align: 'center',
    },
    {
      title: 'Tags',
      dataIndex: 'package',
      width: '5%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '12%',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record: FeedItem, index: number) => (
        <>
          <Link
            onClick={() => onEditItem(record, index)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const brandsColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'brandName',
      width: '15%',
    },
    {
      title: 'Start time',
      dataIndex: ['position', '0', 'startTime'],
      width: '15%',
    },
    {
      title: 'Duration',
      dataIndex: ['position', '0', 'duration'],
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, __, index) => (
        <>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => {
              const brands: any[] = segmentForm.getFieldValue('brands') || [];
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
                const brands: any[] = segmentForm.getFieldValue('brands') || [];
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

  const tagsColumns: ColumnsType<any> = [
    {
      title: 'Store Name',
      dataIndex: ['brand', 'brandName'],
      width: '15%',
    },
    {
      title: 'Tag Name',
      dataIndex: 'tagName',
      width: '15%',
    },
    {
      title: 'Start time',
      dataIndex: ['position', '0', 'startTime'],
      width: '15%',
    },
    {
      title: 'Duration',
      dataIndex: ['position', '0', 'duration'],
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, __, index) => (
        <>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => {
              const tags: any[] = segmentForm.getFieldValue('tags') || [];
              setSelectedTag(tags[index]);
              setSelectedTagIndex(index);
              setShowTagForm(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
            <Button
              type="link"
              style={{ padding: 0, margin: 6 }}
              onClick={() => {
                const tags: any[] = segmentForm.getFieldValue('tags') || [];
                tags.splice(index, 1);
                segmentForm.setFieldsValue({
                  tags,
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

  const VideoUpdatePage = () => {
    return (
      <>
        <Tabs activeKey={videoTab} onChange={setVideoTab}>
          <Tabs.TabPane forceRender tab="Video Details" key={defaultVideoTab}>
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
                <Form.Item name={['creator', 'id']} label="Creator">
                  <Select
                    placeholder="Please select a creator"
                    onChange={(key: string) =>
                      feedForm.setFieldsValue({
                        creator: influencers.find(
                          influencer => influencer.id === key
                        ),
                      })
                    }
                  >
                    {influencers.map((influencer: any) => (
                      <Select.Option key={influencer.id} value={influencer.id}>
                        {influencer.firstName} {influencer.lastName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="hashtags" label="Hashtags">
                  <ReactTagInput
                    tags={hashtags}
                    placeholder="Type and press enter"
                    removeOnBackspace={true}
                    editable={true}
                    onChange={newTags => setHashtags(newTags)}
                  />
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
                    <Select.Option value="Brand">Store</Select.Option>
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
                    marks={{ 12: '12', 100: '100' }}
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
                      <DatePicker
                        defaultValue={moment(
                          feedForm.getFieldValue('goLiveDate')
                        )}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="validity"
                      label="Expiration Date"
                      getValueProps={formatMoment}
                    >
                      <DatePicker
                        defaultValue={moment(
                          feedForm.getFieldValue('validity')
                        )}
                        format="DD/MM/YYYY"
                      />
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
                const segments: Segment[] = getFieldValue('package') || [];
                return (
                  <div
                    style={{
                      display: 'flex',
                    }}
                  >
                    {segments.map((segment, segmentIndex) => (
                      <div
                        key={segment.sequence}
                        className={`segment-thumbnail ${
                          (selectedSegmentIndex === segmentIndex &&
                            'selected') ||
                          ''
                        }`}
                        onClick={() => onEditSegment(segment, segmentIndex)}
                      >
                        {segment?.thumbnail?.url
                          ? [
                              <img
                                alt={segment.thumbnail || 'Thumbnail'}
                                src={segment.thumbnail?.url}
                                key={segment.thumbnail?.url}
                                style={{
                                  height: '256px',
                                  width: 'auto',
                                }}
                              />,
                              <Button
                                icon={<DeleteOutlined />}
                                shape="circle"
                                danger
                                type="primary"
                                className="remove-button"
                                key={`botao_${segment.thumbnail?.url}`}
                                onClick={evt =>
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
                                onClick={evt =>
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
              style={{ margin: '8px 0px 80px 8px' }}
              onClick={onAddSegment}
            >
              Add Segment
            </Button>
          </Tabs.TabPane>
        </Tabs>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => onCancel()}>
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

  const SegmentPage = () => {
    return (
      <>
        {showBrandForm && (
          <BrandForm
            setShowBrandForm={setShowBrandForm}
            brand={selectedBrand}
            brands={brands}
          />
        )}
        {showTagForm && (
          <TagForm
            setShowTagForm={setShowTagForm}
            tag={selectedTag}
            brands={brands}
          />
        )}
        <Form
          form={segmentForm}
          name="segmentForm"
          layout="vertical"
          initialValues={selectedSegment}
        >
          {!showBrandForm && !showTagForm && (
            <>
              <Tabs activeKey={segmentTab} onChange={setSegmentTab}>
                <Tabs.TabPane forceRender tab="Images" key={defaultSegmentTab}>
                  <Col lg={6} xs={24}>
                    <Col lg={24} xs={24}>
                      <Form.Item label="Video">
                        <Upload.VideoUpload
                          fileList={selectedSegment!.video}
                          formProp={'video'}
                          form={segmentForm}
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={24} xs={24}>
                      <Form.Item label="Thumbnail URL">
                        <Upload.ImageUpload
                          fileList={selectedSegment!.thumbnail}
                          formProp={'thumbnail'}
                          form={segmentForm}
                        />
                      </Form.Item>
                    </Col>
                  </Col>
                </Tabs.TabPane>
                <Tabs.TabPane
                  forceRender
                  tab={`Master Brands (${
                    selectedSegment!.brands?.length || 0
                  })`}
                  key="MasterBrands"
                >
                  <Button
                    type="default"
                    style={{ float: 'right', marginBottom: '12px' }}
                    onClick={() => {
                      setSelectedBrand(undefined);
                      setSelectedBrandIndex(-1);
                      setShowBrandForm(true);
                    }}
                  >
                    New Master Brand
                  </Button>
                  <Table
                    rowKey="id"
                    columns={brandsColumns}
                    dataSource={selectedSegment!.brands}
                    loading={loading}
                    pagination={false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  forceRender
                  tab={`Tags (${selectedSegment!.tags?.length || 0})`}
                  key="Tags"
                >
                  <Button
                    type="default"
                    style={{ float: 'right', marginBottom: '12px' }}
                    onClick={() => {
                      setSelectedTag(undefined);
                      setSelectedTagIndex(-1);
                      setShowTagForm(true);
                    }}
                  >
                    New Tag
                  </Button>
                  <Table
                    rowKey="id"
                    columns={tagsColumns}
                    dataSource={selectedSegment!.tags}
                    loading={loading}
                    pagination={false}
                  />
                </Tabs.TabPane>
              </Tabs>
              <Row gutter={8} style={{ marginTop: '20px' }}>
                <Col>
                  <Button
                    type="default"
                    onClick={() => {
                      setSelectedSegment(undefined);
                      setSegmentTab(defaultSegmentTab);
                    }}
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
    <>
      {!isEditing && (
        <div className="video-feed">
          <PageHeader
            title="Video feed update"
            subTitle="List of Feeds"
            extra={[
              <Button key="2" onClick={newItem}>
                New Item
              </Button>,
            ]}
          />
          <div style={{ marginBottom: '16px' }}>
            <Row align="bottom" justify="space-between">
              <Col lg={16} xs={24}>
                <Row gutter={8}>
                  <Col lg={8} xs={16}>
                    <Typography.Title level={5} title="Search">
                      Search
                    </Typography.Title>
                    <Input
                      onChange={onChangeFilter}
                      suffix={<SearchOutlined />}
                    />
                  </Col>
                  <Col lg={8} xs={16}>
                    <Typography.Title level={5}>Master Brand</Typography.Title>
                    <SimpleSelect
                      data={brands}
                      onChange={(_, brand) => onChangeBrand(brand)}
                      style={{ width: '100%' }}
                      selectedOption={''}
                      optionsMapping={optionsMapping}
                      placeholder={'Select a master brand'}
                      loading={isFetchingBrands}
                      disabled={isFetchingBrands}
                      allowClear={true}
                    ></SimpleSelect>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={() => getResources()}
                  loading={loading}
                  style={{
                    marginRight: '25px',
                  }}
                >
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
              </Col>
            </Row>
          </div>
          <Content>
            <Table
              rowClassName={(_, index) =>
                `scrollable-row-${index} ${
                  index === lastViewedIndex ? 'selected-row' : ''
                }`
              }
              size="small"
              columns={columns}
              rowKey="id"
              dataSource={filterFeed()}
              loading={loading}
              pagination={{ current: currentPage, onChange: onPageChange }}
            />
          </Content>
        </div>
      )}
      {isEditing && (
        <div className="video-feed-detail">
          <PageHeader title={pageTitle} subTitle="Video Update" />
          <Form.Provider
            onFormFinish={(name, { values, forms }) => {
              const { feedForm, segmentForm } = forms;
              if (name === 'segmentForm') {
                const segments: any[] = feedForm.getFieldValue('package') || [];
                if (selectedSegmentIndex > -1) {
                  segments[selectedSegmentIndex] =
                    segmentForm.getFieldsValue(true);
                  feedForm.setFieldsValue({ package: [...segments] });
                } else {
                  feedForm.setFieldsValue({
                    package: [...segments, segmentForm.getFieldsValue(true)],
                  });
                }
                setSelectedSegment(undefined);
                setSelectedSegmentIndex(-1);
              }
              if (name === 'brandForm') {
                const { segmentForm, brandForm } = forms;
                const brands: any[] = segmentForm.getFieldValue('brands') || [];
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
              if (name === 'tagForm') {
                const { segmentForm, tagForm } = forms;
                const tags: any[] = segmentForm.getFieldValue('tags') || [];
                const newValue = tagForm.getFieldsValue(true);
                if (selectedTagIndex > -1) {
                  tags[selectedTagIndex] = newValue;
                  segmentForm.setFieldsValue({ tags: [...tags] });
                } else {
                  segmentForm.setFieldsValue({
                    tags: [...tags, newValue],
                  });
                }
                setSelectedTag(undefined);
                setSelectedTagIndex(-1);
                setShowTagForm(false);
                setSelectedSegment(segmentForm.getFieldsValue(true));
              }
            }}
          >
            {selectedSegment && <SegmentPage />}
            <Form
              form={feedForm}
              onFinish={onFinish}
              name="feedForm"
              onFinishFailed={({ errorFields }) => {
                errorFields.forEach(errorField => {
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
      )}
    </>
  );
};

export default withRouter(VideoFeed);
