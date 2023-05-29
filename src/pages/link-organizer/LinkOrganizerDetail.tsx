import { Button, Col, Image, Row, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SortableTable } from 'components';
import { SimpleSwitch } from 'components/SimpleSwitch';
import { useState } from 'react';

interface LinkOrganizerDetailProps {
  record: any;
  onSave: (record: any, setLoading: any, tabName: string) => void;
  onCancel: () => void;
  tabName: string;
}

const LinkOrganizerDetail: React.FC<LinkOrganizerDetailProps> = ({
  record,
  onSave,
  onCancel,
  tabName,
}) => {
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<any[]>(record.links);

  const onSaveData = () => {
    onSave(record, setLoading, tabName);
  };

  const handleSwitchChange = async (record: any, toggled: boolean) => {
    record.deleted = toggled;
    onSave(record, setLoading, tabName);
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
      render: id => (
        <a
          href={'https://beautybuzz.io/' + id.replace('_STR', '')}
          target="blank"
        >
          {id.replace('_STR', '')}
        </a>
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
            <Tooltip title="Thumbnail">Thumbnail</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['feed', 'package'],
      width: '30%',
      render: (value: any[]) => (
        <Image height={40} src={value[0]?.thumbnailUrl} />
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
            <Tooltip title="Creator">Creator</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'feed',
      width: '10%',
      render: (feed: any) => feed?.creator?.firstName,
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
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productBrand',
      width: '20%',
      render: (productBrand: any) => productBrand?.name,
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
            <Tooltip title="Brand">Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brand',
      width: '20%',
      render: (brand: any) => brand?.name,
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['feed', 'shortDescription'],
      width: '30%',
      render: (value?: string) => (
        <>
          {value?.slice(0, 30)}
          {value?.length! > 30 && '...'}
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
            <Tooltip title="Deleted">Deleted</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'deleted',
      width: '10%',
      align: 'center',
      render: (_: any, record: any) => (
        <SimpleSwitch
          toggled={!!record.deleted}
          handleSwitchChange={(toggled: boolean) =>
            handleSwitchChange(record, toggled)
          }
        />
      ),
      sorter: (a, b): any => {
        if (a.deleted && b.deleted) return 0;
        else if (a.deleted) return -1;
        else if (b.deleted) return 1;
        else return 0;
      },
    },
  ];

  return (
    <>
      <Row>
        <Col flex="auto">Reorder links below</Col>
        <Col flex="100px">
          <Button
            disabled={loading}
            loading={loading}
            type="primary"
            className="mb-1"
            onClick={() => onSaveData()}
          >
            Save Changes
          </Button>
        </Col>
        <Col flex="100px">
          <Button type="default" onClick={() => onCancel()}>
            Cancel
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <SortableTable
            scroll={{ x: true, y: '34em' }}
            rowKey="id"
            columns={columns}
            dataSource={links}
            setDataSource={setLinks}
            loading={loading}
          />
        </Col>
      </Row>
    </>
  );
};

export default LinkOrganizerDetail;
