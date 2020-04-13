interface IResponse {
  referenceNumber: string;
  correlationId: string;
  data?: any;
  errorCode?: string;
  errorMessage?: string;
  errors?: Array<string>;
}
