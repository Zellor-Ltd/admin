import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import { Ref, RefObject, useRef, useState } from 'react';
import { fetchCustomLinkList } from 'services/DiscoClubService';
import { DebounceSelect } from 'components/select/DebounceSelect';
import { Upload } from 'components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

interface StudioModalProps {
  link?: any;
  editing: any;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

const StudioModal: React.FC<StudioModalProps> = ({
  link,
  editing,
  showModal,
  setShowModal,
}) => {
  const [, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const [customItemForm] = Form.useForm();
  const [, setQueriedLinks] = useState<any[]>([]);
  const [, setSelectedOption] = useState<any>();
  const [activeTabKey, setActiveTabKey] = useState('Details');
  const [tags, setTags] = useState<any[]>(link?.feed?.package[0]?.tags ?? []);
  const [tagDetails, setTagDetails] = useState<boolean>(false);

  const getOptions = async (query: string) => {
    const response = await doFetch(() => fetchCustomLinkList(query));
    setQueriedLinks(response.results);
    return response.results;
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const handleSaveLink = () => {
    /* 
      const newItem = customItemForm.getFieldsValue(true);
  
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

  const handleCancel = () => {
    if (editing.current) editing.current = false;
    setShowModal(false);
  };

  const handleLinkSelect = (entity: any) => {
    setSelectedOption(entity);
    setActiveTabKey('Details');
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
            <Tooltip title="Thumbnail">Thumbnail</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
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
            <Tooltip title="Product Name">Product Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productName',
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
                console.log('todo: delete');
                /* 
              const tags: any[] = segmentForm.getFieldValue('tags') || [];
              tags.splice(index, 1);
              segmentForm.setFieldsValue({
                tags,
              });
              setSelectedSegment(segmentForm.getFieldsValue(true)); */
              }}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

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
            form={customItemForm}
            name="customItemForm"
            layout="vertical"
            initialValues={link}
          >
            <Row>
              <Col xs={24} lg={12} style={{ paddingRight: '0.5rem' }}>
                <Form.Item label="Label" name={['feed', 'title']} required>
                  <Input placeholder="Enter a Label" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12} style={{ paddingLeft: '0.5rem' }}>
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
                        fileList={undefined}
                        formProp="video"
                        form={customItemForm}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Thumbnail URL" required>
                      <Upload.ImageUpload
                        type="thumbnail"
                        fileList={undefined}
                        formProp="thumbnail"
                        form={customItemForm}
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
            fetchOptions={value => {
              if (value) getOptions(value);
            }}
            style={{ width: '100%' }}
            disabled={editing.current}
            placeholder="Type to search existing Link"
            onChange={(_, entity) => handleLinkSelect(entity)}
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
                  console.log('open edition component with empty tag form'); /* 
                      setSelectedTag(undefined);
                      setSelectedTagIndex(-1);
                      setShowTagForm(true); */
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
          {tagDetails && <></>}
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default StudioModal;
