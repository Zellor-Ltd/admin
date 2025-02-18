/* eslint-disable react-hooks/exhaustive-deps */
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { adminClientId } from 'helpers/constants';
import { Client } from 'interfaces/Client';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import ClientDetail from './ClientDetail';
import scrollIntoView from 'scroll-into-view';
import { useRequest } from 'hooks/useRequest';
import { getClients } from 'services/AdminService';

const Clients: React.FC<RouteComponentProps> = ({ location }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [clients, setClients] = useState<Client[]>([]);
  const allClients = useRef<Client[]>();
  const [clientFilter, setClientFilter] = useState<string>();
  const [currentClient, setCurrentClient] = useState<Client>();
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    if (!allClients.current) return;
    const filteredClients: Client[] = [];
    allClients.current.forEach((client: Client) => {
      if (client.name)
        if (
          client.name.toLowerCase().includes(clientFilter?.toLowerCase() ?? '')
        )
          filteredClients.push(client);
    });
    setClients(filteredClients);
  }, [clientFilter]);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { results }: any = await doFetch(() => getClients());
    setClients(results);
    if (results) allClients.current = results;
  };

  useEffect(() => {
    setIsScrollable(details);

    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editClient = (index: number, client?: Client) => {
    setLastViewedIndex(index);
    setCurrentClient(client);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const refreshItem = (record: Client) => {
    clients[lastViewedIndex] = record;
    setClients([...clients]);
  };

  const onSaveClient = (record: Client) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelClient = () => {
    setDetails(false);
  };

  const loginAs = async (id: string) => {
    window.location.href = `https://portal.zellor.com/auth/admin-signin/${id}`;
  };
  const columns: ColumnsType<Client> = [
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
      render: (_, record: Client) => (
        <CopyValueToClipboard tooltipText="Copy ID" value={record.id} />
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
            <Tooltip title="Client Name">Client Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '15%',
      render: (value: string, record: Client, index: number) => (
        <Link to={location.pathname} onClick={() => editClient(index, record)}>
          {record.id !== adminClientId ? (
            value
          ) : (
            <b style={{ color: 'lightcoral' }}>{value}</b>
          )}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return 1;
        else if (b.name) return -1;
        else return 0;
      },
    } /* 
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
            <Tooltip title="Client Email">Client Email</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'email',
      width: '15%',
      sorter: (a, b) => {
        if (a.email && b.email) return a.email.localeCompare(b.email);
        else if (a.email) return 1;
        else if (b.email) return -1;
        else return 0;
      },
    }, */,
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
            <Tooltip title="Shop URL">Shop URL</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'shopifyShopUrl',
      width: '15%',
      sorter: (a, b) => {
        if (a.shopifyShopUrl && b.shopifyShopUrl)
          return a.shopifyShopUrl.localeCompare(b.shopifyShopUrl);
        else if (a.shopifyShopUrl) return 1;
        else if (b.shopifyShopUrl) return -1;
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
            <Tooltip title="Login as">Login as</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      align: 'center',
      render: (_, record: Client, index: number) => (
        <Button key={`item_${index}`} onClick={() => loginAs(record.id)}>
          Login as
        </Button>
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '15%',
      align: 'right',
      render: (_, record: Client, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editClient(index, record)}
          >
            <EditOutlined />
          </Link>
          {/* {record.id !== adminClientId && (
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
          )} */}
        </>
      ),
    },
  ];

  return (
    <>
      {!details && (
        <div
          style={{
            overflow: 'clip',
            height: '100%',
          }}
        >
          <PageHeader
            title="Clients"
            subTitle={isMobile ? '' : 'List of Clients'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editClient(clients.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="mb-05">
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Name
              </Typography.Title>
              <Input
                allowClear
                disabled={loading}
                onChange={event => setClientFilter(event.target.value)}
                placeholder="Search by Name"
                suffix={<SearchOutlined />}
              />
            </Col>
            {/* 
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Email
              </Typography.Title>
              <Input
                allowClear
                disabled={loading}
                onChange={event => setEmailFilter(event.target.value)}
                placeholder="Search by Email"
                suffix={<SearchOutlined />}
              />
            </Col> */}
          </Row>
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '31em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={clients}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <ClientDetail
            onSave={onSaveClient}
            onCancel={onCancelClient}
            client={currentClient as Client}
          />
        </div>
      )}
    </>
  );
};

export default Clients;
