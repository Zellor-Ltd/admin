/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, PageHeader, Popconfirm, Table, Tooltip } from 'antd';
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
  const { isMobile, setIsDetails } = useContext(AppContext);

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

    setIsDetails(details);
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard value={id} />,
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
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="HTML">HTML</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Display Start Date">Display Start Date</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Display Expire Date">Display Expire Date</Tooltip>
          </div>
        </div>
      ),
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
    <div
      style={
        details ? { height: '100%' } : { overflow: 'clip', height: '100%' }
      }
    >
      {!details && (
        <>
          <PageHeader
            title="Banners"
            subTitle={isMobile ? '' : 'List of Banners'}
            className="mb-05"
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
          <div className="empty custom-table">
            <Table
              scroll={{ x: true, y: '27em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={banners}
              loading={loading}
              pagination={false}
            />
          </div>
        </>
      )}
      {details && (
        <HomeScreenDetail
          banner={currentBanner as Banner}
          onSave={onSaveBanner}
          onCancel={onCancelBanner}
        />
      )}
    </div>
  );
};

export default HomeScreen;
