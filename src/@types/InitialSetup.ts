import { ProviderTypes } from "./Providers";

export type SetupPageLicenceType = "paid" | "trial";

export type CustomerInfoBasic = {
  fullName: string;
  email: string;
  company: string;
  country: string;
};

export type CustomerInfoTrial = {
  interestedIn: "replicas" | "migrations" | "both";
  sourcePlatform: ProviderTypes | null;
  destinationPlatform: ProviderTypes | null;
};

export type CustomerInfoFull = CustomerInfoBasic & CustomerInfoTrial;

export const isCustomerInfoFull = (
  customerInfo: CustomerInfoFull | CustomerInfoBasic,
): customerInfo is CustomerInfoFull =>
  (<CustomerInfoFull>customerInfo).interestedIn !== undefined;
