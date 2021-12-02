import { PageHeader, Typography } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import './Preview.scss';

const Preview: React.FC = () => {
  return (
    <div className="preview">
      <PageHeader title="Preview" />
      <div className="content-center">
        <div className="content-column">
          <iframe
            src="https://preview.discoclub.com"
            id="mobile-preview"
            title="mobile-preview"
          />
          <Typography.Text mark>
            It's interactive! <SmileOutlined />
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default Preview;
