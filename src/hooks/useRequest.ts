import { message } from "antd";
import React, { useState } from "react";

type action = () => Promise<any>;

export const useRequest = ({
  setLoading = () => {},
}: {
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
} = {}) => {
  const [_loading, _setLoading] = useState<boolean>(false);

  const _setLoadingHandler = (v: boolean) => {
    _setLoading(v);
    setLoading(v);
  };

  const request = async (action: action, successMsg?: string) => {
    _setLoadingHandler(true);
    try {
      const { results = [] } = await action();
      if (successMsg) message.success(successMsg);
      _setLoadingHandler(false);
      return results;
    } catch (error) {
      _setLoadingHandler(false);
      throw error;
    }
  };

  const doFetch = (action: action) => request(action);
  const doRequest = (
    action: action,
    successMsg: string = "Register updated with success."
  ) => request(action, successMsg);

  return { doFetch, doRequest, loading: _loading };
};
