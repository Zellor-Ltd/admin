import { useReducer } from "react";

interface FilterFnPayload {
  key: string;
}

interface AddFilterFnPayload extends FilterFnPayload {
  fn: (arrayList: any[]) => any[];
}

const useFilter = () => {
  const reducer = (state: any, action: any) => {
    const getNewState = (state: any, action: any) => {
      switch (action.type) {
        case "SET_ARRAY_LIST":
          return { ...state, arrayList: action.payload };
        case "ADD_FILTER_FUNCTION": {
          const { key, fn }: AddFilterFnPayload = action.payload;
          state.filterFunctions[key] = fn;
          return { ...state };
        }
        case "REMOVE_FILTER_FUNCTION": {
          const { key }: FilterFnPayload = action.payload;
          delete state.filterFunctions[key];
          return { ...state };
        }
        default:
          throw new Error();
      }
    };

    const newState = getNewState(state, action);

    let filteredArrayList = [...newState.arrayList];
    for (const key in newState.filterFunctions) {
      if (Object.prototype.hasOwnProperty.call(newState.filterFunctions, key)) {
        const filterFn = newState.filterFunctions[key];
        filteredArrayList = [...filterFn(filteredArrayList)];
      }
    }

    return { ...newState, filteredArrayList };
  };

  const [state, dispatch] = useReducer(reducer, {
    arrayList: [],
    filteredArrayList: [],
    filterFunctions: {},
  });

  return [state, dispatch];
};

export default useFilter;
