import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
  Tabs,
  Tooltip,
  message,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { fetchCustomLinkList, fetchTags } from 'services/DiscoClubService';
import { DebounceSelect } from 'components/select/DebounceSelect';
import { Upload } from 'components';
import { DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { Brand } from 'interfaces/Brand';
import { SelectOption } from 'interfaces/SelectOption';
import { AppContext } from 'contexts/AppContext';
import { useSelector } from 'react-redux';

const tagOptionMapping: SelectOption = {
  label: 'tagName',
  value: 'tagName',
  key: 'id',
};

interface StudioModalProps {
  link?: any;
  editing: any;
  brands: Brand[];
  showModal: boolean;
  currentList?: any;
  setShowModal: (value: boolean) => void;
  setList: (value: any) => void;
  studio?: boolean;
}

const StudioModal: React.FC<StudioModalProps> = ({
  link,
  editing,
  brands,
  showModal,
  currentList,
  setShowModal,
  setList,
  studio,
}) => {
  const {
    settings: { videoLabel = [] },
  } = useSelector((state: any) => state.settings);
  const { isMobile } = useContext(AppContext);
  const [customForm] = Form.useForm();
  const [tagForm] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState('Details');
  const [tags, setTags] = useState<any[]>([]);
  const [productTags, setProductTags] = useState<any[]>(
    link?.feed?.package[0]?.products ?? []
  );
  const [tagDetails, setTagDetails] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string | undefined>();
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>();
  const [selectedLink, setSelectedLink] = useState<any>(link);
  const [links, setLinks] = useState<any>(currentList?.links);
  const video = selectedLink?.feed?.package[0]?.videoUrl;

  useEffect(() => {
    if (selectedLink) {
      setActiveTabKey('Details');
      customForm.setFieldsValue({ id: selectedLink.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLink]);

  useEffect(() => {
    if (activeTabKey === 'Details' && video) {
      updateForm.then(() => updateVideoThumbnail(video));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabKey]);

  const updateForm = new Promise(function (resolve, reject) {
    try {
      resolve(customForm.resetFields());
    } catch {
      reject(
        message.warning(
          'Warning: something went wrong. Please try selecting again.'
        )
      );
    }
  });

  const updateVideoThumbnail = async (src: string) => {
    const videoElement = document.getElementsByClassName(
      'ant-upload-list-item-info'
    )[0];
    if (videoElement) {
      videoElement.classList.add('d-flex', 'justify-center', 'align-center');
      videoElement.innerHTML = `<video style="max-width: 100%; max-height: 100%;" src=${src}></video>`;
    }
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const handleCancel = () => {
    if (editing.current) editing.current = false;
    setShowModal(false);
  };

  const tagColumns: ColumnsType<any> = [
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Tag Name">Tag Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'tagName',
      width: '15%',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Thumbnail">Thumbnail</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['product', 'thumbnailUrl', 'url'],
      width: '10%',
      render: (value: string) => {
        if (value) return <Image height={60} src={value} />;
        else return 'No thumbnail';
      },
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Product Name">Product Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['product', 'name'],
      render: (value: string) => {
        if (value) return value;
        else return 'No linked Product';
      },
      width: '15%',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, __, index) => (
        <>
          <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
            <Button
              type="link"
              style={{ padding: 0, margin: 6 }}
              onClick={() =>
                setProductTags(prev => [
                  ...prev.slice(0, index),
                  ...prev.slice(index + 1),
                ])
              }
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const getTags = async (input?: string, loadNextPage?: boolean) => {
    setUserInput(input);
    const pageToUse = !!!loadNextPage ? 0 : optionsPage;
    const response: any = await fetchTags({
      page: pageToUse,
      query: input,
      brandId: selectedBrandId,
      limit: 30,
    });
    setOptionsPage(pageToUse + 1);

    if (pageToUse === 0) setTags(response.results);
    else setTags(prev => [...prev.concat(response.results)]);

    return response.results;
  };

  const onChangeTag = (value?: string, _selectedTag?: any) => {
    if (_selectedTag) {
      setUserInput(value);
    } else {
      setUserInput('');
      setTags([]);
      getTags();
    }
  };

  const handleBrandFilter = async (value: any) => {
    setSelectedBrandId(value);
    if (value) {
      const selectedBrand = brands.find(brand => brand.id === value);
      tagForm.setFieldsValue({ brand: selectedBrand });
    }
    tagForm.setFieldsValue({ tagName: '' });
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const onFinishTagForm = () => {
    const newTag = tagForm.getFieldsValue(true);
    setProductTags([...productTags, newTag]);
    setTagDetails(false);
  };

  const _onOk = () => {
    const item = customForm.getFieldsValue(true);
    if (!item?.feed?.shortDescription) {
      message.warning('Error: Description is required.');
      setActiveTabKey('Details');
      return;
    }
    if (!item?.video?.url && !item?.feed?.package?.[0]?.videoUrl) {
      message.warning('Error: Video is required.');
      setActiveTabKey('Details');
      return;
    }
    if (!item?.thumbnail?.url && !item?.feed?.package?.[0]?.thumbnailUrl) {
      message.warning('Error: Thumbnail is required.');
      setActiveTabKey('Details');
      return;
    }

    if (item) {
      item.index = item.index ?? 2;
      item.hIndex = item.hIndex ?? 889;
      item.vIndex = item.vIndex ?? 1000;
      item.videoFeedId = item.videoFeedId ?? null;
      item.socialPlatform = item.socialPlatform ?? 'Disco Club';
      item.includeVideo = item.includeVideo ?? true;
      item.feed = {
        title: item.feed?.title ?? null,
        videoLabel: item?.feed?.videoLabel,
        shortDescription: item?.feed?.shortDescription,
        creator: item.feed?.creator ?? null,
        package: [
          {
            products: productTags,
            videoUrl: item?.video?.url ?? item?.feed?.package[0]?.videoUrl,
            thumbnailUrl:
              item?.thumbnail?.url ?? item?.feed?.package[0]?.thumbnailUrl,
          },
        ],
        searchTags: item.searchTags ?? null,
        category: item.category ?? null,
        videoType: item.videoType ?? ['Custom'],
      };

      const index = link ? links?.indexOf(link) : links?.length;

      const newLinks = links?.length
        ? [...links?.slice(0, index), item, ...links?.slice(index + 1)]
        : [item];

      setLinks(newLinks);
      setList(prev => ({
        ...prev,
        links: newLinks,
        name: currentList?.name,
      }));
      setShowModal(false);
    } else message.warning("Can't add an empty item!");
  };

  return (
    <Modal
      title={editing.current ? 'Edit Link' : 'New Link'}
      visible={showModal}
      onOk={_onOk}
      onCancel={handleCancel}
      okText="Save"
      cancelText="Cancel"
    >
      <Tabs
        defaultActiveKey="Details"
        activeKey={activeTabKey}
        onChange={handleTabChange}
      >
        <Tabs.TabPane forceRender tab="Details" key="Details">
          <Form
            form={customForm}
            name="customForm"
            layout="vertical"
            initialValues={selectedLink}
          >
            <Row>
              <Col
                xs={24}
                lg={12}
                style={isMobile ? {} : { paddingRight: '0.5rem' }}
              >
                <Form.Item
                  label="Label"
                  name={['feed', 'videoLabel']}
                  shouldUpdate
                >
                  <Select
                    placeholder="Select a Label"
                    allowClear
                    showSearch
                    filterOption={filterOption}
                  >
                    {videoLabel.map(linkType => (
                      <Select.Option
                        key={linkType.value}
                        value={linkType.value}
                        label={linkType.name}
                      >
                        {linkType.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col
                xs={24}
                lg={12}
                style={isMobile ? {} : { paddingLeft: '0.5rem' }}
              >
                <Form.Item
                  label="Short Description"
                  name={['feed', 'shortDescription']}
                  required
                  shouldUpdate
                >
                  <Input placeholder="Enter a Short Description" />
                </Form.Item>
              </Col>
              {!editing.current && (
                <>
                  <Col span={12}>
                    <Form.Item label="Video" name="video" required shouldUpdate>
                      <Upload.VideoUpload
                        maxCount={1}
                        fileList={
                          video
                            ? {
                                url: video,
                                oldUrl: video,
                                originUrl: video,
                              }
                            : undefined
                        }
                        formProp="video"
                        form={customForm}
                        onImageChange={() =>
                          updateVideoThumbnail(
                            customForm.getFieldValue('video').url
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Thumbnail URL"
                      name="thumbnail"
                      required
                      shouldUpdate
                    >
                      <Upload.ImageUpload
                        maxCount={1}
                        type="thumbnail"
                        fileList={
                          selectedLink?.feed?.package[0]?.thumbnailUrl
                            ? {
                                url: selectedLink?.feed?.package[0]
                                  ?.thumbnailUrl,
                                oldUrl:
                                  selectedLink?.feed?.package[0]?.thumbnailUrl,
                                originUrl:
                                  selectedLink?.feed?.package[0]?.thumbnailUrl,
                              }
                            : undefined
                        }
                        formProp="thumbnail"
                        form={customForm}
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane forceRender tab="Search" key="Search">
          <h3 className="mb-05">Search Links</h3>
          <DebounceSelect
            fetcherFunction={(value: string) => fetchCustomLinkList(value)}
            style={{ width: '100%' }}
            disabled={editing.current}
            placeholder="Type to search existing Link"
            onChange={(_, entity) => setSelectedLink(entity)}
            optionMapping={{
              key: 'id',
              value: 'id',
              label: 'id',
            }}
          />
        </Tabs.TabPane>
        {studio && (
          <Tabs.TabPane forceRender tab="Product Tags" key="Product Tags">
            {activeTabKey === 'Product Tags' && !tagDetails && (
              <>
                <Button
                  type="default"
                  style={{ float: 'right', marginBottom: '12px' }}
                  onClick={() => {
                    setTagDetails(true);
                  }}
                >
                  New Tag
                </Button>
                <Table
                  rowKey="id"
                  columns={tagColumns}
                  dataSource={productTags}
                  pagination={false}
                />
              </>
            )}
            {activeTabKey === 'Product Tags' && tagDetails && (
              <>
                <Form
                  name="tagForm"
                  form={tagForm}
                  onFinish={onFinishTagForm}
                  layout="vertical"
                >
                  <Row gutter={8}>
                    <Col lg={12} xs={24}>
                      <Form.Item label="Client" rules={[{ required: true }]}>
                        <Select
                          showSearch
                          allowClear
                          placeholder="Please select a Client"
                          filterOption={filterOption}
                          onChange={v => handleBrandFilter(v)}
                          value={selectedBrandId}
                          disabled={!brands}
                        >
                          {brands.map(brand => (
                            <Select.Option
                              key={brand.id}
                              value={brand.id}
                              label={brand.brandName}
                            >
                              {brand.brandName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col lg={12} xs={24}>
                      <Form.Item
                        name="tagName"
                        label="Tag"
                        rules={[{ required: true }]}
                      >
                        <MultipleFetchDebounceSelect
                          style={{ width: '100%' }}
                          onInput={getTags}
                          onChange={onChangeTag}
                          onClear={onChangeTag}
                          optionMapping={tagOptionMapping}
                          placeholder="Type to search a Tag"
                          disabled={!selectedBrandId || !brands}
                          input={userInput}
                          options={tags}
                        ></MultipleFetchDebounceSelect>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={8} justify="end">
                    <Col>
                      <Button onClick={() => setTagDetails(false)}>
                        Cancel
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" htmlType="submit">
                        Add Tag
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </>
            )}
          </Tabs.TabPane>
        )}
      </Tabs>
    </Modal>
  );
};

export default StudioModal;
