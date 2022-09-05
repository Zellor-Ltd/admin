/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, PageHeader, Popconfirm, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { Banner } from '../../interfaces/Banner';
import moment from 'moment';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchBanners, deleteBanner } from 'services/DiscoClubService';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import scrollIntoView from 'scroll-into-view';
import HomeScreenDetail from './HomeScreenDetail';

const HomeScreen: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentBanner, setCurrentBanner] = useState<Banner>();
  const { isMobile } = useContext(AppContext);

  const getBanners = async () => {
    const response = await doFetch(() => fetchBanners());
    setBanners(response.results);
  };

  useEffect(() => {
    getBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          // eslint-disable-next-line react-hooks/exhaustive-deps
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details]);

  const editBanner = (index: number, banner?: Banner) => {
    setLastViewedIndex(index);
    setCurrentBanner(banner);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteBanner({ id }));
    setBanners(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const refreshItem = (record: Banner) => {
    banners[lastViewedIndex] = record;
    setBanners([...banners]);
  };

  const onSaveBanner = (record: Banner) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelBanner = () => {
    setDetails(false);
  };

  const columns: ColumnsType<Banner> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard value={id} />,
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
      sorter: (a, b) => {
        if (a.html && b.html) return a.html.localeCompare(b.html);
        else if (a.html) return 1;
        else if (b.html) return -1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.startDate && b.startDate)
          return (
            moment(a.startDate as Date).unix() - moment(b.startDate).unix()
          );
        else if (a.startDate) return -1;
        else if (b.startDate) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.expireDate && b.expireDate)
          return (
            moment(a.expireDate as Date).unix() - moment(b.expireDate).unix()
          );
        else if (a.expireDate) return -1;
        else if (b.expireDate) return 1;
        else return 0;
      },
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
            onConfirm={() => deleteItem(record.id, index)}
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
            subTitle={isMobile ? '' : 'List of Banners'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editBanner(banners.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Table
            scroll={{ x: true }}
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={banners}
            loading={loading}
            pagination={false}
          />
        </div>
      )}
      {details && (
        <HomeScreenDetail
          banner={currentBanner as Banner}
          onSave={onSaveBanner}
          onCancel={onCancelBanner}
        />
      )}
    </>
  );
};

export default HomeScreen;
