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

const PushGroupTag: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/step2`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

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

  const handleNext = () => {
    history.push(
      detailsPathname,
      filteredTags.filter(tag => selectedRowKeys.includes(tag.id))
    );
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

  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    onChange: onSelectChange,
  };

  return (
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
            onClick={handleNext}
          >
            Next
          </Button>
        </Col>
      </Row>
      <Table
        rowSelection={rowSelection}
        rowKey="id"
        columns={columns}
        dataSource={filteredTags}
        loading={loading}
      />
    </div>
  );
};

export default PushGroupTag;
