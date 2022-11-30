import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
  Tooltip,
} from 'antd';
import { Position } from 'interfaces/Position';
import { Tag } from 'interfaces/Tag';
import { useResetFormOnCloseModal } from 'hooks/useResetFormCloseModal';
import { EditableCell, EditableRow } from 'components';
import { DeleteOutlined } from '@ant-design/icons';
import { ColumnTypes } from 'components/editable-context';
import { fetchTags } from 'services/DiscoClubService';

interface ModalFormProps {
  tag: Tag | undefined;
  visible: boolean;
  selectedPositions: Position[];
  onCancel: () => void;
  onDeletePosition: (index: number) => void;
  onSavePosition: (row: Position, index: number) => void;
  onAddPosition: () => void;
}

const ModalTag: React.FC<ModalFormProps> = ({
  tag,
  visible,
  selectedPositions,
  onCancel,
  onDeletePosition,
  onSavePosition,
  onAddPosition,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [tag, form]);

  useEffect(() => {
    let mounted = true;
    async function getTags() {
      const response: any = await fetchTags({});
      if (mounted) {
        setTags(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getTags();
    return () => {
      mounted = false;
    };
  }, []);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = () => {
    form.setFieldsValue({ ...selectedTag });
    form.submit();
  };

  const onChangeTag = (key: string) => {
    setSelectedTag(tags.find(tag => tag.id === key));
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
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
            <Tooltip title="Start Time">Start Time</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'startTime',
      editable: true,
      number: true,
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
            <Tooltip title="Opacity">Opacity</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'opacity',
      editable: true,
      number: true,
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
            <Tooltip title="Position X">Position X</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'x',
      editable: true,
      number: true,
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
            <Tooltip title="Position Y">Position Y</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'y',
      editable: true,
      number: true,
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
            <Tooltip title="Z Index">Z Index</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'z',
      editable: true,
      number: true,
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
      dataIndex: 'actions',
      render: (_: any, record: Position, index: number) =>
        selectedPositions.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => onDeletePosition(index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  const configuredColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Position, index: number) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        number: col.number,
        onSave: (newPosition: Position) => onSavePosition(newPosition, index),
      }),
    };
  });

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <Modal
      title="Tag"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width="80%"
      forceRender
      okButtonProps={{ loading: loading }}
    >
      <Form form={form} name="tagForm" initialValues={tag} layout="vertical">
        <Input.Group>
          <Row gutter={8}>
            <Col lg={8} xs={0}>
              <Form.Item name="tagName" label="Tag">
                <Select
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  placeholder="Tag"
                  onChange={onChangeTag}
                >
                  {tags.map(tag => (
                    <Select.Option key={tag.id} value={tag.id}>
                      {tag.tagName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Input.Group>

        <Button
          type="primary"
          style={{ margin: '8px 0' }}
          onClick={() => onAddPosition()}
        >
          Add Movements
        </Button>
        <Table
          rowKey={(position: Position) =>
            `posotion_${position.x}_${position.z}_${Math.random()}`
          }
          title={() => 'Tag Motion'}
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={selectedPositions}
          columns={configuredColumns as ColumnTypes}
        />
      </Form>
    </Modal>
  );
};

export default ModalTag;
