import { EyeOutlined } from '@ant-design/icons';
import {
  Col,
  Layout,
  message,
  PageHeader,
  Row,
  Table,
  Tag as AntTag,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { SelectBrand } from 'components/SelectBrand';
import useFilter from 'hooks/useFilter';
import { Brand } from 'interfaces/Brand';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { fetchVideoFeed } from 'services/DiscoClubService';

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = ({ location, history }) => {
  const detailsPathname = `${location.pathname}/video-feed`;

  const [loading, setLoading] = useState(false);

  const {
    setArrayList: setVideos,
    filteredArrayList: filteredVideos,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<any>([]);

  const fetch = async () => {
    setLoading(true);
    try {
      const response: any = await fetchVideoFeed();
      setLoading(false);
      setVideos(response.results);
    } catch (error) {
      message.error('Error to get feed');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<FeedItem> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: '18%',
      render: (value: string, record: FeedItem) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
      align: 'center',
    },
    {
      title: 'Segments',
      dataIndex: 'package',
      render: (pack: Array<any> = []) => <AntTag>{pack.length}</AntTag>,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Length',
      dataIndex: 'lengthTotal',
      width: '5%',
      align: 'center',
    },
    {
      title: 'Expiration Date',
      dataIndex: 'validity',
      width: '5%',
      render: (creationDate: Date) =>
        new Date(creationDate).toLocaleDateString(),
      align: 'center',
    },
    {
      title: 'Tags',
      dataIndex: 'package',
      width: '5%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '12%',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record: FeedItem) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EyeOutlined />
          </Link>
        </>
      ),
    },
  ];

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction('brandName');
      return;
    }
    addFilterFunction('brandName', videos => videos.filter(video => true));
  };

  return (
    <div className="video-feed">
      <PageHeader title="Video feed" subTitle="List of Feeds" />
      <Row gutter={8}>
        <Col xxl={40} lg={6} xs={18}>
          <SelectBrand
            style={{ width: '100%' }}
            allowClear={true}
            onChange={onChangeBrand}
          ></SelectBrand>
        </Col>
      </Row>
      <Content>
        <Table
          size="small"
          columns={columns}
          rowKey="id"
          dataSource={filteredVideos}
          loading={loading}
        />
      </Content>
    </div>
  );
};

export default withRouter(VideoFeed);
