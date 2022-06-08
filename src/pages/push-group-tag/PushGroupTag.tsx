import {
  Button,
  Col,
  Collapse,
  Input,
  PageHeader,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Tag } from 'interfaces/Tag';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchBrands, fetchTags } from 'services/DiscoClubService';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import scrollIntoView from 'scroll-into-view';
import Step2 from './Step2';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SearchOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const PushGroupTag: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<Tag[]>([]);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagFilter, setTagFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [content, setContent] = useState<Tag[]>([]);

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getBrands();
    await getTags();
  };

  const getBrands = async () => {
    setIsFetchingBrands(true);
    const { results }: any = await doFetch(fetchBrands);
    setIsFetchingBrands(false);
    setBrands(results);
  };

  const getTags = async () => {
    const { results } = await doFetch(() => fetchTags({}));
    setContent(results);
    setRefreshing(true);
  };

  const updateDisplayedArray = () => {
    if (!content.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = content.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setTags(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setTags([]);
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

      if (search(tags).length < 10) setEof(true);
    }
  }, [details, tags]);

  const columns: ColumnsType<Tag> = [
    {
      title: 'Tag',
      dataIndex: 'tagName',
      width: '25%',
      sorter: (a, b): any => {
        if (a.tagName && b.tagName) return a.tagName.localeCompare(b.tagName);
        else if (a.tagName) return -1;
        else if (b.tagName) return 1;
        else return 0;
      },
    },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      width: '20%',
      sorter: (a, b): any => {
        if (a.product && b.product)
          return a.product.name?.localeCompare(b.product.name);
        else if (a.product) return -1;
        else if (b.product) return 1;
        else return 0;
      },
    },
    {
      title: 'Brand',
      dataIndex: ['brand', 'brandName'],
      width: '20%',
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.brandName?.localeCompare(b.brand.brandName);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
        else return 0;
      },
    },
    {
      title: 'Template',
      dataIndex: 'template',
      width: '15%',
      sorter: (a, b): any => {
        if (a.template && b.template)
          return a.template.localeCompare(b.template);
        else if (a.template) return -1;
        else if (b.template) return 1;
        else return 0;
      },
    },
    {
      title: "DD's",
      dataIndex: 'discoDollars',
      width: '10%',
      sorter: (a, b): any => {
        if (a.discoDollars && b.discoDollars)
          return a.discoDollars - b.discoDollars;
        else if (a.discoDollars) return -1;
        else if (b.discoDollars) return 1;
        else return 0;
      },
    },
  ];

  const search = rows => {
    return rows.filter(
      row =>
        row.tagName.toLowerCase().indexOf(tagFilter) > -1 &&
        row.brand.brandName.indexOf(brandFilter) > -1
    );
  };

  const editTags = () => {
    setCurrentTags(tags.filter(tag => selectedRowKeys.includes(tag.id)));
    setDetails(true);
  };

  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeys);
    setLastViewedIndex(tags.indexOf(selectedRows[0]));
  };

  const rowSelection = {
    onChange: onSelectChange,
  };

  const onReturnStep2 = () => {
    setDetails(false);
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]}>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                placeholder="Search by Tag Name"
                suffix={<SearchOutlined />}
                value={tagFilter}
                onChange={event => {
                  setTagFilter(event.target.value);
                }}
              />
            </Col>
            <Col lg={6} xs={24} className={isMobile ? 'mb-05' : ''}>
              <Typography.Title level={5}>Master Brand</Typography.Title>
              <SimpleSelect
                data={brands}
                onChange={(_, brand) => setBrandFilter(brand?.brandName ?? '')}
                style={{ width: '100%' }}
                optionsMapping={optionsMapping}
                placeholder={'Select a Master Brand'}
                loading={isFetchingBrands}
                disabled={isFetchingBrands}
                allowClear={true}
              ></SimpleSelect>
            </Col>
          </Row>
        </Col>
      </>
    );
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title={isMobile ? 'Push Tags to User Groups' : 'Tags'}
            subTitle={isMobile ? '' : 'Push Tags to user groups'}
            className={isMobile ? 'mb-n1' : ''}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="mb-1 sticky-filter-box"
          >
            {isMobile && (
              <Col span={24}>
                <Collapse ghost className="custom-collapse mt-05">
                  <Panel header="Filter Search" key="1">
                    <Filters />
                  </Panel>
                </Collapse>
              </Col>
            )}
            {!isMobile && <Filters />}
            <Col xs={24}>
              <Row justify="end">
                <Col>
                  <Button
                    className={isMobile ? 'mt-1' : ''}
                    type="primary"
                    disabled={!selectedRowKeys.length}
                    onClick={editTags}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={tags.length}
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
              rowSelection={rowSelection}
              rowKey="id"
              columns={columns}
              dataSource={search(tags)}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && <Step2 selectedTags={currentTags} onReturn={onReturnStep2} />}
    </>
  );
};

export default PushGroupTag;
