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
  Avatar,
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
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { discoBrandId } from 'helpers/constants';
import { Brand } from 'interfaces/Brand';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  deleteBrand,
  fetchBrands,
  rebuildLink,
  saveBrand,
} from 'services/DiscoClubService';
import { SimpleSwitch } from '../../components/SimpleSwitch';
import BrandDetail from './BrandDetail';
import scrollIntoView from 'scroll-into-view';
import { useRequest } from 'hooks/useRequest';

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const Brands: React.FC<RouteComponentProps> = ({ location }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentBrand, setCurrentBrand] = useState<Brand>();
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

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (!details) setStyle({ overflow: 'clip', height: '100%' });
    else setStyle({ overflow: 'scroll', height: '100%' });
  }, [details]);

  const fetch = async () => {
    const { results }: any = await doFetch(fetchBrands);
    setBrands(results);
  };

  useEffect(() => {
    setisScrollable(details);

    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const aproveOrReject = async (aprove: boolean, creator: Brand) => {
    creator.status = aprove ? 'approved' : 'rejected';
    setLoading(true);
    await saveBrand(creator);
    fetch();
  };

  const deleteItem = async (id: string, index: number) => {
    setLoading(true);
    try {
      await deleteBrand({ id });
      setBrands(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterBrand = () => {
    return brands.filter(brand =>
      brand.brandName?.toUpperCase().includes(filterText?.toUpperCase())
    );
  };

  const handleSwitchChange = async (
    switchType: 'showOutOfStock' | 'paused',
    brand: Brand,
    toggled: boolean
  ) => {
    try {
      brand[switchType] = toggled;
      await saveBrand(brand);
      msg.success('Register updated with success.');
    } catch (error) {
      msg.error("Error: Couldn't set brand property. Try again.");
    }
  };

  const editBrand = (index: number, brand?: Brand) => {
    setLastViewedIndex(index);
    setCurrentBrand(brand);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const refreshItem = (record: Brand) => {
    brands[lastViewedIndex] = record;
    setBrands([...brands]);
  };

  const onSaveBrand = (record: Brand) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelBrand = () => {
    setDetails(false);
  };

  const rebuildVlink = async (brand: Brand, index: number) => {
    try {
      const { result, success, message }: any = await rebuildLink(
        brand.masterBrandLink!
      );
      if (success) {
        brands[index] = { ...brand, masterBrandLink: result };
        setBrands([...brands]);
        msg.success(message);
      }
    } catch {}
  };

  const updateVIndex = async (record: Brand, input?: number) => {
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
      await saveBrand(record);
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

  const columns: ColumnsType<Brand> = [
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
      render: (_, record: Brand) => <CopyValueToClipboard value={record.id} />,
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
            <Tooltip title="Master Brand Name">Master Brand Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brandName',
      width: '15%',
      render: (value: string, record: Brand, index: number) => (
        <Link to={location.pathname} onClick={() => editBrand(index, record)}>
          {record.id !== discoBrandId ? (
            value
          ) : (
            <b style={{ color: 'lightcoral' }}>{value}</b>
          )}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.brandName && b.brandName)
          return a.brandName.localeCompare(b.brandName);
        else if (a.brandName) return 1;
        else if (b.brandName) return -1;
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
      width: '5%',
      render: (_, brand, index) => {
        if (updatingVIndex[brand.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={brand.vIndex}
              onFocus={event => event.stopPropagation()}
              onBlur={(event: any) =>
                updateVIndex(brand, event.target.value as unknown as number)
              }
              onPressEnter={(event: any) =>
                updateVIndex(brand, event.target.value as unknown as number)
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
            <Tooltip title="Master Brand Link">Master Brand Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'masterBrandLink',
      width: '5%',
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
      render: (_, record: Brand, index: number) => (
        <>
          <Button
            type="link"
            block
            onClick={() => rebuildVlink(record, index)}
            disabled={!record.masterBrandLink}
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
            <Tooltip title="Paused">Paused</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'paused',
      width: '10%',
      align: 'center',
      render: (_: any, record: Brand) => (
        <SimpleSwitch
          toggled={!!record.paused}
          handleSwitchChange={(toggled: boolean) =>
            handleSwitchChange('paused', record, toggled)
          }
        />
      ),
      sorter: (a, b): any => {
        if (a.paused && b.paused) return 0;
        else if (a.paused) return -1;
        else if (b.paused) return 1;
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
            <Tooltip title="Show Out of Stock">Show Out of Stock</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'showOutOfStock',
      width: '10%',
      align: 'center',
      render: (value: any, record: Brand) => (
        <SimpleSwitch
          toggled={!!record.showOutOfStock}
          handleSwitchChange={(toggled: boolean) =>
            handleSwitchChange('showOutOfStock', record, toggled)
          }
        />
      ),
      sorter: (a, b): any => {
        if (a.showOutOfStock && b.showOutOfStock) return 0;
        else if (a.showOutOfStock) return -1;
        else if (b.showOutOfStock) return 1;
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
            <Tooltip title="Automated">Automated</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'automated',
      width: '5%',
      align: 'center',
      render: (value: any) => <b>{value ? 'Yes' : 'No'}</b>,
      sorter: (a, b): any => {
        if (a.automated && b.automated) return 0;
        else if (a.automated) return -1;
        else if (b.automated) return 1;
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
            <Tooltip title="Master Brand Color">Master Brand Color</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brandTxtColor',
      width: '10%',
      align: 'center',
      render: (value: any) => (
        <Avatar
          style={{ backgroundColor: value, border: '1px solid #9c9c9c' }}
        />
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
            <Tooltip title="D%">D%</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'discoPercentage',
      width: '8%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.discoPercentage && b.discoPercentage)
          return a.discoPercentage - b.discoPercentage;
        else if (a.discoPercentage) return -1;
        else if (b.discoPercentage) return 1;
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
            <Tooltip title="C%">C%</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creatorPercentage',
      width: '8%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.creatorPercentage && b.creatorPercentage)
          return a.creatorPercentage - b.creatorPercentage;
        else if (a.creatorPercentage) return -1;
        else if (b.creatorPercentage) return 1;
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
            <Tooltip title="DD%">DD%</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'maxDiscoDollarPercentage',
      width: '9%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.maxDiscoDollarPercentage && b.maxDiscoDollarPercentage)
          return a.maxDiscoDollarPercentage - b.maxDiscoDollarPercentage;
        else if (a.maxDiscoDollarPercentage) return -1;
        else if (b.maxDiscoDollarPercentage) return 1;
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
      render: (value = 'pending') => (
        <Tag color={tagColorByStatus[value]}>{value}</Tag>
      ),
      sorter: (a, b): any => {
        if (a.status && b.status)
          return a.status === b.status ? 0 : a.status === 'pending' ? 1 : -1;
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
      width: '15%',
      align: 'right',
      render: (_, record: Brand, index: number) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: 'green' }}
              onClick={() => aproveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: 'red', margin: '6px' }}
              onClick={() => aproveOrReject(false, record)}
            />,
          ]}
          <Link to={location.pathname} onClick={() => editBrand(index, record)}>
            <EditOutlined />
          </Link>
          {record.id !== discoBrandId && (
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
          )}
        </>
      ),
    },
  ];

  return (
    <div style={style}>
      {!details && (
        <>
          <PageHeader
            title="Master Brands"
            subTitle={isMobile ? '' : 'List of Master Brands'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editBrand(filterBrand().length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="mb-05 sticky-filter-box">
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Search
              </Typography.Title>
              <Input
                allowClear
                disabled={loading}
                onChange={onChangeFilter}
                placeholder="Search by Name"
                suffix={<SearchOutlined />}
              />
            </Col>
          </Row>
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '31em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={filterBrand()}
              loading={loading}
              pagination={false}
            />
          </div>
        </>
      )}
      {details && (
        <BrandDetail
          onSave={onSaveBrand}
          onCancel={onCancelBrand}
          brand={currentBrand as Brand}
        />
      )}
    </div>
  );
};

export default Brands;
