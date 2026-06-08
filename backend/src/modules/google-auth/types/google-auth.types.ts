import { SerializedCustomer } from '../../customers/customer-token.service';

export type VerifiedGoogleUser = {
  uid: string;
  email: string;
  name: string;
  picture?: string;
};

export type CustomerAuthResult = {
  accessToken: string;
  user: SerializedCustomer;
};
