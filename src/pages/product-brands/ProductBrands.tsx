/* eslint-disable react-hooks/exhaustive-deps */
import {
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
import { useRequest } from '../../hooks/useRequest';
import { ProductBrand } from '../../interfaces/ProductBrand';
import moment from 'moment';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  fetchProductBrands,
  deleteProductBrand,
  fetchBrands,
  rebuildLink,
  saveProductBrand,
} from '../../services/DiscoClubService';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import ProductBrandDetail from './ProductBrandDetail';
import scrollIntoView from 'scroll-into-view';
import { Brand } from 'interfaces/Brand';
import useAllCategories from 'hooks/useAllCategories';
import { SimpleSwitch } from 'components/SimpleSwitch';

const ProductBrands: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRow, setLoadingRow] = useState<string>('');
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProductBrand, setCurrentProductBrand] =
    useState<ProductBrand>();
  const [buffer, setBuffer] = useState<ProductBrand[]>([]);
  const [data, setData] = useState<ProductBrand[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filter, setFilter] = useState<string>('');
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const { fetchAllCategories, allCategories } = useAllCategories({});
  const [updatingVIndex, setUpdatingVIndex] = useState<Record<string, boolean>>(
    {}
  );
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
  }, [filter, buffer]);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  const getResources = async () => {
    await Promise.all([getBrands(), getProductBrands(), fetchAllCategories()]);
  };

  const getProductBrands = async () => {
    const { results } = await doFetch(fetchProductBrands);
    setBuffer(results);
  };

  const getBrands = async () => {
    const { results }: any = await doFetch(fetchBrands);
    setBrands(results);
  };

  useEffect(() => {
    if (!details) scrollToCenter(lastViewedIndex);

    setIsScrollable(details);
  }, [details]);

  const rebuildVlink = async (productBrand: ProductBrand, index: number) => {
    try {
      setLoadingRow(productBrand.brandLink ?? '');
      const { result, success, message }: any = await rebuildLink(
        productBrand.brandLink!
      );

      if (success) {
        data[index] = { ...productBrand, brandLink: result };
        setData([...data]);
        msg.success(message);
      }
    } catch {
    } finally {
      setLoadingRow('');
    }
  };

  const updateVIndex = async (record: ProductBrand, input?: number) => {
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
      await saveProductBrand(record);
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

  const handleSwitchChange = async (
    productBrand: ProductBrand,
    toggled: boolean
  ) => {
    try {
      productBrand.displayInGrid = toggled;
      await doRequest(() => saveProductBrand(productBrand));
      msg.success('Register updated with success.');
    } catch (error) {
      msg.error("Error: Couldn't set brand property. Try again.");
    }
  };

  const columns: ColumnsType<ProductBrand> = [
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
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
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
      dataIndex: 'brandName',
      width: '10%',
      render: (value: string, record: ProductBrand, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editProductBrand(index, record)}
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
      width: '8%',
      render: (_, productBrand, index) => {
        if (updatingVIndex[productBrand.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={productBrand.vIndex}
              onFocus={event => event.stopPropagation()}
              onBlur={(event: any) =>
                updateVIndex(
                  productBrand,
                  event.target.value as unknown as number
                )
              }
              onPressEnter={(event: any) =>
                updateVIndex(
                  productBrand,
                  event.target.value as unknown as number
                )
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
            <Tooltip title="Display in Grid">Display in Grid</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'displayInGrid',
      width: '15%',
      align: 'center',
      render: (value: any, record: ProductBrand) => (
        <SimpleSwitch
          toggled={!!record.displayInGrid}
          handleSwitchChange={toggled => handleSwitchChange(record, toggled)}
        />
      ),
      sorter: (a, b): any => {
        if (a.displayInGrid && b.displayInGrid) return 0;
        else if (a.displayInGrid) return -1;
        else if (b.displayInGrid) return 1;
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
            <Tooltip title="Brand Link">Brand Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brandLink',
      width: '10%',
      align: 'center',
      render: (value: string) => (
        <a
          href={'https://beautybuzz.io/' + value}
          target="blank"
          style={value ? {} : { pointerEvents: 'none' }}
        >
          {value ? `https://beautybuzz.io/${value}` : '-'}
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
      width: '10%',
      align: 'center',
      render: (_, record: ProductBrand, index: number) => (
        <>
          <Button
            type="link"
            block
            onClick={() => rebuildVlink(record, index)}
            disabled={!record.brandLink || loadingRow !== ''}
            loading={loadingRow === record.brandLink}
          >
            {loadingRow !== record.brandLink && <RedoOutlined />}
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
          return a.discoPercentage !== b.discoPercentage
            ? a.discoPercentage - b.discoPercentage
            : 0;
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
          return a.creatorPercentage !== b.creatorPercentage
            ? a.creatorPercentage - b.creatorPercentage
            : 0;
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
      width: '8%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.maxDiscoDollarPercentage && b.maxDiscoDollarPercentage)
          return a.maxDiscoDollarPercentage !== b.maxDiscoDollarPercentage
            ? a.maxDiscoDollarPercentage - b.maxDiscoDollarPercentage
            : 0;
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
            <Tooltip title="External Code">External Code</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'externalCode',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.externalCode && b.externalCode)
          return a.externalCode !== b.externalCode
            ? a.externalCode - b.externalCode
            : 0;
        else if (a.externalCode) return -1;
        else if (b.externalCode) return 1;
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: ProductBrand, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editProductBrand(index, record)}
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
    if (filter) {
      return rows.filter(
        row => row.name?.toUpperCase().indexOf(filter?.toUpperCase()) > -1
      );
    }

    return rows;
  };

  const editProductBrand = (index: number, productBrand?: ProductBrand) => {
    setLastViewedIndex(index);
    setCurrentProductBrand(productBrand);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteProductBrand(id));
    setBuffer(buffer.filter(item => item.id !== id));
  };

  const refreshItem = (record: ProductBrand, newItem?: boolean) => {
    const tmp = buffer.map(item => {
      if (item.id === record.id) return record;
      else return item;
    });

    setBuffer(newItem ? [...tmp, record] : [...tmp]);
    scrollToCenter(data.length - 1);
  };

  const onSaveBrand = (record: ProductBrand, newItem?: boolean) => {
    if (newItem) setFilter('');
    refreshItem(record, newItem);
    setDetails(false);
  };

  const onCancelBrand = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div style={{ overflow: 'clip', height: '100%' }}>
          <PageHeader
            title="Product Brands"
            subTitle={isMobile ? '' : 'List of Product Brands'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editProductBrand(buffer.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row className="mb-05" gutter={8}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                allowClear
                disabled={loading}
                placeholder="Search by Name"
                value={filter}
                suffix={<SearchOutlined />}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '32em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <ProductBrandDetail
            productBrand={currentProductBrand as ProductBrand}
            onSave={onSaveBrand}
            onCancel={onCancelBrand}
            brands={brands}
            allCategories={allCategories}
          />
        </div>
      )}
    </>
  );
};

export default ProductBrands;
