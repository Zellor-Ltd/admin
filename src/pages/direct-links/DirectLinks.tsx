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
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteDirectLink,
  fetchBrands,
  fetchCreators,
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

const { Panel } = Collapse;

const DirectLinks: React.FC<RouteComponentProps> = ({ location }) => {
  const { isMobile, setIsDetails } = useContext(AppContext);
  const descriptionRef = useRef<any>(null);
  const urlRef = useRef<any>(null);
  const [activeKey, setActiveKey] = useState<string>('-1');
  const [selectedLink, setSelectedLink] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState([]);
  const [directLinks, setDirectLinks] = useState<any[]>([]);

  // Filter state
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [productBrandFilter, setProductBrandFilter] = useState<string>();
  const [descriptionFilter, setDescriptionFilter] = useState<string>();
  const [urlFilter, setUrlFilter] = useState<string>();
  const [creatorFilter, setCreatorFilter] = useState<string>();
  const [offset, setOffset] = useState<number>(64);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 64,
    marginBottom: '0.5rem',
  });
  const filterPanelHeight = useRef<number>();
  const windowHeight = window.innerHeight;
  const lastFocusedIndex = useRef<number>(-1);
  const directLinksIndex = useRef<number>(-1);

  useEffect(() => {
    getDetailsResources();
  }, []);

  const search = rows => {
    let updatedRows = rows;
    if (brandFilter) {
      updatedRows = updatedRows.filter(
        row => row?.brand?.brandName?.indexOf(brandFilter) > -1
      );
    }
    if (productBrandFilter) {
      updatedRows = updatedRows.filter(
        row => row?.productBrand?.brandName?.indexOf(productBrandFilter) > -1
      );
    }
    if (creatorFilter) {
      updatedRows = updatedRows.filter(
        row => row?.creator?.firstName?.indexOf(creatorFilter) > -1
      );
    }
    if (descriptionFilter) {
      updatedRows = updatedRows.filter(
        row => row.category?.indexOf(descriptionFilter) > -1
      );
    }
    if (urlFilter) {
      updatedRows = updatedRows.filter(
        row => row.category?.indexOf(urlFilter) > -1
      );
    }
    return updatedRows;
  };

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

  useEffect(() => {
    setPanelStyle({ top: offset });
  }, [offset]);

  useEffect(() => {
    if (descriptionRef.current)
      descriptionRef.current.focus({
        cursor: 'end',
      });
  }, [descriptionFilter]);

  useEffect(() => {
    if (urlRef.current)
      urlRef.current.focus({
        cursor: 'end',
      });
  }, [urlFilter]);

  const masterBrandMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const productBrandMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
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
            <Tooltip title="Master Brand">Master Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['brand', 'brandName'],
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.brandName.localeCompare(b.brand.brandName);
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
          : record.productBrand?.brandName,
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
              return a.productBrand?.brandName.localeCompare(
                b.productBrand?.brandName as string
              ) as any;
            }
          }
          if (
            typeof a.productBrand === 'string' &&
            typeof b.productBrand !== 'string'
          ) {
            return a.productBrand.localeCompare(
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
      width: '10%',
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
      width: '15%',
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
                https://link.discoclub.com/d/{value}
              </div>
            </div>
          </Col>
          <Col span={4}>
            <CopyToClipboard text={value}>
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

  useEffect(() => {
    setIsDetails(details);
    if (!details) scrollToCenter(lastFocusedIndex.current);
  }, [details]);

  const getDirectLinks = async (event?: Event, resetResults?: boolean) => {
    if (event && activeKey !== '1') event.stopPropagation();
    try {
      if (event) collapse(event);
      if (resetResults) scrollToCenter(0);
      setLoading(true);
      const { results }: any = await fetchDirectLinks();
      setDirectLinks(results);
    } catch (error) {
      message.error('Error to get links');
    }
  };

  const getDetailsResources = async () => {
    async function getcreators() {
      const response: any = await fetchCreators({
        query: '',
      });
      setCreators(response.results);
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      setBrands(response.results);
    }
    async function getProductBrands() {
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
    }
    await Promise.all([getcreators(), getBrands(), getProductBrands()]);
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
  };

  const handleSave = (record: any, newItem?: boolean) => {
    if (newItem) {
      setBrandFilter(undefined);
      setProductBrandFilter(undefined);
      setCreatorFilter(undefined);
      setDescriptionFilter(undefined);
      setUrlFilter(undefined);
    }
    refreshTable(record);
    setSelectedLink(undefined);
  };

  const onCancelItem = () => {
    setDetails(false);
  };

  const Filters = () => {
    return (
      <>
        <Row gutter={[8, 8]} align="bottom">
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="Description">
              Description
            </Typography.Title>
            <Input
              allowClear
              disabled
              ref={descriptionRef}
              onChange={event => setDescriptionFilter(event.target.value)}
              suffix={<SearchOutlined />}
              value={descriptionFilter}
              placeholder="Search by Description"
              onPressEnter={() => getDirectLinks(undefined, true)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Creator</Typography.Title>
            <Select
              placeholder="Select a Creator"
              disabled
              onChange={setCreatorFilter}
              value={creatorFilter}
              style={{ width: '100%' }}
              filterOption={filterOption}
              allowClear
              showSearch
            >
              {creators.map((curr: any) => (
                <Select.Option
                  key={curr.id}
                  value={curr.firstName}
                  label={curr.firstName}
                >
                  {curr.firstName}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Master Brand</Typography.Title>
            <SimpleSelect
              showSearch
              data={brands}
              onChange={(_, brand) => setBrandFilter(brand)}
              style={{ width: '100%' }}
              selectedOption={brandFilter?.id}
              optionMapping={masterBrandMapping}
              placeholder="Select a Master Brand"
              disabled
              allowClear
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Product Brand</Typography.Title>
            <SimpleSelect
              showSearch
              data={productBrands}
              onChange={setProductBrandFilter}
              style={{ width: '100%' }}
              selectedOption={productBrandFilter}
              optionMapping={productBrandMapping}
              placeholder="Select a Product Brand"
              disabled
              allowClear
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="URL">
              URL
            </Typography.Title>
            <Input
              allowClear
              disabled
              ref={urlRef}
              onChange={event => setUrlFilter(event.target.value)}
              suffix={<SearchOutlined />}
              value={urlFilter}
              placeholder="Search by URL"
              onPressEnter={() => getDirectLinks(undefined, true)}
            />
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
    <div
      style={
        details ? { height: '100%' } : { overflow: 'clip', height: '100%' }
      }
    >
      {!details && (
        <>
          <PageHeader
            title="Direct Links"
            subTitle={isMobile ? '' : 'List of Direct Links'}
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
            className="sticky-filter-box mb-05"
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
                      <Typography.Title level={5}>Filter</Typography.Title>
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
                className={isMobile ? 'mb-1 mt-1' : ''}
              >
                <Col flex="auto">
                  <Button
                    type="text"
                    onClick={collapse}
                    style={{
                      display: activeKey === '1' ? 'block' : 'none',
                      background: 'none',
                    }}
                  >
                    <UpOutlined />
                  </Button>
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
          <div className="links custom-table">
            <Table
              className={isMobile ? '' : 'mt-15'}
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
        </>
      )}
      {details && (
        <DirectLinkDetail
          onSave={handleSave}
          onCancel={onCancelItem}
          directLink={selectedLink}
          brands={brands}
          creators={creators}
          productBrands={productBrands}
          setDetails={setDetails}
        />
      )}
    </div>
  );
};

export default DirectLinks;
