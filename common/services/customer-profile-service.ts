const app = require('../../server/server');
const HttpStatus = require('http-status-codes');
const { ApplicationError } = require('../ApplicationError');
import { Action } from '../enum/Action';
import { EntityStatus } from '../enum/EntityStatus';
import { PendingStatus } from '../enum/PendingStatus';
import { CustomerStatus } from '../enum/CustomerStatus';
import { TransactionStatus } from '../enum/TransactionStatus';
import helperService from './helper-service';
import { CustomerProfileErrorCode } from '../enum/ErrorMessage';
const log = require('../logger').getLogger('user-profile-service');

// tslint:disable: max-line-length one-line

export default class CustomerProfileService {
  static createCustomer(customerReq: any, referenceNumber: string, username: string, channelId: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        log.info('referenceNumber: %s, username: %s, channelId: %s', referenceNumber, username, channelId);
        await app.dataSources.default.transaction(async (models: any) => {
          const { CustomerProfile } = models;

          log.info('Creating new user with email: %s', customerReq.fullName);
          const customerRawProperties = CustomerProfile.definition.properties;
          customerReq.pendingStatus = PendingStatus.pendingAdd;
          customerReq.status = CustomerStatus.active;
          if (username) {
            customerReq.createdBy = username;
            customerReq.updatedBy = username;
          }
          customerReq = await helperService.syncOriAndTmp(
            referenceNumber,
            customerRawProperties,
            customerReq,
            Action.create
          );
          console.log(customerReq);
          const userCreation = await CustomerProfile.create(customerReq);
          resolve(userCreation);
        });
      }
      catch (error) {
        reject(error);
      }
    });
  }

  static searchCustomer(filter: string) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await app.dataSources.default.transaction(async (models: any) => {
          const { CustomerProfile } = models;
          log.info('searchUser - filter: %s', filter);

          let filterObject: { [key: string]: any } = {};
          let countFilterObject: { [key: string]: any } = {};
          let customerInfo: Array<any> = [];
          let totalCount: number;
          if (filter) {
            filterObject = JSON.parse(filter);
            countFilterObject = filterObject.where;
          }

          customerInfo = await CustomerProfile.find(filterObject);
          totalCount = await CustomerProfile.count(countFilterObject);
          const results = { user: customerInfo, totalCount };
          resolve(results);
        });
      }
      catch (ex) {
        reject(ex);
      }
    });
  }


  static updateCustomer(req: any, username: string, id: number) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await app.dataSources.default.transaction(async (models: any) => {
          const { CustomerProfile } = models;
          const whereClause = {
            and: [
              { id },
              {
                or: [
                  { status: EntityStatus.active },
                  { status: EntityStatus.rejected }
                ]
              }
            ]
          };
          let userInfo = await CustomerProfile.findOne({ where: whereClause });
          if (!userInfo) {
            throw new ApplicationError(CustomerProfileErrorCode.UPDATE_CUSTOMER_NOT_FOUND, `User ID: ${id} not found`, HttpStatus.NOT_FOUND, [id]);
          }
          else if (userInfo.pendingStatus !== PendingStatus.pendingNone) {
            throw new ApplicationError(CustomerProfileErrorCode.UPDATE_CUSTOMER_NOT_VALID, `User ID: ${id} pendingStatus is ${userInfo.pendingStatus}`, HttpStatus.BAD_REQUEST, [id, userInfo.pendingStatus]);
          }

          log.info('Updating user detail with User ID: %s', id);
          const payloadRequest = req;
          const rawProperties = CustomerProfile.definition.properties;
          const propertiesList = Object.keys(rawProperties);
          const tmpFields = propertiesList.filter(field => field.startsWith('tmp'));

          const tmpPayload: { [key: string]: any } = {};
          tmpFields.forEach(tmpField => {
            // get original property name
            let fieldName = tmpField.slice(3);
            fieldName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
            tmpPayload[tmpField] = payloadRequest[fieldName];
          });

          if (userInfo.status === EntityStatus.rejected) {
            tmpPayload.pendingStatus = PendingStatus.pendingAdd;
            tmpPayload.status = EntityStatus.active;
          }
          else {
            tmpPayload.pendingStatus = PendingStatus.pendingModify;
          }
          tmpPayload.lastUpdated = new Date();
          tmpPayload.updatedBy = username;
          userInfo = await userInfo.updateAttributes(tmpPayload, null);
          resolve(userInfo);
        });
      }
      catch (ex) {
        reject(ex);
      }
    });
  }

  static deleteCustomer(id: number) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await app.dataSources.default.transaction(async (models: any) => {
          const { CustomerProfile } = models;

          const whereClause = {
            id
          };
          let customerInfo = await CustomerProfile.findOne({
            where: whereClause
          });

          if (!customerInfo) {
            throw new ApplicationError(CustomerProfileErrorCode.DELETE_CUSTOMER_NOT_FOUND, `Customer ID: ${id} not found`, HttpStatus.NOT_FOUND, [id]);
          }

          log.info('Delete Customer ID: %s', id);
          customerInfo = await CustomerProfile.deleteById(id, null);
          const results = {id};
          resolve(results);
        });
      }
      catch (ex) {
        reject(ex);
      }
    });
  }

  static pushPromises(req: any, ids: Array<number>, processedItems: Array<object>, action: string): Promise<any> {

    const promises: Array<Promise<any>> = [];
    return new Promise((resolve, reject) => {
      try {
        ids.forEach((id: number) => {
          promises.push(CustomerProfileService.bulkApproveReject(req, id, action, processedItems));
        });
        resolve(promises);
      }
      catch (error) {
        reject(error.message);
      }
    });
  }

  static bulkApproveReject(req: any, id: number, action: string, processedItems: Array<object>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await app.dataSources.default.transaction(async (models: any) => {
          const { CustomerProfile } = models;
          try {
            const customerInfo = await CustomerProfile.findOne({
              where: {
                id
              }
            });

            if (customerInfo == null) {
              processedItems.push({ id, status: TransactionStatus.failed, message: `Customer with ID: ${id} not found` });
              resolve(processedItems);
            }
            else if (customerInfo.pendingStatus === PendingStatus.pendingNone) {
              processedItems.push({ id, status: TransactionStatus.failed, message: `This record with Customer ID: ${id} has been updated by another user` });
              resolve(processedItems);
            }
            else {
              if (customerInfo.pendingStatus === PendingStatus.pendingAdd && action === Action.reject) {
                log.info('Rejecting Customer id: %s, with status: Pending Add', id);
                const attributes = {
                  pendingStatus: PendingStatus.pendingNone,
                  status: EntityStatus.rejected,
                  lastUpdated: new Date(),
                  updatedBy: req.username
                };
                await customerInfo.updateAttributes(attributes, null);
              }
              else {
                let updatedCustomer: { [key: string]: any } = JSON.parse(JSON.stringify(customerInfo));
                const rawProperties = CustomerProfile.definition.properties;
                if (customerInfo.pendingStatus === PendingStatus.pendingModify) {
                  updatedCustomer = await helperService.syncOriAndTmp(req.referenceNumber, rawProperties, updatedCustomer, action);
                }
                else {
                  if (action === Action.approve) {
                    if (customerInfo.pendingStatus === PendingStatus.pendingDelete) {
                      updatedCustomer.status = EntityStatus.deleted;
                    }
                    else if (customerInfo.pendingStatus === PendingStatus.pendingAdd) {
                      updatedCustomer = await helperService.syncOriAndTmp(req.referenceNumber, rawProperties, updatedCustomer, action);
                    }
                    else {
                      // do nothing
                    }
                  }
                  else if (action === Action.reject) {
                    // do nothing
                  }
                }

                updatedCustomer.pendingStatus = PendingStatus.pendingNone;
                updatedCustomer.lastUpdated = new Date();
                updatedCustomer.updatedBy = req.username;

                await customerInfo.updateAttributes(updatedCustomer, null);
              }
              processedItems.push({ id, status: TransactionStatus.successful });
              resolve(processedItems);
            }
          }
          catch (error) {
            processedItems.push({ id, status: TransactionStatus.failed, message: error.message });
            resolve(processedItems);
          }
        });
      }
      catch (error) {
        reject(error.message);
      }
    });
  }
}
