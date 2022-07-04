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
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Upload } from 'components';
import { RichTextEditor } from 'components/RichTextEditor';
import { formatMoment } from 'helpers/formatMoment';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Creator } from 'interfaces/Creator';
import { Segment } from 'interfaces/Segment';
import { Tag } from 'interfaces/Tag';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchCreators,
  fetchLinks,
  saveLink,
  saveVideoFeed,
} from 'services/DiscoClubService';
import BrandForm from './BrandForm';
import TagForm from './TagForm';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';
import moment from 'moment';
import SimpleSelect from 'components/select/SimpleSelect';
import { ProductBrand } from 'interfaces/ProductBrand';
import { SelectOption } from 'interfaces/SelectOption';
import CopyIdToClipboard from 'components/CopyIdToClipboard';

const { Title } = Typography;
interface FeedTemplateDetailProps {
  onSave?: (record: any) => void;
  onCancel?: () => void;
  feedTemplate?: any;
  brands: Brand[];
  creators: Creator[];
  productBrands: ProductBrand[];
  isFetchingProductBrand: boolean;
  setDetails?: (boolean) => void;
}

const prouctBrandMapping: SelectOption = {
  key: 'id',
  label: 'brandName',
  value: 'id',
};

const prouctBrandIconMapping: SelectOption = {
  key: 'value',
  label: 'label',
  value: 'value',
};

const creatorMapping: SelectOption = {
  key: 'id',
  label: 'firstName',
  value: 'id',
};

