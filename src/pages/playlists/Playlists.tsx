import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tabs,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import {
  deleteCustomLinkList,
  fetchBrands,
  fetchCustomLinkLists,
  fetchLinkBrand,
  fetchLinkCreator,
  fetchLinkProduct,
  fetchLinkProductBrand,
  saveCustomLinkList,
  updateLinkBrand,
  updateLinkCreator,
  updateLinkProduct,
  updateLinkProductBrand,
} from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import moment from 'moment';
import PlaylistDetails from './PlaylistDetails';
import CustomDetails from './CustomDetails';
import { AppContext } from 'contexts/AppContext';

const Playlists: React.FC<RouteComponentProps> = () => {
  const { isMobile } = useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState<string>('client');
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const [details, setDetails] = useState<boolean>(false);
  const history = useHistory();
  const [brands, setBrands] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [currentList, setCurrentList] = useState<any>();
  const [creators, setCreators] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productBrands, setProductBrands] = useState<any[]>([]);
  const [custom, setCustom] = useState<any[]>([]);
  const tableHeight = isMobile
    ? window.innerHeight - 400
    : window.innerHeight - 370;
  const filter = useRef<any>();
  const cloning = useRef<boolean>(false);

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  const getAllBrands = useMemo(() => {
    const fetchData = async () => {
      const response = await doFetch(() => fetchBrands());
      setAllBrands(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getBrandData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() => fetchLinkBrand({ term: query }));
      setBrands(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getProductBrandData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() =>
        fetchLinkProductBrand({ term: query })
      );
      setProductBrands(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getProductData = useMemo(() => {
    const fetchData = async (query: string) => {
      if (query) {
        const response = await doFetch(() => fetchLinkProduct({ term: query }));
        setProducts(response.results);
      } else message.warning('Must specify search filter to get product data!');
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCreatorData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() => fetchLinkCreator({ term: query }));
      setCreators(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCustomData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() =>
        fetchCustomLinkLists({ term: query })
      );
      setCustom(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (value === 'custom') getCustomData('');
  };

  const handleEdit = (list?: any, isCloning?: boolean) => {
    if (selectedTab === 'custom' && !brands.length) getAllBrands();

    if (isCloning) {
      setCurrentList({ ...list, id: undefined });
      cloning.current = true;
    } else setCurrentList(list);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSaveRecord = async (
    record: any,
    setLoadingLocal: any,
    tabName: string
  ) => {
    try {
      setLoadingLocal(true);
      const updatedLinks = currentList.links.map((item: any) => {
        if (item.id === record.id) return record;
        else return item;
      });

      switch (tabName) {
        case 'client':
          await updateLinkBrand({ ...currentList, links: updatedLinks });
          break;
        case 'productBrand':
          await updateLinkProductBrand({ ...currentList, links: updatedLinks });
          break;
        case 'product':
          await updateLinkProduct({ ...currentList, links: updatedLinks });
          break;
        case 'creator':
          await updateLinkCreator({ ...currentList, links: updatedLinks });
          break;
        case 'custom':
          await saveCustomLinkList({
            ...currentList,
            links: updatedLinks,
            tp: 's',
          });
          break;
      }

      message.success('Register updated with success.');
    } catch (error: any) {
      message.error('Error: ' + error.error);
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleCancelRecord = () => {
    setDetails(false);
  };

  const handleDelete = async (record: any, index: number) => {
    try {
      deleteCustomLinkList(record.id);
      message.success('List deleted successfully.');
      setCustom(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (e) {
      message.error('Error: something went wrong. Please try again');
    }
  };

  const handleSaveCustomList = (record: any) => {
    const listItem = custom.find(item => item.id === record.id);
    if (cloning.current) cloning.current = false;
    if (!listItem) {
      refreshTable(record, custom.length);
      return;
    }
    const index = custom.indexOf(listItem);
    refreshTable(record, index);
  };

  const handleSearch = (query: string) => {
    switch (selectedTab) {
      case 'client':
        getBrandData(query);
        break;
      case 'productBrand':
        getProductBrandData(query);
        break;
      case 'product':
        getProductData(query);
        break;
      case 'creator':
        getCreatorData(query);
        break;
      case 'custom':
        if (!brands.length) getAllBrands();
        getCustomData(query);
        break;
    }
  };
  const refreshTable = (record: any, index: number) => {
    setCustom(prev => [
      ...prev.slice(0, index),
      record,
      ...prev.slice(index + 1),
    ]);
  };

  const brandColumns: ColumnsType<any> = [
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
      width: '3%',
      render: id => (
        <CopyValueToClipboard tooltipText="Copy Playlist ID" value={id} />
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
            <Tooltip title="Copy embed code">Copy Embed Code</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => (
        <CopyValueToClipboard
          tooltipText="Copy Embed Code"
          value={`<vlink-carousel src="${id?.slice(0, -4)}"></vlink-carousel>`}
        />
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: (value: string) => {
        if (value)
          return (
            <a
              href={'https://beautybuzz.io/' + value.toUpperCase().slice(0, -4)}
              target="blank"
              style={value ? {} : { pointerEvents: 'none' }}
            >
              {value
                ? `https://beautybuzz.io/${value.toUpperCase().slice(0, -4)}`
                : '-'}
            </a>
          );
        else return '-';
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
      dataIndex: 'productBrand',
      width: '30%',
      render: (productBrand: any) => productBrand?.brandName,
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
            <Tooltip title="Links">Links</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'links',
      width: '5%',
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const productBrandColumns: ColumnsType<any> = [
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
      width: '3%',
      render: id => (
        <CopyValueToClipboard tooltipText="Copy Playlist ID" value={id} />
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
            <Tooltip title="Copy embed code">Copy Embed Code</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => (
        <CopyValueToClipboard
          tooltipText="Copy Embed Code"
          value={`<vlink-carousel src="${id?.slice(0, -4)}"></vlink-carousel>`}
        />
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: (value: string) => {
        if (value)
          return (
            <a
              href={'https://beautybuzz.io/' + value.toUpperCase().slice(0, -4)}
              target="blank"
              style={value ? {} : { pointerEvents: 'none' }}
            >
              {value
                ? `https://beautybuzz.io/${value.toUpperCase().slice(0, -4)}`
                : '-'}
            </a>
          );
        else return '-';
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
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productBrand',
      width: '30%',
      render: (productBrand: any) => productBrand.brandName,
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
            <Tooltip title="Links">Links</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'links',
      width: '5%',
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const productColumns: ColumnsType<any> = [
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
      width: '3%',
      render: id => (
        <CopyValueToClipboard tooltipText="Copy Playlist ID" value={id} />
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
            <Tooltip title="Copy embed code">Copy Embed Code</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => (
        <Tooltip title="Copy embed code">
          <CopyValueToClipboard
            tooltipText="Copy Embed Code"
            value={`<vlink-carousel src="${id?.slice(
              0,
              -4
            )}"></vlink-carousel>`}
          />
        </Tooltip>
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: (value: string) => {
        if (value)
          return (
            <a
              href={'https://beautybuzz.io/' + value.toUpperCase().slice(0, -4)}
              target="blank"
              style={value ? {} : { pointerEvents: 'none' }}
            >
              {value
                ? `https://beautybuzz.io/${value.toUpperCase().slice(0, -4)}`
                : '-'}
            </a>
          );
        else return '-';
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
            <Tooltip title="Product">Product</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'product',
      width: '30%',
      render: (product: any) => product.name,
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
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productBrand',
      width: '30%',
      render: (productBrand: any) => productBrand.brandName,
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
            <Tooltip title="Links">Links</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'links',
      width: '5%',
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const creatorColumns: ColumnsType<any> = [
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
      width: '3%',
      render: id => (
        <CopyValueToClipboard tooltipText="Copy Playlist ID" value={id} />
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
            <Tooltip title="Copy embed code">Copy Embed Code</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => (
        <CopyValueToClipboard
          tooltipText="Copy Embed Code"
          value={`<vlink-carousel src="${id?.slice(0, -4)}"></vlink-carousel>`}
        />
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['creator', 'userName'],
      width: '10%',
      align: 'center',
      render: (value: string) => {
        if (value)
          return (
            <a
              href={'https://beautybuzz.io/' + value}
              target="blank"
              style={value ? {} : { pointerEvents: 'none' }}
            >
              {value ? `https://beautybuzz.io/${value}` : '-'}
            </a>
          );
        else return '-';
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
            <Tooltip title="creator">Creator</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creator',
      width: '30%',
      render: (creator: any) =>
        creator?.name?.trim() === '' ? creator?.userName : creator?.name,
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
            <Tooltip title="Links">Links</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'links',
      width: '5%',
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const customColumns: ColumnsType<any> = [
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
      width: '3%',
      render: id => (
        <CopyValueToClipboard tooltipText="Copy Playlist ID" value={id} />
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
            <Tooltip title="Copy embed code">Copy Embed Code</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => (
        <CopyValueToClipboard
          tooltipText="Copy Embed Code"
          value={`<script src="https://beautybuzz.io/script/ce/vlink-ce.js"></script>
                  <vlink-carousel src=${id?.slice(0, -4)} size="1">
                  </vlink-carousel>`}
        />
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: (value: string) => {
        if (value)
          return (
            <a
              href={'https://beautybuzz.io/' + value.toUpperCase().slice(0, -4)}
              target="blank"
              style={value ? {} : { pointerEvents: 'none' }}
            >
              {value
                ? `https://beautybuzz.io/${value.toUpperCase().slice(0, -4)}`
                : '-'}
            </a>
          );
        else return '-';
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '30%',
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
            <Tooltip title="Links">Links</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'links',
      width: '5%',
      render: (links: [any]) => (links ? links.length : '0'),
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
            <Tooltip title="Clone">Clone</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      align: 'center',
      render: (_, record: any, index: number) => (
        <>
          <Link
            onClick={() => handleEdit(record, true)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            <CopyOutlined />
          </Link>
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record, index: number) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="playlists">
      {!details && (
        <>
          <PageHeader
            title="Playlists"
            className="mb-n05"
            extra={
              selectedTab === 'custom' && (
                <Button key="1" type="primary" onClick={() => handleEdit()}>
                  New Playlist
                </Button>
              )
            }
          />
          <Row
            gutter={8}
            align="bottom"
            justify="space-between"
            className="mb-05"
          >
            <Col
              lg={4}
              md={12}
              xs={24}
              style={{
                paddingLeft: '1rem',
                paddingRight: '1.2rem',
                paddingTop: '0.5rem',
              }}
            >
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                allowClear
                disabled={loading}
                placeholder="Search by Description"
                suffix={<SearchOutlined />}
                value={filter.current}
                onChange={(e: any) => {
                  filter.current = e.target.value;
                }}
              />
            </Col>
            <Col lg={4} md={12} xs={24}>
              <Row justify="end" className="mt-1">
                <Col>
                  <Button
                    style={
                      isMobile
                        ? { marginRight: '1rem' }
                        : { marginRight: '1.6rem' }
                    }
                    type="primary"
                    onClick={() => handleSearch(filter.current)}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Tabs
            className="tab-page"
            onChange={handleTabChange}
            activeKey={selectedTab}
            style={{ minHeight: '100%' }}
          >
            <Tabs.TabPane tab="Client" key="client" style={{ height: '100%' }}>
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={brandColumns}
                dataSource={brands}
                loading={loading}
                pagination={false}
                scroll={{ y: tableHeight, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Product Brand"
              key="productBrand"
              style={{ height: '100%' }}
            >
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={productBrandColumns}
                dataSource={productBrands}
                loading={loading}
                pagination={false}
                scroll={{ y: tableHeight, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Product"
              key="product"
              style={{ height: '100%' }}
            >
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={productColumns}
                dataSource={products}
                loading={loading}
                pagination={false}
                scroll={{ y: tableHeight, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Creator"
              key="creator"
              style={{ height: '100%' }}
            >
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={creatorColumns}
                dataSource={creators}
                loading={loading}
                pagination={false}
                scroll={{ y: tableHeight, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Custom" key="custom" style={{ height: '100%' }}>
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={customColumns}
                dataSource={custom}
                loading={loading}
                pagination={false}
                scroll={{ y: tableHeight, x: true }}
                size="small"
              />
            </Tabs.TabPane>
          </Tabs>
        </>
      )}
      {selectedTab === 'custom' && details && (
        <>
          <PageHeader
            title={
              currentList?.name ? `Edit ${currentList.name}` : 'New Playlist'
            }
            className="mb-n05"
          />
          <CustomDetails
            setCurrentList={setCurrentList}
            currentList={currentList}
            setDetails={setDetails}
            brands={allBrands}
            onSave={handleSaveCustomList}
            isCloning={cloning.current}
          />
        </>
      )}
      {selectedTab !== 'custom' && details && (
        <PlaylistDetails
          record={currentList}
          onSave={handleSaveRecord}
          onCancel={handleCancelRecord}
          tabName={selectedTab}
        />
      )}
    </div>
  );
};

export default Playlists;
