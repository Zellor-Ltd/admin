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

  const request: (
    action: action,
    successMsg?: string,
    completeResponse?: boolean
  ) => Promise<{ results: any[]; result: any }> = async (
    action,
    successMsg,
    completeResponse
  ) => {
    _setLoadingHandler(true);
    try {
      const response = await action();
      const { results = [], result } = response;
      if (successMsg) message.success(successMsg);
      _setLoadingHandler(false);
      return completeResponse ? response : { results, result };
    } catch (error) {
      _setLoadingHandler(false);
      if (completeResponse) return error;
      throw error;
    }
  };

  const doFetch = (action: action) => request(action);
  const doRequest = (
    action: action,
    successMsg: string = "Register updated with success."
  ) => request(action, successMsg);
  const doAPITest = (action: action) => request(action, "Test Passed.", true);

  return { doFetch, doRequest, doAPITest, loading: _loading };
};
