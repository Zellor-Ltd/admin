/* eslint-disable react-hooks/exhaustive-deps */
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  RedoOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  InputNumber,
  message as msg,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { Creator } from 'interfaces/Creator';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  deleteCreator,
  fetchCreators,
  rebuildLink,
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
  const { isMobile, setisScrollable } = useContext(AppContext);
  const [updatingVIndex, setUpdatingVIndex] = useState<Record<string, boolean>>(
    {}
  );
  const [style, setStyle] = useState<any>();
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    setisScrollable(details);
    if (!details) scrollToCenter(lastViewedIndex);
  }, [details]);

  useEffect(() => {
    if (!details) setStyle({ overflow: 'clip', height: '100%' });
    else setStyle({ overflow: 'scroll', height: '100%' });
  }, [details]);

  const fetch = async (loadNextPage?: boolean) => {
    if (!loadNextPage) scrollToCenter(0);
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
    history.push(window.location.pathname);
  };

  const handleSwitchChange = async (creator: Creator, toggled: boolean) => {
    try {
      creator.displayInCreatorGrid = toggled;
      await saveCreator(creator);
      msg.success('Register updated with success.');
    } catch (error) {
      msg.error("Error: Couldn't set property. Try again.");
    }
  };

  const rebuildVlink = async (creator: Creator, index: number) => {
    try {
      const { result, success, message }: any = await rebuildLink(
        creator.userName!
      );
      if (success) {
        creators[index] = { ...creator, userName: result };
        setCreators([...creators]);
        msg.success(message);
      }
    } catch {}
  };

  const updateVIndex = async (record: Creator, input?: number) => {
    if (record.vIndex === input) return;
    record.vIndex = input;

    setUpdatingVIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[record.id] = true;

      return newValue;
    });

    try {
      await saveCreator(record);
      msg.success('Register updated with success.');
    } catch (err) {
      console.error(`Error while trying to update index.`, err);
    }

    setUpdatingVIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[record.id];
      return newValue;
    });
  };

  const columns: ColumnsType<Creator> = [
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
      width: '3%',
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      width: '13%',
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="vIndex">vIndex</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'vIndex',
      width: '12%',
      render: (_, creator, index) => {
        if (updatingVIndex[creator.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              style={{ minWidth: '60px' }}
              type="number"
              value={creator.vIndex}
              onFocus={event => event.stopPropagation()}
              onBlur={(event: any) =>
                updateVIndex(creator, event.target.value as unknown as number)
              }
              onPressEnter={(event: any) =>
                updateVIndex(creator, event.target.value as unknown as number)
              }
            />
          );
        }
      },
      align: 'center',
      sorter: (a, b): any => {
        if (a.vIndex && b.vIndex) return a.vIndex - b.vIndex;
        else if (a.vIndex) return -1;
        else if (b.vIndex) return 1;
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
            <Tooltip title="Display Name">Display Name</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="InstaLink">InstaLink</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'userName',
      width: '10%',
      align: 'center',
      render: (value: string) => (
        <a
          href={'https://vlink.ie/' + value}
          target="blank"
          style={value ? {} : { pointerEvents: 'none' }}
        >
          {value ? `https://vlink.ie/${value}` : '-'}
        </a>
      ),
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
            <Tooltip title="Rebuild">Rebuild</Tooltip>
          </div>
        </div>
      ),
      width: '5%',
      align: 'center',
      render: (_, record: Creator, index: number) => (
        <>
          <Button
            type="link"
            block
            onClick={() => rebuildVlink(record, index)}
            disabled={!record.userName}
          >
            <RedoOutlined />
          </Button>
        </>
      ),
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
            <Tooltip title="Coupon Code">Coupon Code</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Discount %">Discount %</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Display in Creator Grid">
              Display in Creator Grid
            </Tooltip>
          </div>
        </div>
      ),
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
    <div style={style}>
      {!details && (
        <div className="creator-container">
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
            className="sticky-filter-box mb-15"
          >
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                allowClear
                disabled={loading}
                placeholder="Search by First Name"
                suffix={<SearchOutlined />}
                value={searchFilter}
                onChange={event => {
                  setSearchFilter(event.target.value);
                }}
                onPressEnter={() => fetch()}
              />
            </Col>
            <Col lg={8} xs={24}>
              <Row justify="end" className={isMobile ? 'mt-2' : 'mr-06'}>
                <Col>
                  <Button type="primary" onClick={() => fetch()}>
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="creators custom-table">
            <InfiniteScroll
              height="100%"
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
    </div>
  );
};

export default Creators;
