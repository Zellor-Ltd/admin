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
import { saveCustomLinkList } from 'services/DiscoClubService';
import { SortableTable } from 'components';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import StudioModal from './StudioModal';
import { Brand } from 'interfaces/Brand';
import scrollIntoView from 'scroll-into-view';

interface StudioDetailsProps {
  setCurrentList: (value: any[]) => void;
  currentList?: any;
  onSave: any;
  setDetails: any;
  brands: Brand[];
}

const StudioDetails: React.FC<StudioDetailsProps> = ({
  setCurrentList,
  currentList,
  onSave,
  setDetails,
  brands,
}) => {
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const history = useHistory();
  const [form] = Form.useForm();
  const [itemLinks, setItemLinks] = useState<any[]>(currentList?.links ?? []);
  const [link, setLink] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [disableButton, setDisableButton] = useState<boolean>(
    !!!currentList?.name
  );
  const reordered = useRef<boolean>(false);
  const editing = useRef<boolean>(false);

  useEffect(() => {
    if (reordered.current) {
      onFinish(false);
      reordered.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemLinks]);

  const onFinish = async (goBack: boolean, name?: string, links?: any[]) => {
    try {
      if (name) form.setFieldsValue({ name: name });
      const customListForm = form.getFieldsValue(true);
      if (!customListForm.name) {
        const nameField = document.getElementById('nameField');
        scrollIntoView(nameField);
        return;
      }
      customListForm.links = links ?? itemLinks;
      customListForm.tp = 's';
      customListForm.name = customListForm.name.name ?? customListForm.name;
      const response = await doFetch(() => saveCustomLinkList(customListForm));
      customListForm.id
        ? onSave(customListForm)
        : onSave({ ...customListForm, id: response.result });
      message.success('List registered with success.');
    } catch (error) {
      message.error('Something went wrong. Try again later.');
    } finally {
      setShowModal(false);
      //check for boolean passed (onFinish also called by form submit)
      if (goBack === true) setDetails(false);
      else {
        if (links) {
          setCurrentList({ ...currentList, links: links });
          setItemLinks(links!);
        }
      }
    }
  };

  const saveReorderedList = (list?: any[]) => {
    if (!list) return;
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
    setLink(record);
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
        else return '-';
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
      dataIndex: ['feed', 'videoLabel'],
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

  const checkName = (_: any, value: string) => {
    if (value?.length > 0) {
      setDisableButton(false);
      return Promise.resolve();
    }
    setDisableButton(true);
    return Promise.reject(new Error('List must include name!'));
  };

  return (
    <>
      <Form
        name="form"
        layout="vertical"
        form={form}
        initialValues={currentList}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item
              label="List Name"
              name="name"
              id="nameField"
              rules={[{ validator: checkName }]}
              required
            >
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
                  disabled={disableButton}
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
            {showModal && (
              <StudioModal
                link={link}
                editing={editing}
                brands={brands}
                showModal={showModal}
                onFinish={onFinish}
                currentList={currentList}
                setShowModal={setShowModal}
              />
            )}
          </Col>
        </Row>
        <Row gutter={8} justify="end" className="br-buttons bg-white">
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Go Back
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" className="ml-1">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default StudioDetails;
