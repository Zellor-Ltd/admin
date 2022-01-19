import { Button, Col, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Tag } from 'interfaces/Tag';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchBrands, fetchTags } from 'services/DiscoClubService';
import SimpleSelect from 'components/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import scrollIntoView from 'scroll-into-view';
import Step2 from './Step2';

const PushGroupTag: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTags, setCurrentTags] = useState<Tag[]>([]);

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const {
    setArrayList: setTags,
    filteredArrayList: filteredTags,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Tag>([]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editTags = () => {
    setCurrentTags(
      filteredTags.filter(tag => selectedRowKeys.includes(tag.id))
    );
    setDetails(true);
  };

  const getBrands = async () => {
    setLoading(true);
    setIsFetchingBrands(true);
    const response: any = await fetchBrands();
    setLoading(false);
    setIsFetchingBrands(false);
    setBrands(response.results);
  };

  const getTags = async () => {
    const { results } = await doFetch(() => fetchTags({}));
    setTags(results);
  };

  const getResources = async () => {
    await getBrands();
    await getTags();
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<Tag> = [
    { title: 'Tag', dataIndex: 'tagName', width: '25%' },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      width: '20%',
    },
    { title: 'Brand', dataIndex: ['brand', 'brandName'], width: '20%' },
    { title: 'Template', dataIndex: 'template', width: '15%' },
    { title: "DD's", dataIndex: 'discoDollars', width: '10%' },
  ];

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('tagName', tags =>
      tags.filter(tag =>
        tag.tagName.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction('brandName');
      return;
    }
    addFilterFunction('brandName', tags =>
      tags.filter(tag => tag.brand?.brandName === _selectedBrand.brandName)
    );
  };

  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeys);
    setLastViewedIndex(filteredTags.indexOf(selectedRows[0]));
  };

  const rowSelection = {
    onChange: onSelectChange,
  };

  const onReturnStep2 = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader title="Tags" subTitle="Push tags to groups of users" />
          <Row align="bottom" justify="space-between">
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={8} xs={16}>
                  <SearchFilter
                    filterFunction={searchFilterFunction}
                    label="Search by Tag Name"
                  />
                </Col>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    data={brands}
                    onChange={(_, brand) => onChangeBrand(brand)}
                    style={{ width: '100%' }}
                    selectedOption={''}
                    optionsMapping={optionsMapping}
                    placeholder={'Select a master brand'}
                    loading={isFetchingBrands}
                    disabled={isFetchingBrands}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
              </Row>
            </Col>
            <Col style={{ marginBottom: '20px', marginRight: '25px' }}>
              <Button
                type="primary"
                disabled={!selectedRowKeys.length}
                onClick={editTags}
              >
                Next
              </Button>
            </Col>
          </Row>
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowSelection={rowSelection}
            rowKey="id"
            columns={columns}
            dataSource={filteredTags}
            loading={loading}
          />
        </div>
      )}
      {details && <Step2 selectedTags={currentTags} onReturn={onReturnStep2} />}
    </>
  );
};

export default PushGroupTag;
