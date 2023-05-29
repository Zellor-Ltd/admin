import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Tooltip,
  message,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  fetchCustomLinks,
  saveCustomLinkList,
} from 'services/DiscoClubService';
import { DebounceSelect } from 'components/select/DebounceSelect';
import { SortableTable } from 'components';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined } from '@ant-design/icons';
import { Upload } from 'components';

interface CustomDetailsProps {
  customList?: any;
  onSave: any;
}

const CustomDetails: React.FC<CustomDetailsProps> = ({
  customList,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const history = useHistory();
  const [form] = Form.useForm();
  const [customItemForm] = Form.useForm();
  const [itemLinks, setItemLinks] = useState<any[]>(customList?.links ?? []);
  const [, setQueriedLinks] = useState<any[]>([]);
  const [selectedLink, setSelectedLink] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (selectedLink) setItemLinks([...itemLinks, selectedLink]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLink]);

  const fetch = async (query: string) => {
    const response = await doFetch(() => fetchCustomLinks(query));
    setQueriedLinks(response.results);
    return response.results;
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const customListForm = form.getFieldsValue(true);
      customListForm.links = itemLinks;
      const response: any = await saveCustomLinkList(customListForm);
      customListForm.id
        ? onSave(customListForm)
        : onSave({ ...customListForm, id: response.result });
      message.success('List saved with success.');
    } catch (error) {
      message.error('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
      history.goBack();
    }
  };

  const deleteItem = async (index: number) => {
    const updatedLinks = [
      ...itemLinks.slice(0, index),
      ...itemLinks.slice(index + 1),
    ];
    setItemLinks(updatedLinks);
  };

  const handleAddItem = () => {
    const newItem = customItemForm.getFieldsValue(true);

    if (newItem) {
      const pkg = [
        {
          videoUrl: newItem.video?.url,
          thumbnailUrl: newItem.thumbnail?.url,
        },
      ];
      newItem.feed.package = pkg;
      newItem.video = undefined;
      newItem.thumbnail = undefined;

      setItemLinks([...itemLinks, newItem]);
      setShowModal(false);
    } else message.warning("Can't add an empty item!");
  };

  const columns: ColumnsType<any> = [
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => {
        if (id)
          return (
            <a
              href={'https://beautybuzz.io/' + id?.replace('_STR', '')}
              target="blank"
            >
              {id?.replace('_STR', '')}
            </a>
          );
      },
      align: 'center',
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
      dataIndex: ['feed', 'package'],
      width: '10%',
      className: 'p-05',
      render: (value: any[]) => {
        if (value) return <Image height={60} src={value[0]?.thumbnailUrl} />;
      },
      align: 'center',
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
            <Tooltip title="Label">Label</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['feed', 'title'],
      width: '10%',
      align: 'center',
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
            <Tooltip title="Short Description">Short Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['feed', 'shortDescription'],
      width: '30%',
      render: (value?: string) => (
        <>
          <Tooltip title={value}>
            {value?.slice(0, 50)}
            {value?.length! > 50 && '...'}
          </Tooltip>
        </>
      ),
      align: 'center',
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
      render: (_, __, index: number) => (
        <>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const NewCustomItemModal = () => {
    return (
      <Form
        form={customItemForm}
        name="segmentForm"
        layout="vertical"
        initialValues={undefined}
      >
        <Row>
          <Col xs={24} lg={12} style={{ paddingRight: '0.5rem' }}>
            <Form.Item label="Label" name={['feed', 'title']}>
              <Input placeholder="Enter a Label" />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12} style={{ paddingLeft: '0.5rem' }}>
            <Form.Item
              label="Short Description"
              name={['feed', 'shortDescription']}
            >
              <Input placeholder="Enter a Short Description" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Video">
              <Upload.VideoUpload
                fileList={undefined}
                formProp="video"
                form={customItemForm}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thumbnail URL">
              <Upload.ImageUpload
                type="thumbnail"
                fileList={undefined}
                formProp="thumbnail"
                form={customItemForm}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <>
      <Form
        name="roleForm"
        layout="vertical"
        form={form}
        initialValues={customList}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item label="List Name" name="name">
              <Input allowClear placeholder="Enter a name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <h3 className="mb-05">Insert Link</h3>
          </Col>
          <Col span={24}>
            <Row>
              <Col flex="auto">
                <DebounceSelect
                  fetchOptions={value => fetch(value)}
                  style={{ width: '100%' }}
                  placeholder="Type to search existing Link"
                  onChange={(_, entity) => {
                    if (entity) setSelectedLink(entity);
                  }}
                  optionMapping={{
                    key: 'id',
                    value: 'id',
                    label: "'feed']['title'",
                  }}
                />
              </Col>
              <Col flex="100px">
                <Button
                  key="1"
                  type="primary"
                  className="ml-1"
                  onClick={() => setShowModal(true)}
                >
                  Create Link
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <SortableTable
              scroll={{ x: true, y: '34em' }}
              rowKey="id"
              columns={columns}
              dataSource={itemLinks}
              setDataSource={setItemLinks}
              loading={loading}
              className="my-2"
            />
          </Col>
          <Col span={24}>
            <Modal
              title="Create Custom Link"
              visible={showModal}
              onOk={handleAddItem}
              onCancel={() => setShowModal(false)}
              okText="Save"
              cancelText="Cancel"
            >
              <NewCustomItemModal />
            </Modal>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="mb-1"
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CustomDetails;
