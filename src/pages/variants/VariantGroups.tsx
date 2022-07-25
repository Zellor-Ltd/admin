import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteVariantGroup,
  fetchVariantGroups,
} from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import VariantGroupDetail from './VariantGroupDetail';
import { VariantGroup } from 'interfaces/VariantGroup';

const VariantGroups: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentVariantGroup, setCurrentVariantGroup] =
    useState<VariantGroup>();
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [filter, setFilter] = useState<string>('');
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    getResources();
  }, []);

  const getResources = () => {
    getVariantGroups();
  };

  const getVariantGroups = async () => {
    const { results } = await doFetch(fetchVariantGroups);
    setVariantGroups(results);
  };

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details, variantGroups]);

  const editVariantGroup = (index: number, template?: VariantGroup) => {
    setLastViewedIndex(index);
    setCurrentVariantGroup(template);
    setDetails(true);
  };

  const refreshItem = (record: VariantGroup) => {
    variantGroups[lastViewedIndex] = record;
    setVariantGroups([...variantGroups]);
  };

  const onSaveVariantGroup = (record: VariantGroup) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelVariantGroup = () => {
    setDetails(false);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(async () => deleteVariantGroup(id));
    setVariantGroups(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const columns: ColumnsType<VariantGroup> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '20%',
      render: (value: string, record: VariantGroup, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editVariantGroup(index, record)}
        >
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Product Brand',
      dataIndex: 'productBrand',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.productBrand != nextRecord.productBrand,
      render: (field, record) =>
        typeof record.productBrand === 'string'
          ? field
          : record.productBrand?.brandName,
      sorter: (a, b): any => {
        if (a.productBrand && b.productBrand) {
          if (typeof a.productBrand === typeof b.productBrand) {
            if (typeof a.productBrand === 'string') {
              return (a.productBrand as string).localeCompare(
                b.productBrand as unknown as string
              ) as any;
            }
            if (
              typeof a.productBrand !== 'string' &&
              typeof b.productBrand !== 'string'
            ) {
              return a.productBrand?.brandName.localeCompare(
                b.productBrand?.brandName as string
              ) as any;
            }
          }
          if (
            typeof a.productBrand === 'string' &&
            typeof b.productBrand !== 'string'
          ) {
            return (a.productBrand as string).localeCompare(
              b.productBrand?.brandName as any
            ) as any;
          }
          if (
            typeof a.productBrand !== 'string' &&
            typeof b.productBrand === 'string'
          ) {
            return a.productBrand?.brandName.localeCompare(
              b.productBrand as string
            ) as any;
          }
        } else if (a.productBrand) return -1;
        else if (b.productBrand) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: VariantGroup, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editVariantGroup(index, record)}
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
    return rows.filter(
      row => row.name.toUpperCase().indexOf(filter.toUpperCase()) > -1
    );
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Variant Group Names"
            subTitle={isMobile ? '' : 'List of Variant Group Names'}
            className={isMobile ? 'mb-n1' : ''}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editVariantGroup(variantGroups.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                placeholder="Search by Name"
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
            dataSource={search(variantGroups)}
            loading={loading}
            pagination={false}
          />
        </div>
      )}
      {details && (
        <VariantGroupDetail
          variantGroup={currentVariantGroup}
          onSave={onSaveVariantGroup}
          onCancel={onCancelVariantGroup}
        />
      )}
    </>
  );
};

export default VariantGroups;
