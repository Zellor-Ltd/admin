import { Button, Col, Form, Image, Input, Row, Tooltip, message } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { saveCustomLinkList } from 'services/DiscoClubService';
import { SortableTable } from 'components';
import { ColumnsType } from 'antd/lib/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import StudioModal from './StudioModal';
import { Brand } from 'interfaces/Brand';

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
  const [list, setList] = useState<any>(currentList);
  const [link, setLink] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [disableButton, setDisableButton] = useState<boolean>(
    !!!currentList?.name
  );
  const reordered = useRef<boolean>(false);
  const mounted = useRef<boolean>(false);
  const editing = useRef<boolean>(false);
  const deleting = useRef<boolean>(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (reordered.current) reordered.current = false;
    if (deleting.current) return;

    handleSave();
    setCurrentList({ ...currentList, links: list?.links });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list?.links]);

  const onFinish = async () => {
    try {
      handleSave();
    } catch (error) {
      message.error('Something went wrong. Try again later.');
    } finally {
      setShowModal(false);
      setDetails(false);
    }
  };

  const handleSave = async () => {
    const customListForm = form.getFieldsValue(true);
    customListForm.links = list?.links;
    customListForm.tp = 's';
    customListForm.name = customListForm.name.name ?? customListForm.name;
    const response = await doFetch(() => saveCustomLinkList(customListForm));
    customListForm.id
      ? onSave(customListForm)
      : onSave({ ...customListForm, id: response.result });
    message.success('List registered with success.');
  };

  const saveReorderedList = (list?: any[]) => {
    if (!list) return;
    reordered.current = true;
    setList(prev => ({ ...prev, links: list }));
  };

  const handleDelete = async (index: number) => {
    deleting.current = true;
    const updatedLinks = [
      ...list?.links.slice(0, index),
      ...list?.links.slice(index + 1),
    ];
    setList(prev => ({ ...prev, links: updatedLinks }));
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
          <Button
            type="link"
            disabled={disableButton}
            onClick={() => handleEdit(record)}
          >
            <Tooltip title={disableButton ? 'Enter a list name first!' : ''}>
              <EditOutlined />
            </Tooltip>
          </Button>
          <Button
            type="link"
            onClick={() => handleDelete(index)}
            style={{ padding: 0, margin: 6 }}
          >
            <DeleteOutlined />
          </Button>
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
                  <Tooltip
                    title={disableButton ? 'Enter a list name first!' : ''}
                  >
                    New Link
                  </Tooltip>
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <SortableTable
              scroll={{ x: true, y: '34em' }}
              rowKey="id"
              columns={columns}
              dataSource={list?.links}
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
                currentList={currentList}
                setShowModal={setShowModal}
                setList={setList}
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
