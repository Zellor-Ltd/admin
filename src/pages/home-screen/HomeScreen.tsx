import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { Banner } from '../../interfaces/Banner';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchBanners, deleteBanner } from 'services/DiscoClubService';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import HomeScreenDetail from './HomeScreenDetail';

const HomeScreen: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [content, setContent] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentBanner, setCurrentBanner] = useState<Banner>();

  const getResources = () => {
    getBanners();
  };

  const getBanners = async () => {
    const response = await doFetch(() => fetchBanners());
    setBanners(response.results);
    setContent(response.results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editBanner = (index: number, banner?: Banner) => {
    setLastViewedIndex(index);
    setCurrentBanner(banner);
    setDetails(true);
  };

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteBanner({ id }));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setBanners(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
      }
    }
  };

  const columns: ColumnsType<Banner> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'id',
      dataIndex: 'id',
      width: '6%',
      render: (value: string, record: Banner, index: number) => (
        <Link to={location.pathname} onClick={() => editBanner(index, record)}>
          {value}
        </Link>
      ),
      align: 'center',
    },
    {
      title: 'HTML',
      dataIndex: 'html',
      width: '20%',
    },
    {
      title: 'Display Start Date',
      dataIndex: 'startDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
    },
    {
      title: 'Display Expire Date',
      dataIndex: 'expireDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: Banner, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editBanner(index, record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
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
      {!details && (
        <div>
          <PageHeader
            title="Banners"
            subTitle="List of Banners"
            extra={[
              <Button key="1" onClick={() => editBanner(1)}>
                New Item
              </Button>,
            ]}
          />
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={banners}
            loading={loading}
          />
        </div>
      )}
      {details && (
        <HomeScreenDetail
          banner={currentBanner as Banner}
          setDetails={setDetails}
        />
      )}{' '}
    </>
  );
};

export default HomeScreen;
