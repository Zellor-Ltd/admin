/* eslint-disable react-hooks/exhaustive-deps */
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { Creator } from 'interfaces/Creator';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteCreator,
  fetchCreators,
  saveCreator,
} from 'services/DiscoClubService';
import CreatorDetail from './CreatorDetail';
import { useRequest } from 'hooks/useRequest';
import { SimpleSwitch } from 'components/SimpleSwitch';
import InfiniteScroll from 'react-infinite-scroll-component';
import scrollIntoView from 'scroll-into-view';

const Creators: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentCreator, setCurrentCreator] = useState<Creator>();
  const { doFetch } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>();
  const { isMobile } = useContext(AppContext);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (!details) {
      scrollToCenter(lastViewedIndex);
    }
  }, [details]);

  const fetch = async (loadNextPage?: boolean) => {
    scrollToCenter(0);
    const pageToUse = loadNextPage ? page : 0;
    const { results } = await doFetch(() =>
      fetchCreators({
        page: pageToUse,
        query: searchFilter,
      })
    );

    setPage(pageToUse + 1);
    if (results.length < 100) setEof(true);

    if (pageToUse === 0) setCreators(results);
    else setCreators(prev => [...prev.concat(results)]);
    setLoaded(true);
  };

  const editCreator = (index: number, creator?: Creator) => {
    setLastViewedIndex(index);
    setCurrentCreator(creator);
    setDetails(true);
  };

  const handleSwitchChange = async (creator: Creator, toggled: boolean) => {
    try {
      creator.displayInCreatorGrid = toggled;
      await saveCreator(creator);
      message.success('Register updated with success.');
    } catch (error) {
      message.error("Error: Couldn't set brand property. Try again.");
    }
  };

  const columns: ColumnsType<Creator> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      width: '15%',
      render: (_, record: Creator, index: number) => (
        <Link to={location.pathname} onClick={() => editCreator(index, record)}>
          {`${record.firstName ?? ''} ${record.lastName ?? ''}`}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.firstName && b.firstName)
          return a.firstName.localeCompare(b.firstName);
        else if (a.firstName) return -1;
        else if (b.firstName) return 1;
        else return 0;
      },
    },
    {
      title: 'Display Name',
      dataIndex: 'userName',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.userName && b.userName)
          return a.userName.localeCompare(b.userName);
        else if (a.userName) return -1;
        else if (b.userName) return 1;
        else return 0;
      },
    },
    {
      title: 'Coupon Code',
      dataIndex: 'couponCode',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.couponCode && b.couponCode)
          return a.couponCode.localeCompare(b.couponCode);
        else if (a.couponCode) return -1;
        else if (b.couponCode) return 1;
        else return 0;
      },
    },
    {
      title: 'Discount %',
      dataIndex: 'discountPercentage',
      width: '5%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.discountPercentage && b.discountPercentage)
          return a.discountPercentage - b.discountPercentage;
        else if (a.discountPercentage) return -1;
        else if (b.discountPercentage) return 1;
        else return 0;
      },
    },
    {
      title: 'Display in Creator Grid',
      dataIndex: 'displayInCreatorGrid',
      width: '15%',
      align: 'center',
      render: (value: any, record: Creator) => (
        <SimpleSwitch
          toggled={!!record.displayInCreatorGrid}
          handleSwitchChange={toggled => handleSwitchChange(record, toggled)}
        />
      ),
      sorter: (a, b): any => {
        if (a.displayInCreatorGrid && b.displayInCreatorGrid) return 0;
        else if (a.displayInCreatorGrid) return -1;
        else if (b.displayInCreatorGrid) return 1;
        else return 0;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.status && b.status) return a.status.localeCompare(b.status);
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
      render: (value, record, index) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: 'green' }}
              onClick={() => approveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: 'red', margin: '6px' }}
              onClick={() => approveOrReject(false, record)}
            />,
          ]}
          <Link
            to={location.pathname}
            onClick={() => editCreator(index, record)}
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

  const approveOrReject = async (aprove: boolean, creator: Creator) => {
    setLoading(true);
    creator.status = aprove ? 'approved' : 'rejected';

    await saveCreator(creator);
    fetch();
  };

  const deleteItem = async (id: string, index: number) => {
    try {
      setLoading(true);
      await deleteCreator(id);
      setCreators(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const refreshItem = (record: Creator) => {
    if (loaded) {
      creators[lastViewedIndex] = record;
      setCreators([...creators]);
    } else {
      setCreators([record]);
    }
  };

  const onSaveCreator = (record: Creator) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelCreator = () => {
    setDetails(false);
  };

  const onRollback = (
    oldUrl: string,
    _sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number
  ) => {
    if (currentCreator) {
      currentCreator[_sourceProp][imageIndex].url = oldUrl;
      setCurrentCreator({ ...currentCreator });
    }
  };

  return (
    <>
      {!details && (
        <div className="creators">
          <PageHeader
            title="Creators"
            subTitle={isMobile ? '' : 'List of Creators'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editCreator(creators.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row
            gutter={8}
            align="bottom"
            justify="space-between"
            className="mb-1 sticky-filter-box"
          >
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                disabled={loading}
                placeholder="Search by First Name"
                suffix={<SearchOutlined />}
                value={searchFilter}
                onChange={event => {
                  setSearchFilter(event.target.value);
                }}
                allowClear
                onPressEnter={() => fetch()}
              />
            </Col>
            <Col lg={8} xs={24}>
              <Row justify="end" className={isMobile ? 'mt-2' : 'mr-06'}>
                <Col>
                  <Button
                    type="primary"
                    onClick={() => fetch()}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={creators.length}
            next={() => fetch(true)}
            hasMore={!eof}
            loader={
              page !== 0 && (
                <div className="scroll-message">
                  <Spin />
                </div>
              )
            }
            endMessage={
              <div className="scroll-message">
                <b>End of results.</b>
              </div>
            }
          >
            <Table
              scroll={{ x: true }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={creators}
              loading={loading}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <CreatorDetail
          creator={currentCreator}
          onSave={onSaveCreator}
          onCancel={onCancelCreator}
          onRollback={onRollback}
        />
      )}
    </>
  );
};

export default Creators;
