/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Image,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { Masthead } from '../../interfaces/Masthead';
import { useCallback, useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteMasthead,
  fetchMastheads,
} from '../../services/DiscoClubService';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import CreatorsPageDetail from './CreatorsListDetail';

const CreatorsPage: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentMasthead, setCurrentMasthead] = useState<Masthead>();
  const [mastheads, setMastheads] = useState<Masthead[]>([]);
  const [filter, setFilter] = useState<string>('');
  const { isMobile } = useContext(AppContext);

  const getResources = useCallback(async () => {
    const { results } = await doFetch(fetchMastheads);
    setMastheads(results);
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details, mastheads]);

  const columns: ColumnsType<Masthead> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '15%',
      align: 'center',
      render: (value, record, index: number) => (
        <Link to={location.pathname} onClick={() => editItem(index, record)}>
          {value}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return 1;
        else if (b.description) return -1;
        else return 0;
      },
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: '15%',
      align: 'center',
      render: value => <Image className="active-masthead" src={value?.url} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => editItem(index, record)}>
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

  const search = rows => {
    return rows.filter(
      row => row.description?.toUpperCase().indexOf(filter?.toUpperCase()) > -1
    );
  };

  const editItem = (index: number, masthead?: Masthead) => {
    setLastViewedIndex(index);
    setCurrentMasthead(masthead);
    setDetails(true);
    setLoading(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteMasthead({ id }));
    setMastheads(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    setLoading(true);
  };
  const refreshItem = (record: Masthead) => {
    mastheads[lastViewedIndex] = record;
    setMastheads([...mastheads]);
  };

  const onSaveMasthead = (record: Masthead) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelMasthead = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="Mastheads">
          <PageHeader
            title="Mastheads"
            subTitle={isMobile ? '' : 'List of Mastheads'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editItem(mastheads.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                disabled={loading}
                placeholder="Search by Description"
                suffix={<SearchOutlined />}
                className="mb-1"
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <Table
            scroll={{ x: true }}
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={search(mastheads)}
            loading={loading}
            pagination={false}
          />
        </div>
      )}
      {details && (
        <CreatorsPageDetail
          masthead={currentMasthead}
          onSave={onSaveMasthead}
          onCancel={onCancelMasthead}
        />
      )}
    </>
  );
};

export default CreatorsPage;
