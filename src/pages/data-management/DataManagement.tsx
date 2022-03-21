import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
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
import React from 'react';
import { setFlagsFromString } from 'v8';
import index from 'components/upload';

const { Panel } = Collapse;

const DataManagement: React.FC<RouteComponentProps> = ({}) => {
  const [currentActiveKey, setCurrentActiveKey] = useState<string>('');
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [newTabIndex, setNewTabIndex] = useState<number>(0);
  const [panes, setPanes] = useState<any>([{}]);
  const [tabContent, setTabContent] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);
  const [result, setResult] = useState<any[]>([]);
  const [input, setInput] = useState<any>();
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useMount(() => {
    panes.pop();
  });

  useEffect(() => {
    setPanes(panes);
  }, [currentActiveKey]);

  useEffect(() => {
    if (input) {
      asyncSetCurrentActiveKey(input);
      setInput(undefined);
    }
  }, [input]);

  const asyncSetCurrentActiveKey = (input: any) => {
    try {
      setLoading(true);
      setCurrentActiveKey(input);
      setActiveTabIndex(panes.indexOf(panes.find(item => item.key === input)));
    } catch (error: any) {
      console.log(error.error);
    }
  };

  const add = async title => {
    setInput(title);
    const { results }: any = await doFetch(fetchBrands);
    setActiveTabIndex(panes.length);
    asyncSetCurrentActiveKey(title);
    if (panes.find(item => item.title === title)) return;
    const newPanes = [...panes];
    newPanes.push({
      title: title,
      content: (
        <div className="json-container">
          <ReactJson src={results} />
        </div>
      ),
      key: title,
    });
    setPanes(newPanes);
    setLoading(false);
  };

  const remove = targetKey => {
    const index = panes.indexOf(panes.find(pane => pane.key === targetKey));
    try {
      const newPanes = panes.filter(pane => pane.key !== targetKey);
      setLoading(false);
      setCurrentActiveKey(index === 0 ? '' : panes[index - 1].key);
      setPanes(newPanes);
    } catch (error: any) {
      console.log(error.error);
    }
  };

  const onChange = activeKey => {
    setCurrentActiveKey(activeKey);
    setActiveTabIndex(
      panes.indexOf(panes.find(item => item.key === activeKey))
    );
  };

  const onEdit = (targetKey, action) => {
    action === 'remove' ? remove(targetKey) : add(targetKey);
  };

  const procedures = [
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'GetApiToken'}
    >
      <Button
        onClick={() => add('GetApiToken')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; GetApiToken
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'Brand/ImportProducts'}
    >
      <Button
        onClick={() => add('Brand/ImportProducts')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; Brand/ImportProducts
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'Brand/UpdateStock'}
    >
      <Button
        onClick={() => add('Brand/UpdateStock')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; Brand/UpdateStock
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'RebuildCategoriesTree'}
    >
      <Button
        onClick={() => add('RebuildCategoriesTree')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; RebuildCategoriesTree
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={
        loading && currentActiveKey === 'RebuildCategoriesTreeAllCreators'
      }
    >
      <Button
        onClick={() => add('RebuildCategoriesTreeAllCreators')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; RebuildCategoriesTreeAllCreators
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={
        loading && currentActiveKey === 'RebuildCategoriesTreeAllProductBrands'
      }
    >
      <Button
        onClick={() => add('RebuildCategoriesTreeAllProductBrands')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; RebuildCategoriesTreeAllProductBrands
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={
        loading && currentActiveKey === 'RebuildCategoriesTreeAllBrands'
      }
    >
      <Button
        onClick={() => add('RebuildCategoriesTreeAllBrands')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; RebuildCategoriesTreeAllBrands
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'ProductBrand/Rebuild'}
    >
      <Button
        onClick={() => add('ProductBrand/Rebuild')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; ProductBrand/Rebuild
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'ProductBrand/RebuildAllBrands'}
    >
      <Button
        onClick={() => add('ProductBrand/RebuildAllBrands')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; ProductBrand/RebuildAllBrands
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={
        loading && currentActiveKey === 'ProductBrand/RebuildAllCreators'
      }
    >
      <Button
        onClick={() => add('ProductBrand/RebuildAllCreators')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; ProductBrand/RebuildAllCreators
      </Button>
    </Spin>,
    <Spin
      indicator={antIcon}
      spinning={loading && currentActiveKey === 'Brand/Propagate'}
    >
      <Button
        onClick={() => add('Brand/Propagate')}
        type="text"
        style={{ display: 'flex', alignItems: 'baseline', fontSize: '.95em' }}
      >
        <span style={{ color: '#67e6a9', fontSize: '.75em' }}>GET</span>&zwnj;
        &zwnj; Brand/Propagate
      </Button>
    </Spin>,
  ];

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
