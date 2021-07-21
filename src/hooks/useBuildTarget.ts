import { BuildTarget } from "interfaces/BuildTarget";

export const useBuildTarget = (opts: BuildTarget) => {
  switch (process.env.REACT_APP_BUILD_TARGET) {
    case "ADMIN":
      return opts.ADMIN;
    case "BRAND_MANAGER":
      return opts.BRAND_MANAGER;
    default:
      if (opts.default) return opts.default;
      throw new Error(
        "No such build target: " + process.env.REACT_APP_BUILD_TARGET
      );
  }
};
