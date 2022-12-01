/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  PageHeader,
  Row,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Tag } from 'interfaces/Tag';
import { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from 'contexts/AppContext';
import { RouteComponentProps } from 'react-router-dom';
import { fetchBrands, fetchTags } from 'services/DiscoClubService';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import scrollIntoView from 'scroll-into-view';
import Step2 from './Step2';
import InfiniteScroll from 'react-infinite-scroll-component';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { usePrevious } from 'react-use';

const PushGroupTag: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<Tag[]>([]);
  const [eof, setEof] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [userInput, setUserInput] = useState<string>();
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [tagsPage, setTagsPage] = useState<number>(0);
  const persistentUserInput = usePrevious(userInput);
  const [fetchingTags, setFetchingTags] = useState<boolean>(false);
  const [buffer, setBuffer] = useState<Tag[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const prevPageIsDetails = useRef<boolean>(false);
  const updatingTable = useRef(false);
  const scrolling = useRef(false);
  const mounted = useRef(false);

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const { isMobile, setIsDetails } = useContext(AppContext);

  const tagOptionMapping: SelectOption = {
    key: 'id',
    label: 'tagName',
    value: 'id',
  };

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

  useEffect(() => {
    if (loaded && scrolling.current) setTags([...buffer]);
  }, [buffer]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    prevPageIsDetails.current = false;

    if (!details) {
      prevPageIsDetails.current = true;

      if (tags.length) {
        setUserInput(persistentUserInput);
        setLoaded(true);
      }

      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );

      if (!loaded && buffer.length > tags.length) {
        setTags(buffer);
        setTagsPage(optionsPage);
      }
    }

    setIsDetails(details);
  }, [details]);

  useEffect(() => {
    if (!loaded && tags.length) setLoaded(true);
  }, [tags]);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getBrands();
    searchTags();
  };

  const getBrands = async () => {
    const { results }: any = await doFetch(fetchBrands);
    setBrands(results);
  };

  const columns: ColumnsType<Tag> = [
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
            <Tooltip title="Tag">Tag</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Brand">Brand</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Template">Template</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="DDs">DDs</Tooltip>
          </div>
        </div>
      ),
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
        row.brand.brandName?.toUpperCase().indexOf(brandFilter?.toUpperCase()) >
        -1
    );
  };

  const selectTags = () => {
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

  const handleChangeTag = async (value?: string) => {
    const entity = buffer.filter(tag =>
      tag.id.toUpperCase().includes(value?.toUpperCase() ?? '')
    );
    setTags(entity);
  };

  const searchTags = () => {
    if (buffer.length) {
      setTags(buffer);
      setTagsPage(optionsPage);
    } else loadTags();
  };

  const loadTags = () => {
    if (prevPageIsDetails.current) return;
    updatingTable.current = true;
    setEof(false);
    setFetchingTags(true);

    fetchToBuffer(userInput?.toLowerCase()).then(data => {
      setTags([...buffer].concat(data));
      setFetchingTags(false);
    });
  };

  const fetchToBuffer = async (input?: string, loadNextPage?: boolean) => {
    if (loadNextPage) scrolling.current = true;
    if (userInput !== input) setUserInput(input);
    const pageToUse = updatingTable.current
      ? tagsPage
      : !!loadNextPage
      ? optionsPage
      : 0;

    const response = await doFetch(() =>
      fetchTags({
        page: pageToUse,
        query: input,
        limit: 30,
      })
    );

    if (pageToUse === 0) setBuffer(response.results);
    else setBuffer(prev => [...prev.concat(response.results)]);
    setOptionsPage(pageToUse + 1);
    setTagsPage(pageToUse + 1);

    if (response.results.length < 30 && updatingTable.current) setEof(true);
    updatingTable.current = false;
    scrolling.current = false;

    return response.results;
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && userInput) {
      //buffer was set as input was typed
      setTags(buffer);
      setTagsPage(optionsPage);
    }
  };

  return (
    <div
      style={
        details ? { height: '100%' } : { overflow: 'clip', height: '100%' }
      }
    >
      {!details && (
        <div>
          <PageHeader
            title={isMobile ? 'Push Tags to User Groups' : 'Tags'}
            subTitle={isMobile ? '' : 'Push Tags to user groups'}
            className={isMobile ? 'mb-05' : ''}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="mb-05 sticky-filter-box"
          >
            <Col lg={16} xs={24}>
              <Row gutter={[8, 8]} align="bottom">
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>
                    Search by Tag Name
                  </Typography.Title>
                  <MultipleFetchDebounceSelect
                    disabled={fetchingTags || !brands.length}
                    style={{ width: '100%' }}
                    input={userInput}
                    loaded={loaded}
                    onInput={fetchToBuffer}
                    onChange={handleChangeTag}
                    onClear={() => setUserInput('')}
                    options={buffer}
                    onInputKeyDown={(event: HTMLInputElement) =>
                      handleKeyDown(event)
                    }
                    setEof={setEof}
                    optionMapping={tagOptionMapping}
                    placeholder="Type to search a Tag"
                  ></MultipleFetchDebounceSelect>
                </Col>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    showSearch
                    data={brands}
                    onChange={(_, brand) =>
                      setBrandFilter(brand?.brandName ?? '')
                    }
                    style={{ width: '100%' }}
                    optionMapping={optionMapping}
                    placeholder="Select a Master Brand"
                    disabled={fetchingTags || !brands.length}
                    allowClear
                  ></SimpleSelect>
                </Col>
              </Row>
            </Col>
            <Col lg={8} xs={24}>
              <Row justify="end">
                <Col>
                  <Button
                    className={isMobile ? 'mt-1' : ''}
                    type="primary"
                    disabled={
                      !selectedRowKeys.length || fetchingTags || !brands.length
                    }
                    onClick={selectTags}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <div>
            <InfiniteScroll
              dataLength={tags.length}
              next={loadTags}
              hasMore={!eof}
              loader={
                tagsPage !== 0 &&
                fetchingTags && (
                  <div className="scroll-message">
                    <Spin />
                  </div>
                )
              }
              endMessage={
                loaded && (
                  <div className="scroll-message">
                    <b>End of results.</b>
                  </div>
                )
              }
            >
              <Table
                className="mt-1"
                scroll={{ x: true, y: 300 }}
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowSelection={rowSelection}
                rowKey="id"
                columns={columns}
                dataSource={search(tags)}
                loading={fetchingTags}
                pagination={false}
              />
            </InfiniteScroll>
          </div>
        </div>
      )}
      {details && <Step2 selectedTags={currentTags} onReturn={onReturnStep2} />}
    </div>
  );
};

export default PushGroupTag;