const FeedTemplateDetail: React.FC<FeedTemplateDetailProps> = ({
  onSave,
  onCancel,
  feedTemplate,
  brands,
  creators,
  productBrands,
  isFetchingProductBrand,
  setDetails,
}) => {
  const {
    settings: { language = [], socialPlatform = [], category = [] },
  } = useSelector((state: any) => state.settings);
  const [templateForm] = Form.useForm();
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
  const [selectedOptions, setSelectedOptions] = useState<
    'productBrand' | 'creator'
  >(feedTemplate?.selectedOption ?? 'productBrand');
  const [productBrandIconOptions, setProductBrandIconOptions] = useState<any[]>(
    []
  );
  const [currentcreator, setCurrentcreator] = useState<Creator>();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const defaultVideoTab = 'Video Details';
  const defaultSegmentTab = 'Images';
  const [videoTab, setVideoTab] = useState<string>('Video Details');
  const [segmentTab, setSegmentTab] = useState<string>('Images');
  const [pageTitle, setPageTitle] = useState<string>('Video Update');
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [includeVideo, setIncludeVideo] = useState<boolean>(false);
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [selectedSocialPlatform, setSelectedSocialPlatform] =
    useState<string>('');
  const [links, setLinks] = useState<any[]>([]);
  const [segment, setSegment] = useState<number>(0);
  const [status, setStatus] = useState<string>(feedTemplate?.status);

  useEffect(() => {
    if (videoTab === 'Links') {
      fetch();
    }
  }, [videoTab]);

  const fetch = async () => {
    const { results } = await doFetch(() =>
      fetchLinks(feedTemplate?.id as string)
    );
    setLinks(results);
  };

  useEffect(() => {
    if (feedTemplate?.selectedOption) {
      if (feedTemplate?.selectedOption === 'creator') {
        setCurrentcreator(
          creators.find(item => item.id === feedTemplate?.selectedId)
        );
      } else {
        loadOptions(
          productBrands.find(item => item.id === feedTemplate?.selectedId)
        );
      }
    }
  }, []);

  useEffect(() => {
    if (feedTemplate?.ageMin && feedTemplate?.ageMax)
      setAgeRange([feedTemplate?.ageMin, feedTemplate?.ageMax]);
  }, [feedTemplate]);

  useEffect(() => {
    if (feedTemplate && feedTemplate.hashtags) {
      setHashtags(feedTemplate.hashtags);
    } else {
      setHashtags([]);
    }
  }, []);

  useEffect(() => {
    if (showBrandForm)
      setPageTitle(
        selectedBrandIndex > -1
          ? `${selectedBrand?.brandName} Update`
          : 'New Segment Master Brand'
      );
    else if (showTagForm)
      setPageTitle(
        selectedTagIndex > -1
          ? `${selectedTag?.tagName} Update`
          : 'New Segment Tag'
      );
    else if (selectedSegment) {
      const packages = templateForm.getFieldValue('package');
      setPageTitle(
        selectedSegmentIndex > -1 &&
          (packages ? packages.length !== selectedSegmentIndex : true)
          ? `Segment ${selectedSegmentIndex + 1} Update`
          : 'New Segment'
      );
    } else
      setPageTitle(
        feedTemplate
          ? feedTemplate.title.length > 50
            ? `${feedTemplate.title.substr(0, 50)} Update`
            : `${feedTemplate.title} Update`
          : 'New Video Feed'
      );
  }, [selectedSegment, showBrandForm, showTagForm]);

  useEffect(() => {
    if (feedTemplate?.ageMin && feedTemplate?.ageMax)
      setAgeRange([feedTemplate?.ageMin, feedTemplate?.ageMax]);
  }, [feedTemplate]);

  const onFinish = async () => {
    const item: any = templateForm.getFieldsValue(true);
    item.goLiveDate = moment(item.goLiveDate).format();
    item.validity = moment(item.validity).format();
    item.status = status;

    item.package = item.package?.map(pack => {
      const segment: any = {
        ...pack,
        tags: pack.tags ? pack.tags : [],
      };
      // TODO: FIND THE ROOT CAUSE FOR THIS SELF REFERENCE
      delete segment.package;
      return segment;
    });

    const response = await doRequest(() => saveVideoFeed(item));
    item.id ? onSave?.(item) : onSave?.({ ...item, id: response.result });
    if (!response.result) setDetails?.(false);
  };

  const onDeleteSegment = (evt: any, index: number) => {
    evt.stopPropagation();
    const dataSource = [...templateForm.getFieldValue('package')];
    dataSource.splice(index, 1);
    templateForm.setFieldsValue({ package: [...dataSource] });

    setSelectedSegment(undefined);
    setSelectedSegmentIndex(-1);
  };

  const onAddSegment = (addWatermark?: boolean, segment?: any) => {
    const packages = templateForm.getFieldValue('package');
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
    templateForm.setFieldsValue({
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
    const feedTemplate = templateForm.getFieldsValue(true);
    templateForm.setFieldsValue({
      creator: null,
    });
    if (feedTemplate.package) {
      const segments = feedTemplate.package.map(segment => {
        if (!segment.selectedOption || segment.selectedOption === 'creator') {
          segment.selectedFeedTitle = creator?.userName;
          segment.selectedIconUrl = creator?.avatar?.url || undefined;
        }

        return segment;
      });
      templateForm.setFieldsValue({
        package: [...segments],
        creator: creator,
      });
    }
    templateForm.setFieldsValue({
      creator: creator,
    });
  };

  const handleSwitchChange = async () => {
    if (selectedOptions !== 'creator') {
      setSelectedOptions('creator');
      templateForm.setFieldsValue({ selectedOption: 'creator' });
      if (feedTemplate?.selectedOption === 'creator') {
        templateForm.setFieldsValue({
          selectedId: feedTemplate?.selectedId,
          selectedFeedTitle: feedTemplate?.selectedFeedTitle,
          selectedIconUrl: feedTemplate?.selectedIconUrl,
        });
      } else {
        templateForm.setFieldsValue({
          selectedIconUrl: undefined,
        });
      }
    } else {
      setSelectedOptions('productBrand');
      templateForm.setFieldsValue({ selectedOption: 'productBrand' });
      if (feedTemplate?.selectedOption === 'productBrand') {
        templateForm.setFieldsValue({
          selectedId: feedTemplate?.selectedId,
          selectedFeedTitle: feedTemplate?.selectedFeedTitle,
          selectedIconUrl: feedTemplate?.selectedIconUrl,
        });
      } else {
        templateForm.setFieldsValue({
          selectedIconUrl: undefined,
        });
      }
    }
  };

  const onChangeProductBrand = (value: string, entity: any) => {
    const productBrand = productBrands.find(item => item.id === entity.value);

    loadOptions(productBrand);

    templateForm.setFieldsValue({
      selectedId: value,
      selectedFeedTitle: productBrand?.brandName,
    });
  };

  const loadOptions = (productBrand?: ProductBrand) => {
    const options: any[] = [];
    if (productBrand?.brandLogo)
      options.push({
        key: 'Round',
        label: 'Round',
        value: productBrand.brandLogo.url,
      });
    if (productBrand?.whiteLogo)
      options.push({
        key: 'White',
        label: 'White',
        value: productBrand.whiteLogo.url,
      });
    if (productBrand?.blackLogo)
      options.push({
        key: 'Black',
        label: 'Black',
        value: productBrand.blackLogo.url,
      });
    if (productBrand?.colourLogo)
      options.push({
        key: 'Colour',
        label: 'Colour',
        value: productBrand.colourLogo.url,
      });

    setProductBrandIconOptions(options);
  };

  const onSearch = (input: any, option: any) => {
    return option.label?.toLowerCase().includes(input.toLowerCase());
  };

  const onChangecreator = (_: string, entity: Creator) => {
    setCurrentcreator(entity);
    templateForm.setFieldsValue({
      selectedId: entity.id,
      selectedFeedTitle: entity.firstName,
      selectedIconUrl: entity.avatar?.url,
    });
  };

  const onChangeIcon = selectedIconUrl => {
    templateForm.setFieldsValue({ selectedIconUrl: selectedIconUrl });
  };

  const handleGenerateLink = async () => {
    const { results }: any = await saveLink({
      videoFeedId: feedTemplate?.id as string,
      creatorId: selectedCreator,
      includeVideo: includeVideo,
      socialPlatform: selectedSocialPlatform,
      segment: segment,
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
          id={'https://link.discoclub.com/' + link?.substring(0, 7)}
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
          href={'https://link.discoclub.com/' + id.substring(0, 7)}
          target="blank"
        >
          {id.substring(0, 7)}
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

  const VideoUpdatePage = () => {
    return (
      <>
        <Tabs activeKey={videoTab} onChange={setVideoTab}>
          <Tabs.TabPane forceRender tab="Video Details" key={defaultVideoTab}>
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Row>
                  <Col lg={4} xs={24}>
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
                  <Col lg={4} xs={24}>
                    <Form.Item
                      name="index"
                      label="Index"
                      className="ml-1"
                      rules={[
                        {
                          required: true,
                          min: 0,
                          type: 'number',
                          message: `Index is required.`,
                        },
                      ]}
                      initialValue={1000}
                    >
                      <InputNumber />
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
              <Col lg={24} xs={24}>
                <Form.Item name={['creator', 'id']} label="Creator">
                  <Select
                    placeholder="Please select a creator"
                    onChange={onCreatorChange}
                  >
                    {creators.map((creator: any) => (
                      <Select.Option key={creator.id} value={creator.id}>
                        {creator.firstName} {creator.lastName}
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
          <Tabs.TabPane forceRender tab="Descriptors" key="descriptors">
            <Row gutter={8}>
              <Col lg={24} xs={24}>
                <Form.Item name="description" label="Long description">
                  <RichTextEditor formField="description" form={templateForm} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name="creatorHtml" label="Creator Descriptor">
                  <RichTextEditor formField="creatorHtml" form={templateForm} />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item name={'searchTags'} label="Search Tags">
                  <Select mode="tags" className="product-search-tags">
                    {templateForm
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
          <Tabs.TabPane forceRender tab="Settings" key="settings">
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
                    defaultValue="English"
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
                    { required: true, message: `Video Type is required.` },
                  ]}
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
          <Tabs.TabPane forceRender tab="Segments" key="segments">
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
                          templateForm.getFieldValue('goLiveDate')
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
                          templateForm.getFieldValue('validity')
                        )}
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
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
          <Tabs.TabPane forceRender tab="Listing" key="listing">
            <Form.Item name="selectedOption" initialValue={selectedOptions}>
              <Radio.Group buttonStyle="solid" onChange={handleSwitchChange}>
                <Radio.Button value="productBrand">Product Brand</Radio.Button>
                <Radio.Button value="creator">Creator</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Col sm={12} lg={6}>
              {selectedOptions === 'productBrand' && (
                <>
                  <Form.Item name="selectedId" label="Product Brand">
                    <Select
                      placeholder="Select a brand"
                      disabled={isFetchingProductBrand}
                      onChange={(value, productBrand) =>
                        onChangeProductBrand(
                          value,
                          productBrand as unknown as ProductBrand
                        )
                      }
                      allowClear={false}
                      showSearch
                      filterOption={onSearch}
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
                  {templateForm.getFieldValue('selectedId') && (
                    <Form.Item
                      name="selectedIconUrl"
                      label="Product Brand Icon"
                    >
                      <Select
                        placeholder="Select an icon"
                        disabled={!productBrandIconOptions}
                        onChange={onChangeIcon}
                        allowClear={false}
                        showSearch
                        filterOption={onSearch}
                      >
                        {productBrandIconOptions.map((icon: any) => (
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
                  {templateForm.getFieldValue('selectedIconUrl') && (
                    <Image
                      src={templateForm.getFieldValue('selectedIconUrl')}
                      style={{ marginBottom: 30 }}
                    ></Image>
                  )}
                </>
              )}
              {selectedOptions === 'creator' && (
                <>
                  <Form.Item
                    name="selectedId"
                    label="Creator"
                    rules={[
                      {
                        required: true,
                        message: `Creator is required.`,
                      },
                    ]}
                  >
                    <SimpleSelect
                      data={creators}
                      onChange={(value, creator) =>
                        onChangecreator(value, creator)
                      }
                      style={{ width: '100%' }}
                      selectedOption={currentcreator?.firstName}
                      optionMapping={creatorMapping}
                      placeholder={'Select a creator'}
                      loading={false}
                      disabled={false}
                      allowClear={true}
                    ></SimpleSelect>
                  </Form.Item>
                  {templateForm.getFieldValue('selectedId') && (
                    <Image
                      src={currentcreator?.avatar?.url}
                      style={{ marginBottom: 30 }}
                    ></Image>
                  )}
                </>
              )}
            </Col>
          </Tabs.TabPane>
        </Tabs>
        <Row gutter={8} className="mt-1">
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
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </>
    );
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
    <div className="video-feed-detail">
      <PageHeader title={pageTitle} />
      <Form.Provider
        onFormFinish={(name, { forms }) => {
          const { templateForm, segmentForm } = forms;
          if (name === 'segmentForm') {
            const segments: any[] = templateForm.getFieldValue('package') || [];
            if (selectedSegmentIndex > -1) {
              segments[selectedSegmentIndex] = segmentForm.getFieldsValue(true);
              templateForm.setFieldsValue({ package: [...segments] });
            } else {
              templateForm.setFieldsValue({
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
          form={templateForm}
          onFinish={onFinish}
          name="templateForm"
          onFinishFailed={({ errorFields }) => {
            errorFields.forEach(errorField => {
              message.error(errorField.errors[0]);
            });
          }}
          layout="vertical"
          className="video-feed"
          initialValues={feedTemplate}
        >
          {!selectedSegment && <VideoUpdatePage />}
        </Form>
      </Form.Provider>
    </div>
  );
};

export default FeedTemplateDetail;
