import { Form } from "antd";
import { useState } from "react";
import { RouteComponentProps } from "react-router";

const PromoDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async () => {};

  return null;
};

export default PromoDetail;
