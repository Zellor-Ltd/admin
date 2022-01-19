import { Upload } from 'components';
import { Button, Form, message, Spin } from 'antd';
import EditableTable, {
  EditableColumnType,
} from '../../components/EditableTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from '../../hooks/useRequest';
import { Brand } from '../../interfaces/Brand';
import { Product } from '../../interfaces/Product';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  details: boolean;
  setDetails: Function;
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
  onSaveChanges: (entity: Product) => Promise<void>;
  lastViewedIndex: any;
}

const AlternatePreviewList: React.FC<AlternatePreviewListProps> = ({
  setViewName,
  details,
  setDetails,
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
  onSaveChanges,
  lastViewedIndex,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const [eof, setEof] = useState<boolean>(false);

  // TODO: THIS IS A WORKAROUND TO FORCE THE RERENDER. IT MUST BE REMOVED ASAP
  const [forceRerenderWorkaround, setForceRerenderWorkaround] = useState(false);

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
    products[lastViewedIndex.current] = record;
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

  const handleThumbnailOrTagReplacement = (
    prevImage: Image,
    record: Product
  ) => {
    if (!record.image.some(img => img.url === prevImage.url)) {
      record.image.push(prevImage);
    }
  };

  const onAssignToTag = (file: any, record: Product) => {
    let imageData = file;
    if (file.response) {
      imageData = {
        uid: file.uid,
        url: file.response.result,
      };
    }
    const prevTag = record.tagImage;
    handleThumbnailOrTagReplacement(prevTag, record);
    record.tagImage = { ...imageData };
    setForceRerenderWorkaround(prev => !prev);
  };

  const onAssignToThumbnail = (file: any, record: Product) => {
    let imageData = file;
    if (file.response) {
      imageData = {
        uid: file.uid,
        url: file.response.result,
      };
    }
    const prevThumb = record.thumbnailUrl;
    handleThumbnailOrTagReplacement(prevThumb, record);
    record.thumbnailUrl = { ...imageData };
    setForceRerenderWorkaround(prev => !prev);
  };

  const onRollback = (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number,
    entity: Product
  ) => {
    if (entity) {
      switch (sourceProp) {
        case 'image':
          entity[sourceProp][imageIndex].url = oldUrl;
          break;
        default:
          entity[sourceProp].url = oldUrl;
      }

      setForceRerenderWorkaround(prev => !prev);
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
      setForceRerenderWorkaround(prev => !prev);
    }
  };

  const onImageChange = (
    image: Image,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    record: Product,
    removed?: boolean
  ) => {
    if (removed) {
      switch (sourceProp) {
        case 'image':
          record[sourceProp] = record[sourceProp].filter(
            img => img.uid !== image.uid
          );
          break;
        default:
          record[sourceProp] = undefined as any;
      }
    } else {
      switch (sourceProp) {
        case 'image':
          record[sourceProp] = [...(record[sourceProp] || []), image];
          break;
        default:
          record[sourceProp] = image;
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
      render: (_, record) => (
        <Form.Item>
          <Upload.ImageUpload
            fileList={record.tagImage}
            formProp="tagImage"
            form={form}
            onFitTo={(fitTo, sourceProp, imageIndex) => {
              onFitTo(fitTo, sourceProp, imageIndex, record);
            }}
            onRollback={(oldUrl, sourceProp, imageIndex) =>
              onRollback(oldUrl, sourceProp, imageIndex, record)
            }
            onImageChange={(image, sourceProp, removed) =>
              onImageChange(image, sourceProp, record, removed)
            }
          />
        </Form.Item>
      ),
    },
    {
      title: 'Thumbnail',
      dataIndex: ['thumbnailUrl'],
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Form.Item>
          <Upload.ImageUpload
            fileList={record.thumbnailUrl}
            formProp="thumbnailUrl"
            form={form}
            onFitTo={(fitTo, sourceProp, imageIndex) => {
              onFitTo(fitTo, sourceProp, imageIndex, record);
            }}
            onRollback={(oldUrl, sourceProp, imageIndex) =>
              onRollback(oldUrl, sourceProp, imageIndex, record)
            }
            onImageChange={(image, sourceProp, removed) =>
              onImageChange(image, sourceProp, record, removed)
            }
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
      render: (_, record) => {
        return (
          <div className="images-wrapper">
            <div className="images-content">
              <Form.Item>
                <Upload.ImageUpload
                  maxCount={20}
                  fileList={record.image}
                  formProp="image"
                  form={form}
                  onAssignToTag={file => onAssignToTag(file, record)}
                  onAssignToThumbnail={file =>
                    onAssignToThumbnail(file, record)
                  }
                  cropable={true}
                  scrollOverflow={true}
                  onImageChange={(image, sourceProp, removed) =>
                    onImageChange(image, sourceProp, record, removed)
                  }
                  onRollback={(oldUrl, sourceProp, imageIndex) =>
                    onRollback(oldUrl, sourceProp, imageIndex, record)
                  }
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
      render: (_, record, index) => (
        <>
          <Button
            type="primary"
            loading={loading}
            onClick={() => saveChanges(record, index)}
          >
            Save Changes
          </Button>
          <Button
            onClick={() => handleStage(record.id)}
            type="primary"
            style={{ margin: '0.5rem' }}
            className="success-button"
          >
            Promote
          </Button>
        </>
      ),
    },
  ];

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), 'Product commited.');
    await getProducts(true);
  };

  const saveChanges = async (record: Product, index: number) => {
    setLoading(true);
    lastViewedIndex.current = index;
    await onSaveChanges(record);
    setLoading(false);
  };

  const editProduct = (record: Product, index: number) => {
    previousViewName.current = 'alternate';
    setCurrentProduct(record);
    lastViewedIndex.current = index;
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
    setDetails(true);
  };

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex.current}`
        ) as HTMLElement
      );
    }
  }, [details]);

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
              index === lastViewedIndex.current ? 'selected-row' : ''
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
