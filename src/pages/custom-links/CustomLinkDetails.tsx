import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Tooltip,
  message,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { fetchBrands, saveCustomLinkList } from 'services/DiscoClubService';
import { SortableTable } from 'components';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import CustomLinkModal from './CustomLinkModal';
import { Brand } from 'interfaces/Brand';

interface CustomLinkDetailsProps {
  customList?: any;
  onSave: any;
}

const CustomLinkDetails: React.FC<CustomLinkDetailsProps> = ({
  customList,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const history = useHistory();
  const [form] = Form.useForm();
  const [itemLinks, setItemLinks] = useState<any[]>(customList?.links ?? []);
  const [currentLink, setCurrentLink] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const reordered = useRef<boolean>(false);
  const editing = useRef<boolean>(false);

  useEffect(() => {
    if (reordered.current) {
      onFinish(true);
      reordered.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemLinks]);

  useEffect(() => {
    getBrands();
  }, []);

  const getBrands = async () => {
    const response: any = await doFetch(() => fetchBrands());
    setBrands(response.results);
  };

  const onFinish = async (stayOnPage?: boolean) => {
    try {
      const customListForm = form.getFieldsValue(true);
      customListForm.links = itemLinks;
      customListForm.tp = 's';
      const response = await doFetch(() => saveCustomLinkList(customListForm));
      customListForm.id
        ? onSave(customListForm)
        : onSave({ ...customListForm, id: response.result });
      message.success('List registered with success.');
    } catch (error) {
      message.error('Something went wrong. Try again later.');
    } finally {
      if (!stayOnPage) history.goBack();
    }
  };

  const saveReorderedList = (list: any[]) => {
    reordered.current = true;
    setItemLinks(list);
  };

  const handleDelete = async (index: number) => {
    const updatedLinks = [
      ...itemLinks.slice(0, index),
      ...itemLinks.slice(index + 1),
    ];
    setItemLinks(updatedLinks);
  };

  const handleEdit = (record?: any) => {
    if (record) editing.current = true;
    setCurrentLink(record);
    setShowModal(true);
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
      width: '15%',
      align: 'right',
      render: (_, record: any, index: number) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

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
            <Row justify="end">
              <Col flex="100px">
                <Button
                  key="1"
                  type="primary"
                  className="ml-1"
                  onClick={() => handleEdit()}
                >
                  New Link
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
              setDataSource={saveReorderedList}
              loading={loading}
              className="my-2"
            />
          </Col>
          <Col span={24}>
            <CustomLinkModal
              link={currentLink}
              editing={editing}
              brands={brands}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          </Col>
        </Row>
        <Row gutter={8} justify="end" className="br-buttons bg-white">
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Done
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CustomLinkDetails;
