'use strict';
import customerProfileService from '../services/customer-profile-service';
import { CustomerProfileErrorCode } from '../enum/ErrorMessage';
import helperService from '../services/helper-service';
const HttpStatus = require('http-status-codes');
const { ApplicationError } = require('../ApplicationError');
const logger = require('../logger');

// tslint:disable: max-line-length one-line only-arrow-functions

module.exports = function(CustomerProfile: any) {
  const moduleName = 'customer-profile';
  helperService.disableAllMethods(CustomerProfile, []);

  CustomerProfile.createCustomer = async function(req: any, res: any) {
    const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
    try {
      log.info(`createCustomer - username: ${req.username}, email: ${req.user.email}`);
      log.info('createCustomer - request: %o', req.user);
      const createdUser: any = await customerProfileService.createCustomer(req.user, req.referenceNumber, req.username, req.channelId);
      const response = await helperService.generateResponseObject(true, req.referenceNumber, '', '', [], createdUser, '000');
      res.status(HttpStatus.CREATED).send(response).end();
      log.info('createCustomer - response: %o', response);
      log.info(`createCustomer - Create User Id: ${createdUser.id}, Email: ${req.user.email} Successfully`);
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        log.error(`createCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
        res.status(error.httpStatusCode).send(response).end();
      }
      else {
        log.error(`createCustomer - ${error.message}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, CustomerProfileErrorCode.CREATE_UNEXPECTED_ERROR, 'Unexpected error', [], {}, 'xxxxxxx');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
      }
    }
  };

  CustomerProfile.remoteMethod(
    'createCustomer',
    {
      http: {
        path: '/',
        verb: 'post'
      },
      accepts: [
        {
          arg: 'request',
          type: 'CustomerProfileCreateRequest',
          http: { source: 'body' }
        },
        {
          arg: 'res',
          type: 'object',
          http: { source: 'res' }
        }
      ],
      returns: {
        arg: 'response',
        type: 'BaseResponse',
        root: true
      }
    }
  );

  CustomerProfile.search = async function(filter: string, referenceNumber: string, channelId: string, username: string, res: any) {
    const log = logger.getLogger(moduleName, { referenceNumber, channelId });
    try {
      log.info(`searchUser - CustomerProfilename: ${username}`);
      const searchResult = await customerProfileService.searchCustomer(filter);
      const response = await helperService.generateResponseObject(true, referenceNumber, '', '', [], searchResult, '000');
      res.status(HttpStatus.OK).send(response).end();
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        log.error(`searchUser - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
        const response = await helperService.generateResponseObject(false, referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
        res.status(error.httpStatusCode).send(response).end();
      }
      else {
        log.error(`searchUser - ${error.message}`);
        const response = await helperService.generateResponseObject(false, referenceNumber, CustomerProfileErrorCode.SEARCH_UNEXPECTED_ERROR, 'Unexpected error', [], {}, 'xxxxxxx');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
      }
    }
  };

  CustomerProfile.remoteMethod(
    'search',
    {
      http: {
        path: '/search',
        verb: 'get'
      },
      accepts: [
        {
          arg: 'filter',
          description: `Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})`,
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'referenceNumber',
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'channelId',
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'username',
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'res',
          type: 'object',
          http: { source: 'res' }
        }
      ],
      returns: {
        arg: 'response',
        type: 'CustomerProfileSearchResponse',
        root: true
      }
    }
  );

  CustomerProfile.updateCustomer = async function(req: any, res: any, id: number) {
    const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
    log.info(`${moduleName} module - update - referenceNumber: ${req.referenceNumber} channelId: ${req.channelId} username: ${req.username}`);
    try {
      log.info(`updateCustomer - username: ${req.username}, user id: ${id}`);
      log.info('updateCustomer - request: %o', req.user);
      const updatedUser = await customerProfileService.updateCustomer(req.user, req.username, id);
      const response = await helperService.generateResponseObject(true, req.referenceNumber, '', '', [], updatedUser, '000');
      res.status(HttpStatus.CREATED).send(response).end();
      log.info('updateCustomer - response: %o', response);
      log.info(`updateCustomer - username: ${req.username}, user id: ${id} : Update Successfully`);
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        log.error(`updateCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
        res.status(error.httpStatusCode).send(response).end();
      }
      else {
        log.error(`updateCustomer - ${error.message}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, CustomerProfileErrorCode.UPDATE_UNEXPECTED_ERROR, 'Unexpected error', [], {}, 'xxxxxxx');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
      }
    }
  };

  CustomerProfile.remoteMethod(
    'updateCustomer',
    {
      http: {
        path: '/:id',
        verb: 'put'
      },
      accepts: [
        {
          arg: 'request',
          type: 'CustomerProfileUpdateRequest',
          http: { source: 'body' }
        },
        {
          arg: 'res',
          type: 'object',
          http: { source: 'res' }
        },
        {
          arg: 'id',
          type: 'string',
          http: { source: 'path' }
        }
      ],
      returns: {
        arg: 'response',
        type: 'CustomerProfileDataResponse',
        root: true
      }
    }
  );

  CustomerProfile.approve = async function(req: any, res: any) {
    const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
    try {
      log.info(`approveCustomer - username: ${req.username}`);
      log.info('approveCustomer - request - ids: %o', req.payload);
      const ids: Array<number> = req.payload;
      const processedItems: Array<object> = [];
      const promises: Array<Promise<any>> = await customerProfileService.pushPromises(req, ids, processedItems, 'APPROVE');

      const result = await Promise.all(promises);

      const response = await helperService.generateResponseObject(true, req.referenceNumber, '', '', [], result[0], '000');
      log.info('approveCustomer - response: %o', response);
      res.status(HttpStatus.OK).send(response).end();
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        log.error(`approveCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
        res.status(error.httpStatusCode).send(response).end();
      }
      else {
        log.error(`approveCustomer - ${error.message}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, CustomerProfileErrorCode.APPROVE_UNEXPECTED_ERROR, 'Unexpected error', [], {}, 'xxxxxxx');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
      }
    }
  };

  CustomerProfile.remoteMethod(
    'approve',
    {
      http: {
        path: '/approve',
        verb: 'post'
      },
      accepts: [
        {
          arg: 'request',
          type: 'CustomerProfileApproveRejectRequest',
          http: { source: 'body' }
        },
        {
          arg: 'res',
          type: 'object',
          http: { source: 'res' }
        }
      ],
      returns: {
        arg: 'response',
        type: 'CustomerProfileApproveRejectResponse',
        root: true
      }
    }
  );

  CustomerProfile.reject = async function(req: any, res: any) {
    const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
    try {
      log.info(`rejectCustomer - username: ${req.username}`);
      log.info('rejectCustomer - request - ids: %o', req.payload);
      const ids: Array<number> = req.payload;
      const processedItems: Array<object> = [];

      const promises: Array<Promise<any>> = await customerProfileService.pushPromises(req, ids, processedItems, 'REJECT');
      const result = await Promise.all(promises);

      const response = await helperService.generateResponseObject(true, req.referenceNumber, '', '', [], result[0], '000');
      log.info('rejectCustomer - response: %o', response);
      res.status(HttpStatus.OK).send(response).end();
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        log.error(`rejectCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
        res.status(error.httpStatusCode).send(response).end();
      }
      else {
        log.error(`rejectCustomer - ${error.message}`);
        const response = await helperService.generateResponseObject(false, req.referenceNumber, CustomerProfileErrorCode.REJECT_UNEXPECTED_ERROR, 'Unexpected error', [], {}, 'xxxxxxx');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
      }
    }
  };

  CustomerProfile.remoteMethod(
    'reject',
    {
      http: {
        path: '/reject',
        verb: 'post'
      },
      accepts: [
        {
          arg: 'request',
          type: 'CustomerProfileApproveRejectRequest',
          http: { source: 'body' }
        },
        {
          arg: 'res',
          type: 'object',
          http: { source: 'res' }
        }
      ],
      returns: {
        arg: 'response',
        type: 'CustomerProfileApproveRejectResponse',
        root: true
      }
    }
  );

  CustomerProfile.delete = async function(referenceNumber: string, channelId: string, username: string, id: number, res: any) {
    const log = logger.getLogger(moduleName, { referenceNumber, channelId });
    try {
      log.info(`deleteCustomer - username: ${username}, id: ${id}`);
      log.info(`deleteCustomer - referenceNumber: ${referenceNumber} channelId: ${channelId} username: ${username}`);
      const deleteCustomer = await customerProfileService.deleteCustomer(id);
      const response = await helperService.generateResponseObject(true, referenceNumber, '', '', [], deleteCustomer, '000');
      log.info('deleteCustomer - response: %o', response);
      res.status(HttpStatus.OK).send(response).end();
    }
    catch (error) {
      if (error instanceof ApplicationError) {
        log.error(`deleteCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
        const response = await helperService.generateResponseObject(false, referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
        res.status(error.httpStatusCode).send(response).end();
      }
      else {
        log.error(`deleteCustomer - ${error.message}`);
        const response = await helperService.generateResponseObject(false, referenceNumber, CustomerProfileErrorCode.DELETE_UNEXPECTED_ERROR, 'Unexpected error', [], {}, 'xxxxxxx');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
      }
    }
  };

  CustomerProfile.remoteMethod(
    'delete',
    {
      http: {
        path: '/:id',
        verb: 'delete'
      },
      accepts: [
        {
          arg: 'referenceNumber',
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'channelId',
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'username',
          type: 'string',
          http: { source: 'query' }
        },
        {
          arg: 'id',
          type: 'string',
          http: { source: 'path' }
        },
        {
          arg: 'res',
          type: 'object',
          http: { source: 'res' }
        }
      ],
      returns: {
        arg: 'response',
        type: 'CustomerProfileDataResponse',
        root: true
      }
    }
  );
};
