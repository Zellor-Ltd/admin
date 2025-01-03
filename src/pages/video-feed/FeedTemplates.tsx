/* eslint-disable react-hooks/exhaustive-deps */
import { EditOutlined } from '@ant-design/icons';
import {
  Button,
  message,
  PageHeader,
  Table,
  Tag as AntTag,
  Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import {
  Link,
  RouteComponentProps,
  useHistory,
  withRouter,
} from 'react-router-dom';
import {
  fetchBrands,
  fetchProductBrands,
  fetchFeedTemplates,
} from 'services/DiscoClubService';
import { Brand } from 'interfaces/Brand';
import '@pathofdev/react-tag-input/build/index.css';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import moment from 'moment';
import { useRequest } from 'hooks/useRequest';
import VideoFeedDetail from './VideoFeedDetail';

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const FeedTemplates: React.FC<RouteComponentProps> = () => {
  const [selectedFeedTemplate, setselectedFeedTemplate] = useState<FeedItem>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [feedTemplates, setFeedTemplates] = useState<any[]>([]);
  const { doFetch } = useRequest({ setLoading });
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    setIsScrollable(details);
  }, [details]);

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
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyValueToClipboard tooltipText="Copy ID" value={id} />,
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
            <Tooltip title="Title">Title</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'title',
      width: '18%',
      render: (value: string, feedTemplate: FeedItem, index: number) => (
        <Link
          onClick={() => onEditFeedTemplate(index, feedTemplate)}
          to={{ pathname: window.location.pathname, state: feedTemplate }}
        >
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.title && b.title) return a.title.localeCompare(b.title as string);
        else if (a.title) return -1;
        else if (b.title) return 1;
        else return 0;
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
            <Tooltip title="Creation Date">Creation Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hCreationDate',
      width: '10%',
      render: (creation: Date) =>
        creation
          ? new Date(creation).toLocaleDateString('en-GB') +
            ' ' +
            new Date(creation).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.hCreationDate && b.hCreationDate)
          return (
            moment(a.hCreationDate as Date).unix() -
            moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
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
            <Tooltip title="Tags">Tags</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'package',
      width: '5%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.package && b.package)
          return reduceSegmentsTags(a.package) - reduceSegmentsTags(b.package);
        else if (a.package) return -1;
        else if (b.package) return 1;
        else return 0;
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
            <Tooltip title="Status">Status</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'status',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
      sorter: (a, b): any => {
        if (a.status && b.status)
          return a.status.localeCompare(b.status as string);
        else if (a.status) return -1;
        else if (b.status) return 1;
        else return 0;
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, feedTemplate: any, index: number) => (
        <>
          <Link
            onClick={() => onEditFeedTemplate(index, feedTemplate)}
            to={{ pathname: window.location.pathname, state: feedTemplate }}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetch();
    getDetailsResources();
  }, []);

  const fetch = async () => {
    try {
      const { results }: any = await doFetch(() => fetchFeedTemplates());
      setFeedTemplates(results);
      setLoaded(true);
    } catch (error) {
      message.error('Error to get feed templates');
    }
  };

  const getDetailsResources = async () => {
    async function getBrands() {
      const response: any = await fetchBrands();
      setBrands(response.results);
    }
    async function getProductBrands() {
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
    }
    await Promise.all([getBrands(), getProductBrands()]);
  };

  const refreshItem = (record: any) => {
    if (loaded) {
      feedTemplates[lastViewedIndex] = record;
      setFeedTemplates([...feedTemplates]);
    } else {
      setFeedTemplates([record]);
    }
  };

  const onEditFeedTemplate = (index: number, feedTemplate?: any) => {
    setLastViewedIndex(index);
    setselectedFeedTemplate(feedTemplate);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSave = (record: any) => {
    refreshItem(record);
    setDetails(false);
    setselectedFeedTemplate(undefined);
  };

  const handleCancel = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div style={{ overflow: 'clip', height: '100%' }}>
          <PageHeader
            title="Feed Templates"
            subTitle={isMobile ? '' : 'List of Feed Templates'}
            extra={[
              <Button
                key="2"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => onEditFeedTemplate(feedTemplates.length - 1)}
              >
                New Item
              </Button>,
            ]}
          />
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '27em' }}
              className="mt-1"
              rowClassName={(_, index) =>
                `${index === lastViewedIndex ? 'selected-row' : ''}`
              }
              size="small"
              columns={columns}
              rowKey="id"
              dataSource={feedTemplates}
              loading={loading}
            />
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <VideoFeedDetail
            onSave={handleSave}
            onCancel={handleCancel}
            feedItem={selectedFeedTemplate}
            brands={brands}
            productBrands={productBrands}
            template
          />
        </div>
      )}
    </>
  );
};

export default withRouter(FeedTemplates);
