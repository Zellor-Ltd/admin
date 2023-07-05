import { Button, Col, Image, Row, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SortableTable } from 'components';
import { SimpleSwitch } from 'components/SimpleSwitch';
import { useEffect, useState } from 'react';

interface PlaylistDetailProps {
  record: any;
  onSave: (record: any, setLoading: any, tabName: string) => void;
  onCancel: () => void;
  tabName: string;
}

const PlaylistDetails: React.FC<PlaylistDetailProps> = ({
  record,
  onSave,
  onCancel,
  tabName,
}) => {
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<any[]>(record.links);

  useEffect(() => {
    let parameter;
    if (tabName === 'creator')
      parameter = record.creator?.userName.toUpperCase();
    else parameter = record.id.toUpperCase().slice(0, -4);

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://vlink.ie/script/ce/vlink-ce.js';
    document.body.appendChild(script);
    document.getElementById(
      'carousel'
    )!.innerHTML = `<vlink-carousel src=${parameter}></vlink-carousel>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      width: '10%',
      className: 'p-05',
      render: (value: any[]) => (
        <Image height={60} src={value[0]?.thumbnailUrl} />
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
            <Tooltip title="Description">Short Description</Tooltip>
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
        <Col flex="auto">
          <Typography.Title level={5}>Reorder links below</Typography.Title>
        </Col>
        <Col flex="100px">
          <Button type="default" onClick={() => onCancel()}>
            Cancel
          </Button>
        </Col>
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
      </Row>
      <Row>
        <Col span={24}>
          <div id="carousel" className="mt-05"></div>
        </Col>
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

export default PlaylistDetails;
