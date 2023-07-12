/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Image as AntImage,
  Input,
  Menu,
  PageHeader,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { categoryMapper } from 'helpers/categoryMapper';
import useAllCategories from 'hooks/useAllCategories';
import {
  AllCategories,
  AllCategoriesAPI,
  ProductCategory,
} from 'interfaces/Category';
import { Image } from 'interfaces/Image';
import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from 'contexts/AppContext';
import Highlighter from 'react-highlight-words';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { productCategoriesAPI } from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import scrollIntoView from 'scroll-into-view';
import CategoryDetail from './CategoryDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const { categoriesKeys, categoriesFields } = categoryMapper;

const Categories: React.FC<RouteComponentProps> = ({ location }) => {
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProductCategory, setCurrentProductCategory] =
    useState<ProductCategory>();
  const [index, setIndex] = useState<any>();

  const [loading, setLoading] = useState<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });
  const [selectedTab, setSelectedTab] = useState<string>('Super Category');

  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<Input>(null);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [content, setContent] = useState<any>({
    'Super Category': [],
    Category: [],
    'Sub Category': [],
    'Sub Sub Category': [],
  });
  const [categories, setCategories] = useState<any>([]);
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  useEffect(() => {
    setContent(allCategories);
    setRefreshing(true);
  }, [allCategories]);

  useEffect(() => {
    if (refreshing) {
      setCategories([]);
      setEof(false);
      updateDisplayedArray();
      setRefreshing(false);
    }
  }, [refreshing]);

  const updateDisplayedArray = async () => {
    if (!content[selectedTab].length) return;
    const pageToUse = refreshing ? 0 : page;
    const results = content[selectedTab].slice(
      pageToUse * 10,
      pageToUse * 10 + 10
    );

    setPage(pageToUse + 1);
    setCategories(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    setIsScrollable(details);

    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editProductCategory = (
    index: number,
    searchLevel: number,
    productCategory?: ProductCategory
  ) => {
    setIndex(searchLevel);
    setLastViewedIndex(index);
    setCurrentProductCategory(productCategory);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      const selectedField = categoriesFields[
        categoriesKeys.indexOf(selectedTab)
      ] as keyof AllCategoriesAPI;
      await productCategoriesAPI[
        selectedField as keyof AllCategoriesAPI
      ].delete({
        id,
      });

      const selectedKey = categoriesKeys[
        categoriesKeys.indexOf(selectedTab)
      ] as keyof AllCategoriesAPI;
      let index = -1;

      const contentArray: any[] = Object.values(content);

      for (let i = 0; i < contentArray.length; i++) {
        for (let j = 0; j < contentArray[i].length; j++) {
          if (contentArray[i][j].id === id) {
            index = j;
          }
        }
      }

      setContent((prev: any) => {
        prev[selectedKey] = [
          ...prev[selectedKey].slice(0, index),
          ...prev[selectedKey].slice(index + 1),
        ];
        return prev;
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: any;
      selectedKeys: any;
      confirm: any;
      clearFilters: any;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          allowClear
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="mb-05"
          style={{ display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#212427' : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            ?.toUpperCase()
            .includes(value?.toUpperCase())
        : '',
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.current!.select(), 100);
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<ProductCategory> = [
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
      width: '15%',
      ...getColumnSearchProps(
        categoriesFields[
          categoriesKeys.indexOf(selectedTab)
        ] as keyof ProductCategory
      ),
      render: (_, record: ProductCategory, index: number) => (
        <Link
          to={location.pathname}
          onClick={() =>
            editProductCategory(
              index,
              categoriesKeys.indexOf(selectedTab),
              record
            )
          }
        >
          {
            record[
              categoriesFields[
                categoriesKeys.indexOf(selectedTab)
              ] as keyof ProductCategory
            ]
          }
        </Link>
      ),
      sorter: (a, b) => {
        if (
          a[
            categoriesFields[categoriesKeys.indexOf(selectedTab)] &&
              b[categoriesFields[categoriesKeys.indexOf(selectedTab)]]
          ]
        )
          return a[
            categoriesFields[categoriesKeys.indexOf(selectedTab)]
          ].localeCompare(
            b[categoriesFields[categoriesKeys.indexOf(selectedTab)]]
          );
        else if (a[categoriesFields[categoriesKeys.indexOf(selectedTab)]])
          return 1;
        else if (b[categoriesFields[categoriesKeys.indexOf(selectedTab)]])
          return -1;
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
            <Tooltip title="Image">Image</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'image',
      width: '15%',
      render: (image: Image) => <AntImage src={image?.url} width={70} />,
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
            to={location.pathname}
            onClick={() =>
              editProductCategory(
                index,
                categoriesKeys.indexOf(selectedTab),
                record
              )
            }
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

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setRefreshing(true);
  };

  const refreshItem = (record: ProductCategory, key: string) => {
    setContent((prev: any) => {
      prev[key][lastViewedIndex] = record;
      return prev;
    });
  };

  const onSaveCategory = (record: ProductCategory, key: string) => {
    refreshItem(record, key);
    setDetails(false);
  };

  const onCancelCategory = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div
          className="categories"
          style={{ overflow: 'clip', height: '100%' }}
        >
          <PageHeader
            title="Categories"
            subTitle={isMobile ? '' : 'List of Categories'}
            className="mb-n05"
            extra={[
              <Dropdown
                key="headerDropdown"
                className={isMobile ? 'mt-05' : ''}
                overlay={
                  <Menu>
                    {categoriesKeys.map((key, index) => (
                      <Menu.Item key={index}>
                        <Link
                          to={location.pathname}
                          onClick={() =>
                            editProductCategory(
                              content[key as keyof AllCategories].length,
                              index,
                              undefined
                            )
                          }
                        >
                          {key}
                        </Link>
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={['click']}
              >
                <Button>New Item</Button>
              </Dropdown>,
            ]}
          />
          <Tabs
            className="tab-page"
            onChange={handleTabChange}
            activeKey={selectedTab}
          >
            {categoriesKeys.map(key => (
              <Tabs.TabPane tab={key} key={key}>
                <div className="custom-table">
                  <InfiniteScroll
                    height="32rem"
                    dataLength={categories.length}
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
                      scroll={{ x: true }}
                      rowClassName={(_, index) => `scrollable-row-${index}`}
                      rowKey="id"
                      columns={columns}
                      dataSource={categories}
                      loading={loading || refreshing}
                      pagination={false}
                    />
                  </InfiniteScroll>
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      )}
      {details && (
        <div
          className="categories"
          style={{ overflow: 'scroll', height: '100%' }}
        >
          <CategoryDetail
            index={index}
            category={currentProductCategory}
            onSave={onSaveCategory}
            onCancel={onCancelCategory}
          />
        </div>
      )}
    </>
  );
};

export default Categories;
