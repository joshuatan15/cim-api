export const enum CustomerProfileErrorCode {
  CREATE_UNEXPECTED_ERROR = '1000000000',
  CREATE_CUSTOMER_EXISTED = '1000000001',
  SEARCH_UNEXPECTED_ERROR = '1100000000',
  APPROVE_UNEXPECTED_ERROR = '1200000000',
  UPDATE_UNEXPECTED_ERROR = '1600000000',
  UPDATE_CUSTOMER_NOT_FOUND = '160000000001',
  UPDATE_CUSTOMER_NOT_VALID = '160000000002',
  REJECT_UNEXPECTED_ERROR = '170000000000',
  DELETE_UNEXPECTED_ERROR = '1800000000',
  DELETE_CUSTOMER_NOT_FOUND = '1800000001',
  DELETE_CUSTOMER_NOT_VALID = '1800000002'
}