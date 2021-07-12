import { message } from "antd";
import React, { useState } from "react";

export const useRequest = ({
  setLoading = () => {},
  successMsg = "Register updated with success.",
}: {
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  successMsg?: string;
}) => {
  const [_loading, _setLoading] = useState<boolean>(false);

  const _setLoadingHandler = (v: boolean) => {
    _setLoading(v);
    setLoading(v);
  };

  const doRequest = async (action: () => Promise<any>) => {
    _setLoadingHandler(true);
    try {
      const { results }: { results: any[] } = await action();
      message.success(successMsg);
      _setLoadingHandler(false);
      return results;
    } catch (error) {
      _setLoadingHandler(false);
      throw error;
    }
  };

  return { doRequest, loading: _loading };
};
