import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Collapse,
  Input,
  List,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Tabs,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import { discoBrandId } from '../../helpers/constants';
import { Brand } from '../../interfaces/Brand';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteBrand,
  fetchBrands,
  saveBrand,
} from '../../services/DiscoClubService';
import { SimpleSwitch } from '../../components/SimpleSwitch';
import scrollIntoView from 'scroll-into-view';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';
import { useMount } from 'react-use';
import ReactJson from 'react-json-view';
import Item from 'antd/lib/list/Item';

const { Panel } = Collapse;

const DataManagement: React.FC<RouteComponentProps> = ({}) => {
  const [currentActiveKey, setCurrentActiveKey] = useState<string>('');
  const [newTabIndex, setNewTabIndex] = useState<number>(0);
  const [panes, setPanes] = useState<any>([{}]);
  const [tabContent, setTabContent] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });

  useMount(() => {
    panes.pop();
  });

  const procedures = [
    <Button
      onClick={() => add('GetApiToken')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; GetApiToken
    </Button>,
    <Button
      onClick={() => add('Brand/ImportProducts')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; Brand/ImportProducts
    </Button>,
    <Button
      onClick={() => add('Brand/UpdateStock')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; Brand/UpdateStock
    </Button>,
    <Button
      onClick={() => add('RebuildCategoriesTree')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; RebuildCategoriesTree
    </Button>,
    <Button
      onClick={() => add('RebuildCategoriesTreeAllCreators')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; RebuildCategoriesTreeAllCreators
    </Button>,
    <Button
      onClick={() => add('RebuildCategoriesTreeAllProductBrands')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; RebuildCategoriesTreeAllProductBrands
    </Button>,
    <Button
      onClick={() => add('RebuildCategoriesTreeAllBrands')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; RebuildCategoriesTreeAllBrands
    </Button>,
    <Button
      onClick={() => add('ProductBrand/Rebuild')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; ProductBrand/Rebuild
    </Button>,
    <Button
      onClick={() => add('ProductBrand/RebuildAllBrands')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; ProductBrand/RebuildAllBrands
    </Button>,
    <Button
      onClick={() => add('ProductBrand/RebuildAllCreators')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; ProductBrand/RebuildAllCreators
    </Button>,
    <Button
      onClick={() => add('Brand/Propagate')}
      type="text"
      style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
    >
      <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
      &zwnj; Brand/Propagate
    </Button>,
  ];

  const add = async title => {
    const { results }: any = await doFetch(fetchBrands);
    setNewTabIndex(prev => prev++);
    setCurrentActiveKey(title);
    if (panes.find(item => item.key === currentActiveKey)) return;
    const newPanes = [...panes];
    newPanes.push({
      title: title,
      content: (
        <div className="json-container">
          <ReactJson src={results} />
        </div>
      ),
      key: currentActiveKey,
    });
    setPanes(newPanes);
  };

  const remove = targetKey => {
    setCurrentActiveKey(targetKey);
    setNewTabIndex(prev => prev--);
    const newPanes = [...panes];
    newPanes.splice(targetKey, 1);
    setPanes(newPanes);
  };

  const onChange = activeKey => {
    console.log(activeKey);
    setCurrentActiveKey(activeKey);
  };

  const onEdit = (targetKey, action) => {
    remove(targetKey);
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={24} className="mb-1">
          <PageHeader title="Data Management" />
        </Col>
        <Col span={8} className="batch-process">
          <Collapse ghost>
            <Panel header="Procedures" key="1">
              <List
                size="small"
                dataSource={procedures}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Panel>
          </Collapse>
        </Col>
        <Col span={16}>
          <Tabs
            hideAdd
            type="editable-card"
            onChange={currentActiveKey => onChange(currentActiveKey)}
            activeKey={currentActiveKey as unknown as string}
            onEdit={onEdit}
          >
            {panes.map(pane => (
              <Tabs.TabPane
                forceRender
                tab={pane.title}
                key={pane.key}
                closable={true}
                className="requests"
              >
                {pane.content}
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Col>
      </Row>
    </>
  );
};

export default DataManagement;
