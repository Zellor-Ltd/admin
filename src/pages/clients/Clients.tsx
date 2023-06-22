/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { Creator } from 'interfaces/Creator';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { deleteClient, fetchClients } from 'services/DiscoClubService';
import { useRequest } from 'hooks/useRequest';
import InfiniteScroll from 'react-infinite-scroll-component';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const Clients: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [, setCurrentClient] = useState<Creator>();
  const { doFetch } = useRequest({ setLoading });
  const [clients, setClients] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>();
  const { isMobile, setisScrollable } = useContext(AppContext);
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
    const { results } = await doFetch(() => fetchClients(pageToUse));

    setPage(pageToUse + 1);
    if (results.length < 100) setEof(true);

    if (pageToUse === 0) setClients(results);
    else setClients(prev => [...prev.concat(results)]);
  };

  const handleEdit = (index: number, client?: any) => {
    setLastViewedIndex(index);
    setCurrentClient(client);
    setDetails(true);
    history.push(window.location.pathname);
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
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'userName',
      width: '25%',
      align: 'center',
      /* render: (value, record: Fan, index: number) => (
        <Link to={location.pathname} onClick={() => editFan(index, record)}>
          {value}
        </Link>
      ), */
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
            <Tooltip title="Creation">Creation</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hCreationDate',
      width: '7%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
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
            <Tooltip title="Creation">Sign up</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'signUpDate',
      width: '7%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
      sorter: (a, b): any => {
        if (a.signUpDate && b.signUpDate)
          return (
            moment(a.signUpDate as Date).unix() - moment(b.signUpDate).unix()
          );
        else if (a.signUpDate) return -1;
        else if (b.signUpDate) return 1;
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
            <Tooltip title="E-mail">E-mail</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'user',
      width: '20%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.user && b.user) return a.user.localeCompare(b.user);
        else if (a.user) return -1;
        else if (b.user) return 1;
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
            <Tooltip title="Profile">Profile</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'profile',
      width: '10%',
      render: profile => (
        <Tag color={tagColorByPermission[profile]}>{profile}</Tag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.profile && b.profile) return a.profile.localeCompare(b.profile);
        else if (a.profile) return -1;
        else if (b.profile) return 1;
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
            <Tooltip title="Group">Group</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'group',
      width: '10%',
      render: (_, record) => (
        <Tag color={tagColorByPermission[record.profile]}>{record.group}</Tag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.group && b.group) return a.group.localeCompare(b.group);
        else if (a.group) return -1;
        else if (b.group) return 1;
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
      render: (_, record, index: number) => (
        <>
          {/* 
          <Link to={location.pathname} onClick={() => editFan(index, record)}>
            <EditOutlined />
          </Link> */}
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

  const deleteItem = async (id: string, index: number) => {
    try {
      setLoading(true);
      await deleteClient(id);
      setClients(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div style={style}>
      <div className="creator-container">
        <PageHeader
          title="Clients"
          subTitle={isMobile ? '' : 'List of Clients'}
          extra={[
            <Button
              key="1"
              className={isMobile ? 'mt-05' : ''}
              onClick={() => handleEdit(clients.length)}
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
        <div className="clients custom-table">
          <InfiniteScroll
            height="100%"
            dataLength={clients.length}
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
              dataSource={clients}
              loading={loading}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Clients;
