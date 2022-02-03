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
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { categoriesSettings } from 'helpers/utils';
import useAllCategories from 'hooks/useAllCategories';
import {
  AllCategories,
  AllCategoriesAPI,
  ProductCategory,
} from 'interfaces/Category';
import { Image } from 'interfaces/Image';
import { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { Link, RouteComponentProps } from 'react-router-dom';
import { productCategoriesAPI } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import CategoryDetail from './CategoryDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const { categoriesKeys, categoriesFields } = categoriesSettings;

const Categories: React.FC<RouteComponentProps> = ({ location }) => {
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
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
  const [content, setContent] = useState<any>({
    'Super Category': [],
    Category: [],
    'Sub Category': [],
    'Sub Sub Category': [],
  });
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categories, setCategories] = useState<any>({
    'Super Category': [],
    Category: [],
    'Sub Category': [],
    'Sub Sub Category': [],
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
      setCategories(prev => [...(prev[selectedTab] = [])]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing, selectedTab]);

  const fetchData = async () => {
    if (!content[selectedTab].length) return;
    const pageToUse = refreshing ? 0 : page;
    const results = content[selectedTab].slice(
      pageToUse * 10,
      pageToUse * 10 + 10
    );

    setPage(pageToUse + 1);
    setCategories(prev => [...prev[selectedTab].concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
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

      let selectedKeyIndex = -1;
      let index = -1;

      switch (selectedKey.toString) {
        case () => 'Super Category':
          selectedKeyIndex = 0;
          break;
        case () => 'Category':
          selectedKeyIndex = 1;
          break;
        case () => 'Sub Category':
          selectedKeyIndex = 2;
          break;
        case () => 'Sub Sub Category':
          selectedKeyIndex = 3;
          break;
      }

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
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
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
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
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
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
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
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: '15%',
      render: (image: Image) => <AntImage src={image?.url} width={70} />,
    },
    {
      title: 'Actions',
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
        <div className="categories">
          <PageHeader
            title="Categories"
            subTitle="List of categories"
            extra={[
              <Dropdown
                overlay={
                  <Menu>
                    {categoriesKeys.map((key, index) => (
                      <Menu.Item>
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
          <Tabs onChange={handleTabChange} activeKey={selectedTab}>
            {categoriesKeys.map(key => (
              <Tabs.TabPane tab={key} key={key}>
                <InfiniteScroll
                  dataLength={categories[key as keyof AllCategories].length}
                  next={fetchData}
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
                    rowKey="id"
                    columns={columns}
                    dataSource={categories[key as keyof AllCategories]}
                    loading={loading || refreshing}
                    pagination={false}
                  />
                </InfiniteScroll>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      )}
      {details && (
        <CategoryDetail
          index={index}
          category={currentProductCategory}
          onSave={onSaveCategory}
          onCancel={onCancelCategory}
        />
      )}
    </>
  );
};

export default Categories;
