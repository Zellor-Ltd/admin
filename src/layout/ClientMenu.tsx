import { FundOutlined, LinkOutlined, MenuOutlined } from '@ant-design/icons';
import { Col, Dropdown, Image, Menu, Row, Tooltip } from 'antd';
import { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

const ClientMenu = () => {
  const history = useHistory();
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string>();
  const [, pathname] = useLocation().pathname.split('/');
  const refreshParent = (path: string) => {
    if (pathname === path) history.go(0);
  };

  const clientMenuItems = (
    <Menu>
      <Menu.Item>
        <Link
          to="/client-dashboard"
          onMouseOver={() => setHoveredMenuItem('Analytics')}
        >
          Analytics
        </Link>
      </Menu.Item>
      <Menu.Item disabled>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="."
          onMouseOver={() => setHoveredMenuItem('Product Catalogue')}
        >
          Product Catalogue
        </a>
      </Menu.Item>
      <Menu.Item disabled>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="."
          onMouseOver={() => setHoveredMenuItem('Video Library')}
        >
          Video Library
        </a>
      </Menu.Item>
      <Menu.Item>
        <Link
          to="/playlists"
          onMouseOver={() => setHoveredMenuItem('Carousels')}
        >
          Carousels
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row justify="space-between" style={{ background: '#211e1e' }}>
      <Col
        span={2}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Dropdown overlay={clientMenuItems}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <Tooltip title={hoveredMenuItem} placement="right">
              <MenuOutlined style={{ fontSize: '1.5rem', color: 'white' }} />
            </Tooltip>
          </a>
        </Dropdown>
      </Col>
      <Col span={22}>
        <Row justify="center">
          <Col style={{ padding: '1rem' }}>
            {/* {getClientLogo()} */}
            <Image
              width={70}
              style={{ position: 'relative', right: '1.5rem' }}
              src="/tmplogoelf.svg"
              preview={false}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ClientMenu;
