import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { DdTemplate } from 'interfaces/DdTemplate';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { deleteDdTemplate, fetchDdTemplates } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import DdTemplateDetail from './DdTemplateDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const DdTemplates: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentDdTemplate, setCurrentDdTemplate] = useState<DdTemplate>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [ddTemplates, setDdTemplates] = useState<DdTemplate[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [content, setContent] = useState<DdTemplate[]>([]);

  useEffect(() => {
    getResources();
  }, []);

  const getResources = async () => {
    await getDdTemplates();
  };

  const getDdTemplates = async () => {
    const { results } = await doFetch(fetchDdTemplates);
    setContent(results);
    setRefreshing(true);
  };

  const updateDisplayedArray = () => {
    if (!content.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = content.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setDdTemplates(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setDdTemplates([]);
      setEof(false);
      updateDisplayedArray();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );

      if (search(ddTemplates).length < 10) setEof(true);
    }
  }, [details, ddTemplates]);

  const editDdTemplate = (index: number, template?: DdTemplate) => {
    setLastViewedIndex(index);
    setCurrentDdTemplate(template);
    setDetails(true);
  };

  const refreshItem = (record: DdTemplate) => {
    ddTemplates[lastViewedIndex] = record;
    setDdTemplates([...ddTemplates]);
  };

  const onSaveDdTemplate = (record: DdTemplate) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelDdTemplate = () => {
    setDetails(false);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteDdTemplate({ id }));
    setDdTemplates(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const columns: ColumnsType<DdTemplate> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Tag Name',
      dataIndex: 'tagName',
      width: '20%',
      render: (value: string, record: DdTemplate, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editDdTemplate(index, record)}
        >
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.tagName && b.tagName) return a.tagName.localeCompare(b.tagName);
        else if (a.tagName) return -1;
        else if (b.tagName) return 1;
        else return 0;
      },
    },
    {
      title: 'Template',
      dataIndex: 'template',
      width: '12%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.template && b.template)
          return a.template.localeCompare(b.template);
        else if (a.template) return -1;
        else if (b.template) return 1;
        else return 0;
      },
    },
    {
      title: 'Disco Gold',
      dataIndex: 'discoGold',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.discoGold && b.discoGold) return a.discoGold - b.discoGold;
        else if (a.discoGold) return -1;
        else if (b.discoGold) return 1;
        else return 0;
      },
    },
    {
      title: 'Disco Dollars',
      dataIndex: 'discoDollars',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.discoDollars && b.discoDollars)
          return a.discoDollars - b.discoDollars;
        else if (a.discoDollars) return -1;
        else if (b.discoDollars) return 1;
        else return 0;
      },
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '15%',
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
            moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: DdTemplate, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editDdTemplate(index, record)}
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

  const search = rows => {
    return rows.filter(row => row.tagName.toUpperCase().indexOf(filter) > -1);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Disco Dollars Templates"
            subTitle="List of Disco Dollars Templates"
            extra={[
              <Button
                key="1"
                onClick={() => editDdTemplate(ddTemplates.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <Typography.Title level={5}>Search by Tag Name</Typography.Title>
              <Input
                className="mb-1"
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={ddTemplates.length}
            next={updateDisplayedArray}
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
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={search(ddTemplates)}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <DdTemplateDetail
          template={currentDdTemplate}
          onSave={onSaveDdTemplate}
          onCancel={onCancelDdTemplate}
        />
      )}
    </>
  );
};

export default DdTemplates;
