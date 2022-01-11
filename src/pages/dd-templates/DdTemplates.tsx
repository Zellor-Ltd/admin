import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { DdTemplate } from 'interfaces/DdTemplate';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { deleteDdTemplate, fetchDdTemplates } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import DdTemplateDetail from './DdTemplateDetail';

const DdTemplates: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [content, setContent] = useState<any[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentDdTemplate, setCurrentDdTemplate] = useState<DdTemplate>();

  const {
    setArrayList: setDdTemplates,
    filteredArrayList: filteredDdTemplates,
    addFilterFunction,
  } = useFilter<DdTemplate>([]);

  const getResources = async () => {
    await getDdTemplates();
  };

  const getDdTemplates = async () => {
    const { results } = await doFetch(fetchDdTemplates);
    setDdTemplates(results);
    setContent(results);
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

  const editDdTemplate = (index: number, template?: DdTemplate) => {
    setLastViewedIndex(index);
    setCurrentDdTemplate(template);
    setDetails(true);
  };

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteDdTemplate({ id }));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setDdTemplates(prev => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
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
    },
    {
      title: 'Template',
      dataIndex: 'template',
      width: '12%',
      align: 'center',
    },
    {
      title: 'Disco Gold',
      dataIndex: 'discoGold',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Disco Dollars',
      dataIndex: 'discoDollars',
      width: '10%',
      align: 'center',
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('ddTagName', dds =>
      dds.filter(dd =>
        dd.tagName.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Disco Dollars Templates"
            subTitle="List of Disco Dollars Templates"
            extra={[
              <Button key="1" onClick={() => editDdTemplate(1)}>
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by Tag Name"
              />
            </Col>
          </Row>
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={filteredDdTemplates}
            loading={loading}
          />
        </div>
      )}
      {details && (
        <DdTemplateDetail
          template={currentDdTemplate}
          setDetails={setDetails}
        />
      )}
    </>
  );
};

export default DdTemplates;
