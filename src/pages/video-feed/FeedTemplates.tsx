/* eslint-disable react-hooks/exhaustive-deps */
import { EditOutlined } from '@ant-design/icons';
import {
  Button,
  Layout,
  message,
  PageHeader,
  Table,
  Tag as AntTag,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  fetchBrands,
  fetchCreators,
  fetchProductBrands,
  fetchFeedTemplates,
} from 'services/DiscoClubService';
import { Brand } from 'interfaces/Brand';
import '@pathofdev/react-tag-input/build/index.css';
import { Creator } from 'interfaces/Creator';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import moment from 'moment';
import FeedTemplateDetail from './FeedTemplateDetail';
import { useRequest } from 'hooks/useRequest';

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const FeedTemplates: React.FC<RouteComponentProps> = () => {
  const [selectedFeedTemplate, setselectedFeedTemplate] = useState<FeedItem>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [productBrands, setProductBrands] = useState([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [feedTemplates, setFeedTemplates] = useState<any[]>([]);
  const { doFetch } = useRequest({ setLoading });
  const { isMobile } = useContext(AppContext);

  const columns: ColumnsType<any> = [
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
      title: 'Creation Date',
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
      title: 'Tags',
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
      title: 'Status',
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
      title: 'Actions',
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
    async function getcreators() {
      const response: any = await fetchCreators({
        query: '',
      });
      setCreators(response.results);
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      setBrands(response.results);
    }
    async function getProductBrands() {
      setIsFetchingProductBrands(true);
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
      setIsFetchingProductBrands(false);
    }
    await Promise.all([getcreators(), getBrands(), getProductBrands()]);
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
  };

  const onSaveItem = (record: any) => {
    refreshItem(record);
    setDetails(false);
    setselectedFeedTemplate(undefined);
  };

  const onCancelItem = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="video-feed mb-1">
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
          <Content>
            <Table
              scroll={{ x: true }}
              rowClassName={(_, index) =>
                `${index === lastViewedIndex ? 'selected-row' : ''}`
              }
              size="small"
              columns={columns}
              rowKey="id"
              dataSource={feedTemplates}
              loading={loading}
            />
          </Content>
        </div>
      )}
      {details && (
        <FeedTemplateDetail
          onSave={onSaveItem}
          onCancel={onCancelItem}
          feedTemplate={selectedFeedTemplate}
          brands={brands}
          creators={creators}
          productBrands={productBrands}
          isFetchingProductBrand={isFetchingProductBrands}
          setDetails={setDetails}
        />
      )}
    </>
  );
};

export default withRouter(FeedTemplates);
