/* eslint-disable react-hooks/exhaustive-deps */
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  Input,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  deleteDirectLink,
  fetchBrands,
  fetchProductBrands,
  fetchDirectLinks,
} from 'services/DiscoClubService';
import { Brand } from 'interfaces/Brand';
import '@pathofdev/react-tag-input/build/index.css';
import { Creator } from 'interfaces/Creator';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import DirectLinkDetail from './DirectLinkDetail';
import scrollIntoView from 'scroll-into-view';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ProductBrand } from 'interfaces/ProductBrand';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';

const { Panel } = Collapse;

const masterBrandMapping: SelectOption = {
  key: 'id',
  label: 'name',
  value: 'id',
};

const productBrandMapping: SelectOption = {
  key: 'id',
  label: 'name',
  value: 'id',
};

const DirectLinks: React.FC<RouteComponentProps> = ({ location }) => {
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const linkRef = useRef<any>(null);
  const videoRef = useRef<any>(null);
  const urlRef = useRef<any>(null);
  const [activeKey, setActiveKey] = useState<string>('1');
  const [selectedLink, setSelectedLink] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState([]);
  const [directLinks, setDirectLinks] = useState<any[]>([]);
  // Filter state
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [productBrandFilter, setProductBrandFilter] = useState<ProductBrand>();
  const [linkFilter, setLinkFilter] = useState<string>();
  const [linkTypeFilter, setLinkTypeFilter] = useState<'Product' | 'Other'>();
  const [videoFilter, setVideoFilter] = useState<string>();
  const [urlFilter, setUrlFilter] = useState<string>();
  const [creatorFilter, setCreatorFilter] = useState<Creator>();
  const [offset, setOffset] = useState<number>(64);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 64,
    marginBottom: '0.5rem',
  });
  const filterPanelHeight = useRef<number>();
  const windowHeight = window.innerHeight;
  const lastFocusedIndex = useRef<number>(-1);
  const directLinksIndex = useRef<number>(-1);
  const history = useHistory();
  const linkFocused = useRef<boolean>(false);
  const linkSelectionEnd = useRef<number>();
  const urlFocused = useRef<boolean>(false);
  const urlSelectionEnd = useRef<number>();
  const videoFocused = useRef<boolean>(false);
  const videoSelectionEnd = useRef<number>();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    getDetailsResources();
  }, []);

  useEffect(() => {
    if (linkRef.current && linkFilter) {
      if (
        linkSelectionEnd.current === linkFilter.length ||
        !linkFocused.current
      )
        linkRef.current.focus({
          cursor: 'end',
        });
      else {
        const link = document.getElementById('link') as HTMLInputElement;
        linkRef.current.focus();
        link!.setSelectionRange(
          linkSelectionEnd.current!,
          linkSelectionEnd.current!
        );
      }
    }
  }, [linkFilter]);

  useEffect(() => {
    if (videoRef.current && videoFilter) {
      if (
        videoSelectionEnd.current === videoFilter.length ||
        !videoFocused.current
      )
        videoRef.current.focus({
          cursor: 'end',
        });
      else {
        const video = document.getElementById('video') as HTMLInputElement;
        videoRef.current.focus();
        video!.setSelectionRange(
          videoSelectionEnd.current!,
          videoSelectionEnd.current!
        );
      }
    }
  }, [videoFilter]);

  useEffect(() => {
    if (urlRef.current && urlFilter) {
      if (urlSelectionEnd.current === urlFilter.length || !urlFocused.current)
        urlRef.current.focus({
          cursor: 'end',
        });
      else {
        const url = document.getElementById('url') as HTMLInputElement;
        urlRef.current.focus();
        url!.setSelectionRange(
          urlSelectionEnd.current!,
          urlSelectionEnd.current!
        );
      }
    }
  }, [urlFilter]);

  useEffect(() => {
    setLoading(false);
  }, [directLinks]);

  useEffect(() => {
    const panel = document.getElementById('filterPanel');

    if (isMobile && panel) {
      // Code for Chrome, Safari and Opera
      panel.addEventListener('webkitTransitionEnd', updateOffset);
      // Standard syntax
      panel.addEventListener('transitionend', updateOffset);

      return () => {
        // Code for Chrome, Safari and Opera
        panel.removeEventListener('webkitTransitionEnd', updateOffset);
        // Standard syntax
        panel.removeEventListener('transitionend', updateOffset);
      };
    }
  });

  useEffect(() => {
    setIsScrollable(details);
    if (!details) scrollToCenter(lastFocusedIndex.current);
  }, [details]);

  useEffect(() => {
    setPanelStyle({ top: offset });
  }, [offset]);

  const search = rows => {
    let updatedRows = rows;
    if (linkFilter) {
      updatedRows = updatedRows.filter(
        row => row.link?.indexOf(linkFilter) > -1
      );
    }
    if (creatorFilter) {
      updatedRows = updatedRows.filter(
        row => row?.creator?.firstName?.indexOf(creatorFilter.firstName) > -1
      );
    }
    if (brandFilter) {
      updatedRows = updatedRows.filter(
        row => row?.brand?.name?.indexOf(brandFilter.name) > -1
      );
    }
    if (productBrandFilter) {
      updatedRows = updatedRows.filter(
        row => row?.productBrand?.name?.indexOf(productBrandFilter.name) > -1
      );
    }
    if (videoFilter) {
      updatedRows = updatedRows.filter(
        row => row.video?.indexOf(videoFilter) > -1
      );
    }
    if (urlFilter) {
      updatedRows = updatedRows.filter(row => row.url?.indexOf(urlFilter) > -1);
    }
    if (linkTypeFilter) {
      updatedRows = updatedRows.filter(
        row => row.linkType?.indexOf(linkTypeFilter) > -1
      );
    }
    return updatedRows;
  };

  const updateOffset = () => {
    if (activeKey === '1') {
      filterPanelHeight.current =
        document.getElementById('filterPanel')!.offsetHeight;
      if (filterPanelHeight.current! > windowHeight) {
        const heightDifference = filterPanelHeight.current! - windowHeight;
        const seventhWindowHeight = windowHeight / 7;
        setOffset(-heightDifference - seventhWindowHeight);
      }
    } else setOffset(64);
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const handleClone = (index: number, record?: any) => {
    lastFocusedIndex.current = index;
    setSelectedLink({ ...(record as any), cloning: true });
    setDetails(true);
    history.push(window.location.pathname);
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'link',
      width: '10%',
      sorter: (a, b): any => {
        if (a.link && b.link) return a.link.localeCompare(b.link as string);
        else if (a.link) return -1;
        else if (b.link) return 1;
        else return 0;
      },
      render: (value: string, record: any, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => handleEditLink(index, record)}
        >
          {value}
        </Link>
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
            <Tooltip title="Link Type">Link Type</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'linkType',
      width: '10%',
      sorter: (a, b): any => {
        if (a.linkType && b.linkType)
          return a.linkType.localeCompare(b.linkType as string);
        else if (a.linkType) return -1;
        else if (b.linkType) return 1;
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'description',
      width: '15%',
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description as string);
        else if (a.description) return -1;
        else if (b.description) return 1;
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
            <Tooltip title="Creator">Creator</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['creator', 'firstName'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.creator?.firstName && b.creator?.firstName)
          return a.creator?.firstName.localeCompare(
            b.creator?.firstName as string
          );
        else if (a.creator?.firstName) return -1;
        else if (b.creator?.firstName) return 1;
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
      dataIndex: ['brand', 'name'],
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.brand && b.brand) return a.brand.name.localeCompare(b.brand.name);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
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
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['productBrand'],
      width: '10%',
      align: 'center',
      render: (field, record) =>
        typeof record.productBrand === 'string'
          ? field
          : record.productBrand?.name,
      sorter: (a, b): any => {
        if (a.productBrand && b.productBrand) {
          if (typeof a.productBrand === typeof b.productBrand) {
            if (typeof a.productBrand === 'string') {
              return a.productBrand.localeCompare(
                b.productBrand as string
              ) as any;
            }
            if (
              typeof a.productBrand !== 'string' &&
              typeof b.productBrand !== 'string'
            ) {
              return a.productBrand?.name.localeCompare(
                b.productBrand?.name as string
              ) as any;
            }
          }
          if (
            typeof a.productBrand === 'string' &&
            typeof b.productBrand !== 'string'
          ) {
            return a.productBrand.localeCompare(
              b.productBrand?.name as any
            ) as any;
          }
          if (
            typeof a.productBrand !== 'string' &&
            typeof b.productBrand === 'string'
          ) {
            return a.productBrand?.name.localeCompare(
              b.productBrand as string
            ) as any;
          }
        } else if (a.productBrand) return -1;
        else if (b.productBrand) return 1;
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
            <Tooltip title="Product">Product</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['product', 'name'],
      width: '10%',
      align: 'left',
      sorter: (a, b): any => {
        if (a.product && b.product)
          return a.product.name.localeCompare(b.product.name);
        else if (a.product.name) return -1;
        else if (b.product.name) return 1;
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
            <Tooltip title="URL">URL</Tooltip>
          </div>
        </div>
      ),
      width: '5%',
      dataIndex: 'url',
      sorter: (a, b): any => {
        if (a.url && b.url) return a.url.localeCompare(b.url as string);
        else if (a.url) return -1;
        else if (b.url) return 1;
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
            <Tooltip title="vLink">vLink</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      dataIndex: 'link',
      render: (value: string) => (
        <Row>
          <Col
            span={20}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'grid', placeItems: 'stretch' }}>
              <div
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                https://link.beautybuzz.io/d/{value}
              </div>
            </div>
          </Col>
          <Col span={4}>
            <CopyToClipboard text={`https://link.beautybuzz.io/d/${value}`}>
              <Button
                type="link"
                onClick={() => {
                  message.success('Copied link to Clipboard.');
                }}
                style={{ padding: 0 }}
              >
                <CopyOutlined />
              </Button>
            </CopyToClipboard>
          </Col>
        </Row>
      ),
      sorter: (a: any, b: any): any => {
        if (a.link && b.link) {
          const linkA = a.link;
          const linkB = b.link;

          if (linkA && linkB) return linkA.localeCompare(linkB);
          else if (linkA) return -1;
          else if (linkB) return 1;
          else return 0;
        } else if (a.link) return -1;
        else if (b.link) return 1;
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
            <Tooltip title="Clone">Clone</Tooltip>
          </div>
        </div>
      ),
      width: '5%',
      align: 'center',
      render: (value: string, record: any, index: number) => (
        <>
          <Link
            onClick={() => handleClone(index, record)}
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
      width: '15%',
      align: 'right',
      render: (_, entity: any, index: number) => (
        <>
          <Link
            onFocus={() =>
              (directLinksIndex.current = directLinks.indexOf(entity))
            }
            onClick={() => handleEditLink(index, entity)}
            to={{ pathname: window.location.pathname, state: entity }}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(entity.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  const getDirectLinks = async (event?: Event, resetResults?: boolean) => {
    if (event && activeKey !== '1') event.stopPropagation();
    try {
      if (event) collapse(event);
      if (resetResults) scrollToCenter(0);
      setLoading(true);
      const { results }: any = await fetchDirectLinks({
        link: linkFilter,
        creatorId: creatorFilter?.id,
        brandId: brandFilter?.id,
        productBrandId: productBrandFilter?.id,
        video: videoFilter,
        url: urlFilter,
        linkType: linkTypeFilter,
      });
      setDirectLinks(results);
    } catch (error) {
      message.error('Error to get links');
    }
  };

  const getDetailsResources = async () => {
    async function getBrands() {
      const response: any = await fetchBrands();
      setBrands(response.results);
    }
    async function getProductBrands() {
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
    }
    await Promise.all([getBrands(), getProductBrands()]);
  };

  const deleteItem = async (_id: string) => {
    await deleteDirectLink(_id);
    setDirectLinks(directLinks.filter(item => item.id !== _id));
  };

  const refreshTable = (record: any) => {
    directLinks[lastFocusedIndex.current] = record;
    setDirectLinks([...directLinks]);
    setDetails(false);
    scrollToCenter(lastFocusedIndex.current);
  };

  const handleEditLink = (index: number, directLink?: any) => {
    lastFocusedIndex.current = index;
    setSelectedLink({ ...(directLink as any) });
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSave = (record: any, newItem?: boolean) => {
    if (newItem) {
      setBrandFilter(undefined);
      setProductBrandFilter(undefined);
      setCreatorFilter(undefined);
      setLinkFilter(undefined);
      setLinkTypeFilter(undefined);
      setVideoFilter(undefined);
      setUrlFilter(undefined);
    }
    refreshTable(record);
    setSelectedLink(undefined);
  };

  const onCancelItem = () => {
    setDetails(false);
  };

  const handleLinkChange = (event: any) => {
    setLinkFilter(event.target.value);
    const selectionStart = event.target.selectionStart;
    linkSelectionEnd.current = event.currentTarget.selectionEnd;
    if (selectionStart && event.currentTarget.selectionEnd)
      linkFocused.current = true;
  };

  const handleVideoChange = (event: any) => {
    setVideoFilter(event.target.value);
    const selectionStart = event.target.selectionStart;
    videoSelectionEnd.current = event.currentTarget.selectionEnd;
    if (selectionStart && event.currentTarget.selectionEnd)
      videoFocused.current = true;
  };

  const handleUrlChange = (event: any) => {
    setUrlFilter(event.target.value);
    const selectionStart = event.target.selectionStart;
    urlSelectionEnd.current = event.currentTarget.selectionEnd;
    if (selectionStart && event.currentTarget.selectionEnd)
      urlFocused.current = true;
  };

  const Filters = () => {
    return (
      <>
        <Row gutter={[8, 8]} align="bottom">
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="Link">
              Link
            </Typography.Title>
            <Input
              id="link"
              allowClear
              ref={linkRef}
              onChange={event => handleLinkChange(event)}
              suffix={<SearchOutlined />}
              value={linkFilter}
              placeholder="Search by Link"
              onPressEnter={() => getDirectLinks(undefined, true)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Creator</Typography.Title>
            <CreatorsMultipleFetchDebounceSelect
              onChangeCreator={(_, creator) => setCreatorFilter(creator)}
              input={creatorFilter?.firstName}
              onClear={() => setCreatorFilter(undefined)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Client</Typography.Title>
            <SimpleSelect
              showSearch
              data={brands}
              onChange={(_, brand) => setBrandFilter(brand)}
              style={{ width: '100%' }}
              selectedOption={brandFilter?.id}
              optionMapping={masterBrandMapping}
              placeholder="Select a Client"
              allowClear
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Product Brand</Typography.Title>
            <SimpleSelect
              showSearch
              data={productBrands}
              onChange={(_, productBrand) =>
                setProductBrandFilter(productBrand)
              }
              style={{ width: '100%' }}
              selectedOption={productBrandFilter?.id}
              optionMapping={productBrandMapping}
              placeholder="Select a Product Brand"
              allowClear
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="Video">
              Video
            </Typography.Title>
            <Input
              id="video"
              allowClear
              ref={videoRef}
              onChange={event => handleVideoChange(event)}
              suffix={<SearchOutlined />}
              value={videoFilter}
              placeholder="Search by Video"
              onPressEnter={() => getDirectLinks(undefined, true)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="URL">
              URL
            </Typography.Title>
            <Input
              id="url"
              allowClear
              ref={urlRef}
              onChange={event => handleUrlChange(event)}
              suffix={<SearchOutlined />}
              value={urlFilter}
              placeholder="Search by URL"
              onPressEnter={() => getDirectLinks(undefined, true)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="Link Type">
              Link Type
            </Typography.Title>
            <Select
              placeholder="Select a Link Type"
              allowClear
              showSearch
              filterOption={filterOption}
              onChange={setLinkTypeFilter}
              value={linkTypeFilter}
              style={{ width: '100%' }}
            >
              <Select.Option key="Product" value="Product" label="Product">
                Product
              </Select.Option>
              <Select.Option key="Other" value="Other" label="Other">
                Other
              </Select.Option>
            </Select>
          </Col>
        </Row>
      </>
    );
  };

  const collapse = (event?: any) => {
    if (event && isMobile) {
      if (activeKey === '1') setActiveKey('0');
    }
  };

  const handleCollapseChange = () => {
    if (activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
  };

  return (
    <>
      {!details && (
        <div style={{ overflow: 'clip', height: '100%' }}>
          <PageHeader
            title="Platform Links"
            subTitle={isMobile ? '' : 'List of Platform Links'}
            extra={[
              <Button
                key="2"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => handleEditLink(directLinks.length - 1)}
              >
                New Item
              </Button>,
            ]}
            className={isMobile ? 'mb-1' : ''}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="mb-05"
            id="filterPanel"
            style={panelStyle}
          >
            <Col lg={20} xs={24}>
              {!isMobile && <Filters />}
              {isMobile && (
                <Collapse
                  ghost
                  activeKey={activeKey}
                  onChange={handleCollapseChange}
                  destroyInactivePanel
                >
                  <Panel
                    header={
                      activeKey === '1' ? (
                        <Typography.Title level={5}>
                          Click to Collapse
                        </Typography.Title>
                      ) : (
                        <Typography.Title level={5}>Filter</Typography.Title>
                      )
                    }
                    key="1"
                    extra={
                      isMobile && (
                        <Button
                          type="primary"
                          onClick={(event: any) => getDirectLinks(event, true)}
                          loading={loading}
                          style={{ marginRight: '-2em' }}
                        >
                          Search
                          <SearchOutlined style={{ color: 'white' }} />
                        </Button>
                      )
                    }
                  >
                    <Filters />
                  </Panel>
                </Collapse>
              )}
            </Col>
            <Col lg={4}>
              <Row
                justify="space-between"
                align="bottom"
                className={isMobile ? 'my-1' : 'mr-05'}
              >
                <Col>
                  <Col flex="auto">
                    <Button
                      type="text"
                      onClick={collapse}
                      style={{
                        display:
                          isMobile && activeKey === '1' ? 'block' : 'none',
                        background: 'none',
                      }}
                    >
                      <UpOutlined />
                    </Button>
                  </Col>
                </Col>
                {!isMobile && (
                  <Button
                    type="primary"
                    onClick={(event: any) => getDirectLinks(event, true)}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                )}
              </Row>
            </Col>
          </Row>
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '30em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              size="small"
              columns={columns}
              rowKey="id"
              dataSource={search(directLinks)}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <DirectLinkDetail
            onSave={handleSave}
            onCancel={onCancelItem}
            directLink={selectedLink}
            brands={brands}
            productBrands={productBrands}
            setDetails={setDetails}
          />
        </div>
      )}
    </>
  );
};

export default DirectLinks;
