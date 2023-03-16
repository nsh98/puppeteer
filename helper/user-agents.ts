import UserAgent from "user-agents";

export const getUserAgent = () => {
  return new UserAgent({
    deviceCategory: "desktop",
  }).toString();
};
