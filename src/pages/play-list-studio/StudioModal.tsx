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
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import { Ref, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { fetchCustomLinkList, fetchTags } from 'services/DiscoClubService';
import { DebounceSelect } from 'components/select/DebounceSelect';
import { Upload } from 'components';
import { DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { Brand } from 'interfaces/Brand';
import { SelectOption } from 'interfaces/SelectOption';
import { AppContext } from 'contexts/AppContext';

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
  setShowModal: (value: boolean) => void;
}

const StudioModal: React.FC<StudioModalProps> = ({
  link,
  editing,
  brands,
  showModal,
  setShowModal,
}) => {
  const { isMobile } = useContext(AppContext);
  const [customForm] = Form.useForm();
  const [tagForm] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState('Details');
  const [tags, setTags] = useState<any[]>(link?.feed?.package[0]?.tags ?? []);
  const [tagDetails, setTagDetails] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string | undefined>();
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>();
  const [currentLink, setCurrentLink] = useState<any>(link);

  useEffect(() => {
    customForm.resetFields();
    setActiveTabKey('Details');
  }, [currentLink]);

  const handleTabChange = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const handleCancel = () => {
    if (editing.current) editing.current = false;
    setShowModal(false);
  };

  const handleLinkSelect = (entity: any) => {};

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
              onClick={() => {
                const updatedTags = tags.splice(index, 1);
                setTags(updatedTags);
              }}
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
    //update link with new tag array
    setTagDetails(false);
  };

  const handleSaveLink = () => {
    //save list with link updated
    /* 
      const newItem = customForm.getFieldsValue(true);
  
      if (newItem) {
        const pkg = [
          {
            videoUrl: newItem.video?.url,
            thumbnailUrl: newItem.thumbnail?.url,
          },
        ];
  
        const feed = {
          title: null,
          videoLabel: 'selected',
          shortDescription: 'informed by user',
          creator: null,
          package: pkg,
          searchTags: null,
          category: null,
          videoType: ['Custom'],
        };
  
        const configuredItem = {
          index: 2,
          hIndex: 889,
          vIndex: 1000,
          videoFeedId: null,
          socialPlatform: 'Disco Club',
          includeVideo: true,
          feed: feed,
        };
  
        setItemLinks([...itemLinks, configuredItem]);
        setShowModal(false);
      } else message.warning("Can't add an empty item!"); */
    //add link and save table too
  };

  return (
    <Modal
      title={editing.current ? 'Edit Link' : 'New Link'}
      visible={showModal}
      onOk={handleSaveLink}
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
            initialValues={currentLink}
          >
            <Row>
              <Col
                xs={24}
                lg={12}
                style={isMobile ? {} : { paddingRight: '0.5rem' }}
              >
                <Form.Item label="Label" name={['feed', 'videoLabel']} required>
                  <Input placeholder="Enter a Label" />
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
                >
                  <Input placeholder="Enter a Short Description" />
                </Form.Item>
              </Col>
              {!editing.current && (
                <>
                  <Col span={12}>
                    <Form.Item label="Video" required>
                      <Upload.VideoUpload
                        maxCount={1}
                        fileList={
                          currentLink?.feed?.package[0]?.videoUrl
                            ? {
                                url: currentLink?.feed?.package[0]?.videoUrl,
                                oldUrl: currentLink?.feed?.package[0]?.videoUrl,
                                originUrl:
                                  currentLink?.feed?.package[0]?.videoUrl,
                              }
                            : undefined
                        }
                        formProp="video"
                        form={customForm}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Thumbnail URL" required>
                      <Upload.ImageUpload
                        maxCount={1}
                        type="thumbnail"
                        fileList={
                          currentLink?.feed?.package[0]?.thumbnailUrl
                            ? {
                                url: currentLink?.feed?.package[0]
                                  ?.thumbnailUrl,
                                oldUrl:
                                  currentLink?.feed?.package[0]?.thumbnailUrl,
                                originUrl:
                                  currentLink?.feed?.package[0]?.thumbnailUrl,
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
            onChange={(_, entity) => setCurrentLink(entity)}
            optionMapping={{
              key: 'id',
              value: 'id',
              label: 'id',
            }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane forceRender tab="Tags" key="Tags">
          {!tagDetails && (
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
                dataSource={tags}
                pagination={false}
              />
            </>
          )}
          {tagDetails && (
            <>
              <Form
                name="tagForm"
                form={tagForm}
                onFinish={onFinishTagForm}
                initialValues={undefined}
                layout="vertical"
              >
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Form.Item label="Brand" rules={[{ required: true }]}>
                      <Select
                        showSearch
                        allowClear
                        placeholder="Please select a Brand"
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
                    <Button onClick={() => setTagDetails(false)}>Cancel</Button>
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
      </Tabs>
    </Modal>
  );
};

export default StudioModal;
