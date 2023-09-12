/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  deleteClientUser,
  fetchBrands,
  fetchClientUsers,
  loginAs,
  saveClientUser,
} from 'services/DiscoClubService';
import { useRequest } from 'hooks/useRequest';
import InfiniteScroll from 'react-infinite-scroll-component';
import scrollIntoView from 'scroll-into-view';
import moment from 'moment';
import SimpleSelect from 'components/select/SimpleSelect';
import { Brand } from 'interfaces/Brand';
import ClientUserDetails from './ClientUserDetails';
import { SimpleSwitch } from 'components/SimpleSwitch';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const ClientUsers: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<any>();
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [clientUsers, setClientUsers] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [clientFilter, setclientFilter] = useState<Brand | undefined>();
  const [updatingClient, setUpdatingClient] = useState<Record<string, boolean>>(
    {}
  );
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    const getBrands = async () => {
      setLoading(true);
      const response: any = await fetchBrands();
      setLoading(false);
      setBrands(response.results);
    };
    getBrands();
  }, []);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    setIsScrollable(details);
    if (!details) scrollToCenter(lastViewedIndex);
  }, [details]);

  const fetch = async (loadNextPage?: boolean) => {
    if (!loadNextPage) scrollToCenter(0);
    const pageToUse = loadNextPage ? page : 0;
    const { results } = await doFetch(() =>
      fetchClientUsers(pageToUse, { clientId: clientFilter?.id ?? '' })
    );

    setPage(pageToUse + 1);
    if (results.length < 100) setEof(true);

    if (pageToUse === 0) setClientUsers(results);
    else setClientUsers(prev => [...prev.concat(results)]);
  };

  const updateClient = async (record: Brand, selectedClient: Brand) => {
    if (!selectedClient) return
    if (record.id === selectedClient.id) return;

    try {
      await doRequest(()=>loginAs({userId: record.id, clientId: selectedClient.id}));
      message.success(`Logged in as ${selectedClient}.`);
    } catch (err) {
      console.error(`Error while trying to log in as new client.`, err);
    }

  };

  const handleEdit = (index: number, client?: any) => {
    setLastViewedIndex(index);
    setCurrentRecord(client);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSwitchChange = async (record: any, toggled: boolean) => {
    record.disabled = toggled;
    handleSave(record);
    refreshTable(record);
  };

  const refreshTable = (record: any) => {
    const tableData = clientUsers.map((item: any) => {
      if (item.id === record.id) return record;
      else return item;
    });
    setClientUsers(tableData);
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
            <Tooltip title="Deleted">Deleted</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'disabled',
      width: '10%',
      align: 'center',
      render: (_: any, record: any) => (
        <SimpleSwitch
          toggled={!!record.disabled}
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
      dataIndex: 'firstName',
      width: '25%',
      align: 'center',
      render: (value, record: any, index: number) => (
        <Link to={location.pathname} onClick={() => handleEdit(index, record)}>
          {value} {record.lastName}
        </Link>
      ),
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
            <Tooltip title="Client">Client</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'clientId',
      width: '25%',
      align: 'center',
      render: (_, client) => {
        if (updatingClient[client?.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <div style={{ minWidth: 10 }}>
              <SimpleSelect
            showSearch
            data={brands}
            onChange={(_, brand) => updateClient(client, brand)
            }
            style={{ width: '100%' }}
            selectedOption={clientFilter?.brandName}
            optionMapping={{
              key: 'id',
              label: 'brandName',
              value: 'id',
            }}
            placeholder="Select a Client to log in as"
            disabled={loading}
            allowClear
          ></SimpleSelect>
            </div>
          );
        }
      },
      sorter: (a, b): any => {
        if (a.clientId && b.clientId)
          return a.clientId.localeCompare(b.clientId);
        else if (a.clientId) return -1;
        else if (b.clientId) return 1;
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
          <Link
            to={{ pathname: location.pathname, state: record }}
            onClick={() => handleEdit(index, record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const handleDelete = async (id: string, index: number) => {
    try {
      setLoading(true);
      await deleteClientUser(id);
      setClientUsers(prev => [
        ...prev.slice(0, index),
        ...prev.slice(index + 1),
      ]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleSave = async (record: any) => {
    try {
      await doRequest(() => saveClientUser(record));
      message.success('Register updated with success.');
    } catch (error: any) {
      message.error('Error: ' + error.error);
    } finally {
      if (details) setDetails(false);
    }
  };

  return (
    <>
      {!details && (
        <div
          className="creator-container"
          style={{ overflow: 'clip', height: '100%' }}
        >
          <PageHeader
            title="Client Users"
            subTitle={isMobile ? '' : 'List of Client Users'}
            extra={
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => handleEdit(clientUsers.length)}
              >
                New Item
              </Button>
            }
          />
          <Row
            gutter={8}
            align="bottom"
            justify="space-between"
            className="sticky-filter-box mb-15"
          >
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Client</Typography.Title>
              <SimpleSelect
                showSearch
                data={brands}
                onChange={(_, brand) => setclientFilter(brand)}
                style={{ width: '100%' }}
                selectedOption={clientFilter?.brandName}
                optionMapping={{
                  key: 'id',
                  label: 'brandName',
                  value: 'id',
                }}
                placeholder="Select a Client"
                disabled={loading}
                allowClear
              ></SimpleSelect>
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
          <div className="client-users custom-table">
            <InfiniteScroll
              height="100%"
              dataLength={clientUsers.length}
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
                dataSource={clientUsers}
                loading={loading}
                pagination={false}
              />
            </InfiniteScroll>
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <ClientUserDetails
            brands={brands}
            user={currentRecord}
            clientId={clientFilter?.id}
            onCancel={() => setDetails(false)}
            onSave={handleSave}
          />
        </div>
      )}
    </>
  );
};

export default ClientUsers;
