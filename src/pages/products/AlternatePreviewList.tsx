import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Form, Popconfirm, Spin } from 'antd';
import EditableTable, {
  EditableColumnType,
} from '../../components/EditableTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from '../../hooks/useRequest';
import { Brand } from '../../interfaces/Brand';
import { Product } from '../../interfaces/Product';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteStagingProduct,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from '../../services/DiscoClubService';
import ProductExpandedRow from './ProductExpandedRow';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import { useSelector } from 'react-redux';
import { ProductBrand } from '../../interfaces/ProductBrand';
import { Image } from '../../interfaces/Image';
import scrollIntoView from 'scroll-into-view';

interface AlternatePreviewListProps {
  setViewName: Function;
  isEditing: boolean;
  setIsEditing: Function;
  loaded: boolean;
  products: Product[];
  setProducts: Function;
  productBrands: ProductBrand[];
  currentProduct?: Product;
  setCurrentProduct: Function;
  setCurrentMasterBrand: Function;
  setCurrentProductBrand: Function;
  page: number;
  setPage: Function;
  brandFilter?: Brand;
  searchFilter?: string;
  unclassifiedFilter?: boolean;
  productBrandFilter?: ProductBrand;
  outOfStockFilter?: boolean;
  productStatusFilter?: string;
  refreshing: boolean;
  setRefreshing: Function;
  allCategories: any;
  previousViewName: any;
}

const AlternatePreviewList: React.FC<AlternatePreviewListProps> = ({
  setViewName,
  isEditing,
  setIsEditing,
  loaded,
  products,
  setProducts,
  productBrands,
  currentProduct,
  setCurrentProduct,
  setCurrentMasterBrand,
  setCurrentProductBrand,
  page,
  setPage,
  brandFilter,
  searchFilter,
  unclassifiedFilter,
  productBrandFilter,
  outOfStockFilter,
  productStatusFilter,
  refreshing,
  setRefreshing,
  allCategories,
  previousViewName,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);

  const [eof, setEof] = useState<boolean>(false);

  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const refreshProducts = async () => {
    setSelectedRowKeys([]);
    setPage(0);
    setRefreshing(true);
  };

  useEffect(() => {
    if (loaded) {
      refreshProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, brandFilter]);

  const _fetchStagingProducts = async searchButton => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchStagingProducts({
        limit: 30,
        page: pageToUse,
        brandId: brandFilter?.id,
        query: searchFilter,
        unclassified: unclassifiedFilter,
        productBrandId: productBrandFilter?.id,
        outOfStock: outOfStockFilter,
        status: productStatusFilter,
      })
    );
    if (searchButton) {
      setPage(0);
    } else {
      setPage(pageToUse + 1);
    }
    if (response.results.length < 30) setEof(true);
    return response;
  };

  const getProducts = async searchButton => {
    const { results } = await doFetch(() =>
      _fetchStagingProducts(searchButton)
    );
    setProducts(results);
  };

  useEffect(() => form.resetFields(), [currentProduct]);

  const deleteItem = async (_id: string) => {
    await doRequest(() => deleteStagingProduct(_id));
    setProducts([...products.splice(lastViewedIndex, 1)]);
  };

  const fetchData = async searchButton => {
    if (products) {
      if (!products.length) return;
      const { results } = await _fetchStagingProducts(searchButton);
      setProducts(prev => [...prev.concat(results)]);
    }
  };

  const onSaveCategories = async (record: Product) => {
    await saveCategories(() => saveStagingProduct(record));
    await getProducts(true);
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveStagingProduct(record));
    await getProducts(true);
  };

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), 'Product commited.');
    await getProducts(true);
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
      render: (value: string, record: Product, index: number) => (
        <Link
          onClick={() => editProduct(record, index)}
          to={{ pathname: window.location.pathname, state: record }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Tag Image',
      dataIndex: ['tagImage'],
      width: '15%',
      align: 'center',
      render: (value: Image) => (
        <img style={{ maxWidth: 100, maxHeight: 100 }} src={value.url} />
      ),
    },
    {
      title: 'Thumbnail',
      dataIndex: ['thumbnailUrl'],
      width: '6%',
      align: 'center',
      render: (value: Image) => (
        <img style={{ maxWidth: 100, maxHeight: 100 }} src={value.url} />
      ),
    },
    {
      title: 'Image',
      dataIndex: ['image'],
      width: '45%',
      align: 'left',
      render: (value: any) => {
        const images = value.map(item => {
          return (
            <img style={{ maxWidth: 100, maxHeight: 100 }} src={item.url} />
          );
        });
        return images;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '12%',
      align: 'right',
      render: (_, record: Product, index: number) => (
        <>
          <Link
            onClick={() => editProduct(record, index)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button
              type="link"
              style={{ padding: 0, marginLeft: 8 }}
              disabled={record.lastGoLiveDate != null}
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>
          <Button
            onClick={() => handleStage(record.id)}
            type="link"
            style={{ color: 'green', padding: 0, margin: 6 }}
          >
            <ArrowRightOutlined />
          </Button>
        </>
      ),
    },
  ];

  const editProduct = (record: Product, index) => {
    previousViewName.current = 'alternate';
    setCurrentProduct(record);
    setLastViewedIndex(index);
    setCurrentMasterBrand(record.brand.brandName);
    if (record.productBrand) {
      if (typeof record.productBrand === 'string') {
        setCurrentProductBrand(record.productBrand);
      } else {
        setCurrentProductBrand(record.productBrand.brandName);
      }
    } else {
      setCurrentProductBrand('');
    }
    setViewName('default');
    setIsEditing(true);
  };

  useEffect(() => {
    if (!isEditing) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [isEditing]);

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={() => fetchData(false)}
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
      <EditableTable
        rowClassName={(_, index) =>
          `scrollable-row-${index} ${
            index === lastViewedIndex ? 'selected-row' : ''
          }`
        }
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
        onSave={onSaveProduct}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        expandable={{
          expandedRowRender: (record: Product) => (
            <ProductExpandedRow
              key={record.id}
              record={record}
              allCategories={allCategories}
              onSaveProduct={onSaveCategories}
              loading={loadingCategories}
              isStaging={true}
              productBrands={productBrands}
            ></ProductExpandedRow>
          ),
        }}
      />
    </InfiniteScroll>
  );
};

export default AlternatePreviewList;
