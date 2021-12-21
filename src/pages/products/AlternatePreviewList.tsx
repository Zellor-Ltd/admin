import { ArrowRightOutlined } from '@ant-design/icons';
import { Upload } from 'components';
import { Button, Form, message, Spin } from 'antd';
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
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(0);

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

  const refreshItem = (record: Product) => {
    products[lastViewedIndex] = record;
    setProducts([...products]);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const product = form.getFieldsValue(true);

      const response = (await saveStagingProduct(product)) as any;
      refreshItem(response.result);

      message.success('Register updated with success.');
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
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

  const onAssignToTag = (file: Image, record: Product) => {
    if (record) {
      record.tagImage = { ...file };
    }
  };

  const onAssignToThumbnail = (file: Image, record: Product) => {
    if (record) {
      record.thumbnailUrl = { ...file };
    }
  };

  const onFitTo = (
    fitTo: 'w' | 'h',
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number,
    record: any
  ) => {
    if (!sourceProp) {
      throw new Error('missing sourceProp parameter');
    }
    if (record) {
      switch (sourceProp) {
        case 'image':
          if (record[sourceProp][imageIndex].fitTo === fitTo) {
            record[sourceProp][imageIndex].fitTo = undefined;
          } else {
            record[sourceProp][imageIndex].fitTo = fitTo;
          }
          break;
        default:
          if (record[sourceProp].fitTo === fitTo) {
            record[sourceProp].fitTo = undefined;
          } else {
            record[sourceProp].fitTo = fitTo;
          }
      }
    }
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
      width: '10%',
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
      render: (value: Image, record) => (
        <Form.Item>
          <Upload.ImageUpload
            fileList={value}
            formProp="tagImage"
            form={form}
            onFitTo={(fitTo, sourceProp, imageIndex) => {
              onFitTo(fitTo, sourceProp, imageIndex, record);
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Thumbnail',
      dataIndex: ['thumbnailUrl'],
      width: '15%',
      align: 'center',
      render: (value: Image, record) => (
        <Form.Item>
          <Upload.ImageUpload
            fileList={value}
            formProp="thumbnailUrl"
            form={form}
            onFitTo={(fitTo, sourceProp, imageIndex) => {
              onFitTo(fitTo, sourceProp, imageIndex, record);
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Image',
      dataIndex: ['image'],
      width: '40%',
      align: 'left',
      ellipsis: true,
      render: (value: any) => {
        return (
          <div className="images-wrapper">
            <div className="images-content">
              <Form.Item>
                <Upload.ImageUpload
                  maxCount={20}
                  fileList={value}
                  formProp="image"
                  form={form}
                  onAssignToTag={onAssignToTag}
                  onAssignToThumbnail={onAssignToThumbnail}
                  cropable={true}
                  scrollOverflow={true}
                />
              </Form.Item>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '15%',
      align: 'center',
      render: (_, record: Product) => (
        <>
          <Button
            disabled={record.brand.automated === true}
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Save Changes
          </Button>
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
    <Form
      form={form}
      name="productForm"
      onFinish={onFinish}
      onFinishFailed={({ errorFields }) => {
        errorFields.forEach(errorField => {
          message.error(errorField.errors[0]);
        });
      }}
    >
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
    </Form>
  );
};

export default AlternatePreviewList;
