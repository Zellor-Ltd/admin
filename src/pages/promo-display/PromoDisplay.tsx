import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { PromoDisplay } from 'interfaces/PromoDisplay';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deletePromoDisplay,
  fetchPromoDisplays,
} from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromoDisplayDetail from './PromoDisplayDetail';

const PromoDisplays: React.FC<RouteComponentProps> = ({
  history,
  location,
}) => {
  const detailsPathname = `${location.pathname}/promo-display`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [content, setContent] = useState<any[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromoDisplay, setCurrentPromoDisplay] =
    useState<PromoDisplay>();

  const {
    setArrayList: setPromoDisplays,
    filteredArrayList: filteredPromoDisplays,
    addFilterFunction,
  } = useFilter<PromoDisplay>([]);

  const getResources = async () => {
    await getPromoDisplays();
  };

  const getPromoDisplays = async () => {
    const { results } = await doFetch(fetchPromoDisplays);
    setPromoDisplays(results);
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

  const editPromoDisplay = (index: number, promoDisplay?: PromoDisplay) => {
    setLastViewedIndex(index);
    setCurrentPromoDisplay(promoDisplay);
    setDetails(true);
  };

  const deleteItem = async (id: string) => {
    await doRequest(() => deletePromoDisplay({ id }));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setPromoDisplays(prev => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
  };

  const columns: ColumnsType<PromoDisplay> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Shop Display ID',
      dataIndex: 'id',
      width: '20%',
      render: (value: string, record: PromoDisplay, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editPromoDisplay(index, record)}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Display Start Date',
      dataIndex: 'displayStartDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
    },
    {
      title: 'Display Expire Date',
      dataIndex: 'displayExpireDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: PromoDisplay, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editPromoDisplay(index, record)}
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
    addFilterFunction('promoId', promoDisplays =>
      promoDisplays.filter(promoDisplay =>
        promoDisplay.id.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Shop Display"
            subTitle="List of Shop Display"
            extra={[
              <Button key="1" onClick={() => editPromoDisplay(1)}>
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by ID"
              />
            </Col>
          </Row>
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={filteredPromoDisplays}
            loading={loading}
          />
        </div>
      )}
      {details && (
        <PromoDisplayDetail
          promoDisplay={currentPromoDisplay}
          setDetails={setDetails}
        />
      )}
    </>
  );
};

export default PromoDisplays;
