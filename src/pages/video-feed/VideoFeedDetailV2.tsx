/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Image,
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
  Switch,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Upload } from 'components';
import { RichTextEditor } from 'components/RichTextEditor';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Creator } from 'interfaces/Creator';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import { Tag } from 'interfaces/Tag';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchLinks, saveLink, saveVideoFeed } from 'services/DiscoClubService';
import BrandForm from './BrandForm';
import TagForm from './TagForm';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';
import moment from 'moment';
import { ProductBrand } from 'interfaces/ProductBrand';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import scrollIntoView from 'scroll-into-view';

const { Title } = Typography;

interface DraggableBodyRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const type = 'DraggableBodyRow';
interface VideoFeedDetailProps {
  onSave?: (record: FeedItem) => void;
  onCancel?: () => void;
  feedItem?: FeedItem;
  brands: Brand[];
  creators: Creator[];
  productBrands: ProductBrand[];
  isFetchingProductBrand: boolean;
  setDetails?: (boolean) => void;
  isFanVideo?: boolean;
  template?: boolean;
}

const VideoFeedDetailV2: React.FC<VideoFeedDetailProps> = ({
  onSave,
  onCancel,
  feedItem,
  brands,
  creators,
  productBrands,
  isFetchingProductBrand,
  setDetails,
  isFanVideo,
  template,
}) => {
  const {
    settings: {
      language = [],
      socialPlatform = [],
      category = [],
      linkType = [],
      videoType = [],
    },
  } = useSelector((state: any) => state.settings);
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | undefined>();
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(-1);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [selectedBrandIndex, setSelectedBrandIndex] = useState<number>(-1);
  const [showBrandForm, setShowBrandForm] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [selectedTagIndex, setSelectedTagIndex] = useState<number>(-1);
  const [showTagForm, setShowTagForm] = useState<boolean>(false);
  const [productBrandIcons, setProductBrandIcons] = useState<any[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const defaultVideoTab = 'Video Details';
  const defaultSegmentTab = 'Images';
  const [videoTab, setVideoTab] = useState<string>('Video Details');
  const [segmentTab, setSegmentTab] = useState<string>('Images');
  const [pageTitle, setPageTitle] = useState<string>(
    template ? 'Video Template Update' : 'Video Update'
  );
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [includeVideo, setIncludeVideo] = useState<boolean>(false);
  const [videoCreator, setVideoCreator] = useState<Creator>();
  const [selectedLinkType, setSelectedLinkType] = useState<string>('');
  const [selectedSocialPlatform, setSelectedSocialPlatform] =
    useState<string>('');
  const [links, setLinks] = useState<any[]>([]);
  const [segment, setSegment] = useState<number>(0);
  const [status, setStatus] = useState<string>(feedItem?.status);
  const [selectedOption, setSelectedOption] = useState<
    'productBrand' | 'creator'
  >(feedItem?.selectedOption ?? 'productBrand');
  const [currentCreator, setCurrentCreator] = useState<Creator>();
  const [currentProductBrand, setCurrentProductBrand] =
    useState<ProductBrand>();
  const [currentBrandIcon, setCurrentBrandIcon] = useState<any>();
  const [tagBuffer, setTagBuffer] = useState<any[]>([]);

  useEffect(() => {
    if (videoTab === 'Links') {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTab]);

  const fetch = async () => {
    const { results } = await doFetch(() => fetchLinks(feedItem?.id as string));
    setLinks(results);
  };

  useEffect(() => {
    if (selectedOption === 'creator') {
      setCurrentCreator(
        creators.find(item => item.id === feedItem?.selectedId)
      );
    } else {
      const selectedProductBrand = productBrands.find(
        item => item.id === feedItem?.selectedId
      );
      setCurrentProductBrand(selectedProductBrand);
      loadProductBrandIcons(selectedProductBrand);
      setCurrentBrandIcon(feedItem?.selectedIconUrl);
    }

    if (feedItem?.creator) {
      setVideoCreator(feedItem?.creator);
    }
  }, []);

  useEffect(() => {
    feedForm.setFieldsValue({
      selectedId: currentProductBrand?.id,
      selectedFeedTitle: currentProductBrand?.brandName,
    });
  }, [currentProductBrand]);

  useEffect(() => {
    feedForm.setFieldsValue({ selectedIconUrl: currentBrandIcon });
  }, [currentBrandIcon]);

  useEffect(() => {
    feedForm.setFieldsValue({
      selectedId: currentCreator?.id,
      selectedFeedTitle: currentCreator?.firstName,
      selectedIconUrl: currentCreator?.avatar?.url,
    });
  }, [currentCreator]);

  useEffect(() => {
    feedForm.setFieldsValue({ selectedIconUrl: currentBrandIcon });
  }, [currentBrandIcon]);

  const DraggableBodyRow = ({
    index,
    moveRow,
    className,
    style,
    ...restProps
  }: DraggableBodyRowProps) => {
    const ref = useRef<HTMLTableRowElement>(null);
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: type,
      collect: monitor => {
        const { index: dragIndex } = (monitor.getItem() || {}) as any;
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName:
            dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
        };
      },
      drop: (item: { index: number }) => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      type,
      item: { index },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });
    drop(drag(ref));

    return (
      <tr
        ref={ref}
        className={`${className}${isOver ? dropClassName : ''}`}
        style={{ cursor: 'move', ...style }}
        {...restProps}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = tagBuffer[dragIndex];
      setTagBuffer(
        update(tagBuffer, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
    },
    [tagBuffer]
  );

  useEffect(() => {
    segmentForm.setFieldsValue({ tags: [...tagBuffer] });
  }, [tagBuffer]);

  useEffect(() => {
    if (tagBuffer !== segmentForm.getFieldValue('tags'))
      setTagBuffer(segmentForm.getFieldValue('tags'));
  }, [selectedSegment]);

  const onChangeCreator = (value: string) => {
    const selectedCreator = creators.find(item => item.id === value);
    setCurrentCreator(selectedCreator);
  };

  const onChangeProductBrand = (value: string) => {
    const selectedProductBrand = productBrands.find(item => item.id === value);
    setCurrentProductBrand(selectedProductBrand);
    loadProductBrandIcons(selectedProductBrand);
  };

  const onChangeBrandIcon = (url: string) => {
    setCurrentBrandIcon(url);
  };

  useEffect(() => {
    if (feedItem?.ageMin && feedItem?.ageMax)
      setAgeRange([feedItem?.ageMin, feedItem?.ageMax]);
  }, [feedItem]);

  useEffect(() => {
    if (feedItem && feedItem.searchTags) {
      setSearchTags(feedItem.searchTags);
    } else {
      setSearchTags([]);
    }
  }, []);

  useEffect(() => {
    if (showBrandForm)
      setPageTitle(
        selectedBrandIndex > -1
          ? `${selectedBrand?.brandName ?? ''} Update`
          : 'New Segment Master Brand'
      );
    else if (showTagForm)
      setPageTitle(
        selectedTagIndex > -1
          ? `${selectedTag?.tagName ?? ''} Update`
          : 'New Segment Tag'
      );
    else if (selectedSegment) {
      const packages = feedForm.getFieldValue('package');
      setPageTitle(
        selectedSegmentIndex > -1 &&
          (packages ? packages.length !== selectedSegmentIndex : true)
          ? `Segment ${selectedSegmentIndex + 1 ?? ''} Update`
          : 'New Segment'
      );
    } else
      setPageTitle(
        feedItem
          ? feedItem.title?.length > 50
            ? `${feedItem.title.substr(0, 50) ?? ''} Update`
            : `${feedItem.title ?? ''} Update`
          : template
          ? 'New Video Feed Template'
          : 'New Video Feed'
      );
  }, [selectedSegment, showBrandForm, showTagForm]);

  useEffect(() => {
    if (feedItem?.ageMin && feedItem?.ageMax)
      setAgeRange([feedItem?.ageMin, feedItem?.ageMax]);
  }, [feedItem]);

  const onFinish = async () => {
    try {
      const item: FeedItem = feedForm.getFieldsValue(true);
      item.goLiveDate = moment(item.goLiveDate).format();
      item.validity = moment(item.validity).format();
      item.status = status;
      item.selectedOption = selectedOption;

      item.package = item.package?.map(pack => {
        const segment: any = {
          ...pack,
          tags: pack.tags ?? [],
        };
        // TODO: FIND THE ROOT CAUSE FOR THIS SELF REFERENCE
        delete segment.package;
        return segment;
      });

      const response = await doRequest(() => saveVideoFeed(item));
      item.id ? onSave?.(item) : onSave?.({ ...item, id: response.result });
      if (!response.result) setDetails?.(false);
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    setSelectedSegment(undefined);

    message.error('Error: ' + errorFields[0].errors[0]);

    const id = errorFields[0].name[0];
    const element = document.getElementById(id);

    switch (id) {
      case 'index':
        setVideoTab('Video Details');
        break;
      case 'videoType':
        setVideoTab('Settings');
        break;
      case 'productBrand':
      case 'productBrandIcon':
      case 'creator':
        setVideoTab('Listing');
        break;
      default:
        console.log('Something went wrong.');
    }
    scrollIntoView(element);
  };

  const onDeleteSegment = (evt: any, index: number) => {
    evt.stopPropagation();
    const dataSource = [...feedForm.getFieldValue('package')];
    dataSource.splice(index, 1);
    feedForm.setFieldsValue({ package: [...dataSource] });

    setSelectedSegment(undefined);
    setSelectedSegmentIndex(-1);
  };

  const onAddSegment = (addWatermark?: boolean, segment?: any) => {
    const packages = feedForm.getFieldValue('package');
    const sequence = packages ? packages.length + 1 : 1;
    if (addWatermark) {
      setSelectedSegment({
        sequence,
        tags: [],
        brands: [],
        selectedOption: 'creator',
        watermarkVideo: segment.video,
      } as Segment);

      setSelectedSegmentIndex(sequence - 1);

      return;
    }
    setSelectedSegment({
      sequence,
      tags: [],
      brands: [],
      selectedOption: 'creator',
    });
    setSelectedSegmentIndex(sequence - 1);
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
    segmentForm.setFieldsValue(segment);
  };

  const onCreatorChange = (key: string) => {
    const creator = creators.find(creator => creator.id === key);
    setVideoCreator(creator);
    const feedItem = feedForm.getFieldsValue(true) as FeedItem;
    feedForm.setFieldsValue({
      creator: null,
    });
    if (feedItem.package) {
      const segments = feedItem.package.map(segment => {
        if (!segment.selectedOption || segment.selectedOption === 'creator') {
          segment.selectedFeedTitle = creator?.userName;
          segment.selectedIconUrl = creator?.avatar?.url || undefined;
        }

        return segment;
      });
      feedForm.setFieldsValue({
        package: [...segments],
        creator: creator,
      });
    }
    feedForm.setFieldsValue({
      creator: creator,
    });
  };

  const handleSwitchChange = async () => {
    if (selectedOption === 'productBrand') {
      setSelectedOption('creator');
    } else {
      setSelectedOption('productBrand');
    }
  };

  const onSearch = (input: string, option: any) => {
    return option.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const loadProductBrandIcons = (productBrand?: ProductBrand) => {
    const icons: any[] = [];
    if (productBrand?.brandLogo)
      icons.push({
        key: 'Round',
        label: 'Round',
        value: productBrand.brandLogo.url,
      });
    if (productBrand?.whiteLogo)
      icons.push({
        key: 'White',
        label: 'White',
        value: productBrand.whiteLogo.url,
      });
    if (productBrand?.blackLogo)
      icons.push({
        key: 'Black',
        label: 'Black',
        value: productBrand.blackLogo.url,
      });
    if (productBrand?.colourLogo)
      icons.push({
        key: 'Colour',
        label: 'Colour',
        value: productBrand.colourLogo.url,
      });

    setProductBrandIcons(icons);
  };

  const handleGenerateLink = async () => {
    const { results }: any = await saveLink({
      videoFeedId: feedItem?.id as string,
      creatorId: videoCreator?.id,
      includeVideo: includeVideo,
      socialPlatform: selectedSocialPlatform,
      segment: segment,
      linkType: selectedLinkType,
    });
    setLinks(results);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '20%',
      render: link => (
        <CopyIdToClipboard
          id={'https://link.discoclub.com/' + link?.substring(0, 9)}
        />
      ),
      align: 'center',
    },
    {
      title: 'Link',
      dataIndex: 'id',
      width: '15%',
      render: id => (
        <a
          href={'https://link.discoclub.com/' + id.replace('_STR', '')}
          target="blank"
        >
          {id.replace('_STR', '')}
        </a>
      ),
      align: 'center',
    },
    {
      title: 'Social Platform',
      dataIndex: 'socialPlatform',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Feed ID',
      dataIndex: 'videoFeedId',
      width: '15%',
      align: 'center',
      render: videoFeedId => <CopyIdToClipboard id={videoFeedId} />,
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      width: '15%',
      align: 'center',
    },
    {
      title: 'With Video',
      dataIndex: 'includeVideo',
      width: '15%',
      align: 'center',
      render: value => (value ? 'Yes' : 'No'),
    },
  ];

  const onSelectCreator = (value: string) => {
    const creator = creators.find(item => item.id === value);
    setVideoCreator(creator);
  };

  const VideoUpdatePage = () => {
    return (
      <>
        <Tabs activeKey={videoTab} onChange={setVideoTab}>
          <Tabs.TabPane forceRender tab="Video Details" key={defaultVideoTab}>
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Form.Item label="Status">
                      <Select
                        placeholder="Please select a status"
                        onChange={setStatus}
                        value={status}
                      >
                        <Select.Option key="live" value="live" label="Live">
                          Live
                        </Select.Option>
                        <Select.Option
                          key="paused"
                          value="paused"
                          label="Paused"
                        >
                          Paused
                        </Select.Option>
                        <Select.Option key="draft" value="draft" label="Draft">
                          Draft
                        </Select.Option>
                        <Select.Option
                          key="suspended"
                          value="suspended"
                          label="Suspended"
                        >
                          Suspended
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="index"
                      label="Index"
                      rules={[
                        {
                          required: true,
                          min: 0,
                          type: 'number',
                          message: 'Index is required.',
                        },
                      ]}
                    >
                      <InputNumber id="index" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8} className="mb-1">
                  <Col>
                    <Button
                      type="primary"
                      onClick={
                        status === 'draft'
                          ? () => setStatus('live')
                          : () => setStatus('suspended')
                      }
                    >
                      {status === 'draft' ? 'Approve' : 'Suspend'}
                    </Button>
                  </Col>
                </Row>
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
                  <Select
                    placeholder="Please select a category"
                    disabled={!category.length}
                  >
                    {category.map((category: any) => (
                      <Select.Option key={category.name} value={category.name}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              {!isFanVideo && (
                <Col lg={24} xs={24}>
                  <Form.Item label="Creator">
                    <Select
                      placeholder="Please select a creator"
                      onChange={onCreatorChange}
                      value={videoCreator?.id}
                      disabled={!creators.length}
                      filterOption={onSearch}
                      allowClear
                      showSearch
                    >
                      {creators.map((creator: any) => (
                        <Select.Option
                          key={creator.id}
                          value={creator.id}
                          label={creator.firstName}
                        >
                          {creator.firstName} {creator.lastName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
              {isFanVideo && (
                <>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Creator Name">
                      <Input
                        value={
                          videoCreator?.firstName ?? videoCreator?.userName
                        }
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Creator Email">
                      <Input value={videoCreator?.user} disabled />
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col lg={24} xs={24}>
                <Form.Item name="searchTags" label="Search Tags">
                  <ReactTagInput
                    tags={searchTags}
                    placeholder="Type and press enter"
                    removeOnBackspace={true}
                    editable={true}
                    onChange={newTags => setSearchTags(newTags)}
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
              <Col lg={24} xs={24}>
                <Form.Item name={'searchTags'} label="Search Tags">
                  <Select mode="tags" className="product-search-tags">
                    {feedForm
                      .getFieldValue('searchTags')
                      ?.map((searchTag: any) => (
                        <Select.Option key={searchTag} value={searchTag}>
                          {searchTag}
                        </Select.Option>
                      ))}
                  </Select>
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
                  <Select
                    placeholder="Please select a language"
                    disabled={!language.length}
                  >
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
                  rules={[
                    { required: true, message: 'Video Type is required.' },
                  ]}
                >
                  <Select
                    id="videoType"
                    mode="multiple"
                    placeholder="Please select a Video Type"
                    disabled={!videoType.length}
                  >
                    {videoType.map((type: any) => (
                      <Select.Option
                        key={type.value}
                        value={type.value}
                        label={type.name}
                      >
                        {type.name}
                      </Select.Option>
                    ))}
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
                  <Col lg={12} xs={24}></Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col className="scroll-x">
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
                            <p />
                            <p>
                              <a href={segment.shareLink}>
                                {segment.shareLink}
                              </a>
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </Form.Item>
                <Button
                  htmlType="button"
                  style={{ margin: '8px 0px 80px 8px' }}
                  onClick={() => onAddSegment()}
                >
                  Add Segment
                </Button>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Listing" key="Listing">
            <Form.Item name="selectedOption">
              <Radio.Group buttonStyle="solid" onChange={handleSwitchChange}>
                <Radio.Button value="productBrand">Product Brand</Radio.Button>
                <Radio.Button value="creator">Creator</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Col sm={12} lg={6}>
              {selectedOption === 'productBrand' && (
                <>
                  <Form.Item
                    label="Product Brand"
                    rules={[
                      {
                        required: true,
                        message: 'Product Brand is required.',
                      },
                    ]}
                  >
                    <Select
                      id="productBrand"
                      placeholder="Select a Brand"
                      disabled={isFetchingProductBrand}
                      onChange={onChangeProductBrand}
                      allowClear={false}
                      showSearch
                      filterOption={(input, option) =>
                        !!option?.label
                          ?.toString()
                          ?.toUpperCase()
                          .includes(input?.toUpperCase())
                      }
                      value={currentProductBrand?.id}
                    >
                      {productBrands.map((productBrand: ProductBrand) => (
                        <Select.Option
                          key={productBrand.id}
                          value={productBrand.id}
                          label={productBrand.brandName}
                        >
                          {productBrand.brandName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {productBrandIcons && (
                    <Form.Item
                      label="Product Brand Icon"
                      rules={[
                        {
                          required: true,
                          message: 'Product Brand Icon is required.',
                        },
                      ]}
                    >
                      <Select
                        id="productBrandIcon"
                        placeholder="Select an icon"
                        disabled={!productBrandIcons.length}
                        onChange={onChangeBrandIcon}
                        allowClear={false}
                        showSearch
                        filterOption={(input, option) =>
                          !!option?.label
                            ?.toString()
                            ?.toUpperCase()
                            .includes(input?.toUpperCase())
                        }
                        value={currentBrandIcon}
                      >
                        {productBrandIcons.map((icon: any) => (
                          <Select.Option
                            key={icon.key}
                            value={icon.value}
                            label={icon.label}
                          >
                            {icon.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                  {currentBrandIcon && (
                    <Image src={currentBrandIcon} className="mb-2"></Image>
                  )}
                </>
              )}
              {selectedOption === 'creator' && (
                <>
                  <Form.Item
                    label="Creator"
                    rules={[
                      {
                        required: true,
                        message: 'Creator is required.',
                      },
                    ]}
                  >
                    <Select
                      id="creator"
                      placeholder="Select a Creator"
                      disabled={!creators.length}
                      onChange={onChangeCreator}
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) =>
                        !!option?.label
                          ?.toString()
                          ?.toUpperCase()
                          .includes(input?.toUpperCase())
                      }
                      value={currentCreator?.id}
                    >
                      {creators.map((curr: Creator) => (
                        <Select.Option
                          key={curr.id}
                          value={curr.id}
                          label={curr.firstName}
                        >
                          {curr.firstName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {currentCreator && (
                    <Image
                      src={currentCreator?.avatar?.url}
                      style={{ marginBottom: 30 }}
                    ></Image>
                  )}
                </>
              )}
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Links" key="Links">
            <Row gutter={[32, 32]} align="bottom">
              <Col lg={4} xs={24}>
                <Typography.Title level={5}>Creator</Typography.Title>
                <Select
                  disabled={!creators.length}
                  style={{ width: '100%' }}
                  onSelect={onSelectCreator}
                  value={videoCreator?.id}
                >
                  {creators.map((curr: any) => (
                    <Select.Option
                      key={curr.id}
                      value={curr.id}
                      label={curr.firstName}
                    >
                      {curr.firstName}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col lg={4} xs={24}>
                <Typography.Title level={5}>Social platform</Typography.Title>
                <Select
                  disabled={!socialPlatform.length}
                  style={{ width: '100%' }}
                  onSelect={setSelectedSocialPlatform}
                  value={selectedSocialPlatform}
                >
                  {socialPlatform.map((curr: any) => (
                    <Select.Option key={curr.value} value={curr.value}>
                      {curr.value}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col lg={4} xs={24}>
                <Typography.Title level={5}>Segment</Typography.Title>
                <InputNumber
                  defaultValue={0}
                  title="positive integers"
                  min={0}
                  max={100}
                  onChange={setSegment}
                />
              </Col>
              <Col lg={4} xs={24}>
                <Select
                  disabled={!linkType.length}
                  style={{ width: '100%' }}
                  onSelect={setSelectedLinkType}
                  value={selectedLinkType}
                >
                  {linkType.map((curr: any) => (
                    <Select.Option key={curr.value} value={curr.value}>
                      {curr.value}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col lg={4} xs={24}>
                <Typography.Title level={5}>Include Video</Typography.Title>
                <Checkbox
                  onChange={evt => setIncludeVideo(evt.target.checked)}
                ></Checkbox>
              </Col>
              <Col lg={4} xs={24}>
                <Button
                  type="default"
                  onClick={handleGenerateLink}
                  disabled={!videoCreator || !selectedSocialPlatform}
                >
                  Generate Link
                </Button>
              </Col>
              <Col span={24}>
                <Typography.Title level={5}>Shared Link:</Typography.Title>
                <Table
                  columns={columns}
                  rowKey="id"
                  dataSource={links}
                  loading={loading}
                />
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane forceRender tab="Promo" key="Promo">
            <Row gutter={8}>
              <Col sm={12} lg={6}>
                <Form.Item
                  name="promoEnabled"
                  label="Enabled"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item name="promoMasterBrand" label="Master Brand">
                  <Select onChange={onChangeBrand}>
                    {brands.map(brand => (
                      <Select.Option key={brand.id} value={brand.id}>
                        {brand.brandName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="promoText" label="Headline Text">
                  <Input />
                </Form.Item>

                <Form.Item name="promoCode" label="Coupon Code">
                  <Input />
                </Form.Item>

                <Form.Item name="promoDate" label="Date Range (Text format)">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
        <Row gutter={8} justify="end">
          <Col>
            <Button
              type="default"
              style={{ display: videoTab === 'Links' ? 'none' : '' }}
              onClick={() => onCancel?.()}
            >
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              style={{ display: videoTab === 'Links' ? 'none' : '' }}
              htmlType="submit"
              loading={loading}
              className="mb-1"
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </>
    );
  };

  const onChangeBrand = (key: string) => {
    setSelectedBrand(brands.find(brand => brand.id === key));
  };

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
            setTag={setSelectedTag}
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
                  <Row>
                    <Col lg={4} xs={24}>
                      <Form.Item label="Video">
                        <Upload.VideoUpload
                          fileList={selectedSegment!.video}
                          formProp={'video'}
                          form={segmentForm}
                        />
                      </Form.Item>
                    </Col>
                    <Col lg={4} xs={24}>
                      <Form.Item label="Watermark Video">
                        <Upload.VideoUpload
                          fileList={selectedSegment!.watermarkVideo}
                          formProp={'watermarkVideo'}
                          form={segmentForm}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Thumbnail URL">
                      <Upload.ImageUpload
                        type="thumbnail"
                        fileList={selectedSegment!.thumbnail}
                        formProp={'thumbnail'}
                        form={segmentForm}
                      />
                    </Form.Item>
                  </Col>
                </Tabs.TabPane>
                <Tabs.TabPane
                  forceRender
                  tab={`Master Brands (${
                    selectedSegment!.brands?.length || 0
                  })`}
                  key="Master Brands"
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
                  <DndProvider backend={HTML5Backend}>
                    <Table
                      rowKey="id"
                      columns={tagsColumns}
                      dataSource={tagBuffer}
                      components={components}
                      onRow={(_, index) => {
                        const attr = {
                          index,
                          moveRow,
                        };
                        return attr as React.HTMLAttributes<any>;
                      }}
                      pagination={false}
                    />
                  </DndProvider>
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
    <div className="video-feed-detail">
      <PageHeader title={pageTitle} />
      <Form.Provider
        onFormFinish={(name, { forms }) => {
          const { feedForm, segmentForm } = forms;
          if (name === 'segmentForm') {
            const segments: any[] = feedForm.getFieldValue('package') || [];
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
          onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
          layout="vertical"
          className="video-feed"
          initialValues={{
            ...feedItem,
            language: feedItem?.language ?? 'English',
            index: feedItem?.index ?? 1000,
            selectedOption: feedItem?.selectedOption ?? selectedOption,
            goLiveDate: feedItem?.['goLiveDate']
              ? moment(feedItem?.['goLiveDate'])
              : undefined,
            validity: feedItem?.['validity']
              ? moment(feedItem?.['validity'])
              : undefined,
          }}
        >
          {!selectedSegment && <VideoUpdatePage />}
        </Form>
      </Form.Provider>
    </div>
  );
};

export default VideoFeedDetailV2;
