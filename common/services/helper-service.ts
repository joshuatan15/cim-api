const log = require('../logger').getLogger('helper-service');
import * as uuid from 'uuid/v1';
const HttpStatus = require('http-status-codes');
const ApplicationError = require('../ApplicationError');
import { Action } from '../enum/Action';
import { PendingStatus } from '../enum/PendingStatus';

// tslint:disable max-line-length one-line

export default class HelperService {
  static generateResponseObject = function generateResponseObject(
    requestStatus: boolean,
    referenceNumber: string,
    errorCode: string,
    errorMessage: string,
    errors: Array<any>,
    data: object,
    unexpectedErrorCode: string
  ): Promise<IResponse> {

    return new Promise((resolve, reject) => {
      try {
        const response = { referenceNumber: uuid(), correlationId: referenceNumber } as IResponse;
        if (requestStatus === true) {
          response.errorCode = '';
          response.errorMessage = '';
          response.errors = [];
          response.data = data;
          resolve(response);
        }
        else {
          response.errorCode = errorCode;
          response.errorMessage = errorMessage;
          response.errors = errors;
          response.data = {};
          resolve(response);
        }
      }
      catch (error) {
        log.error(`Failed to create response object for request referenceNumber: ${referenceNumber} - ${error.message}`);
        reject(new ApplicationError(unexpectedErrorCode, `Failed to create response object for request referenceNumber: ${referenceNumber}`, HttpStatus.INTERNAL_SERVER_ERROR, [referenceNumber]));
      }
    });
  };

  static disableAllMethods = function disableAllMethods(model: any, methodsToExpose: any) {
    if (model && model.sharedClass) {
      methodsToExpose = methodsToExpose || [];

      const modelName = model.sharedClass.name;
      const methods = model.sharedClass.methods();
      const relationMethods: any = [];
      const hiddenMethods: any = [];

      try {
        Object.keys(model.definition.settings.relations).forEach((relation) => {
          relationMethods.push({ name: '__findById__' + relation, isStatic: false });
          relationMethods.push({ name: '__destroyById__' + relation, isStatic: false });
          relationMethods.push({ name: '__updateById__' + relation, isStatic: false });
          relationMethods.push({ name: '__exists__' + relation, isStatic: false });
          relationMethods.push({ name: '__link__' + relation, isStatic: false });
          relationMethods.push({ name: '__get__' + relation, isStatic: false });
          relationMethods.push({ name: '__create__' + relation, isStatic: false });
          relationMethods.push({ name: '__update__' + relation, isStatic: false });
          relationMethods.push({ name: '__destroy__' + relation, isStatic: false });
          relationMethods.push({ name: '__unlink__' + relation, isStatic: false });
          relationMethods.push({ name: '__count__' + relation, isStatic: false });
          relationMethods.push({ name: '__delete__' + relation, isStatic: false });
        });
      }
      catch (err) {
        log.error(`user module - disableAllMethods error: ${err.message}`);
      }

      methods.concat(relationMethods).forEach((method: any) => {
        const methodName = method.name;
        if (methodsToExpose.indexOf(methodName) < 0) {
          hiddenMethods.push(methodName);
          model.disableRemoteMethodByName(methodName, method.isStatic);
          // disable relationships produced
          model.disableRemoteMethodByName(`prototype.${methodName}`);
        }
      });

      if (hiddenMethods.length > 0) {
        log.debug('Remote methods hidden for %s:\n%o', modelName, hiddenMethods.join(', '));
      }
    }
  };

  static syncOriAndTmp = function syncOriAndTmp(
    referenceNumber: any,
    rawProperties: any,
    obj: any,
    action: string,
    unexpectedErrorCode?: string,
    status?: string) {
    return new Promise((resolve, reject) => {
      try {
        const propertiesList = Object.keys(rawProperties);
        const tmpFields = propertiesList.filter(field => field.startsWith('tmp'));
        const newObj = obj;

        if (obj.pendingStatus || status) {
          // sync original field with tmp field if approving a pending modify record
          const useTmpField = action === Action.approve;
          const isPendingAdd = obj.pendingStatus === PendingStatus.pendingAdd || status === PendingStatus.pendingAdd;
          log.debug(`useTmpField = ${useTmpField}`);

          tmpFields.forEach(tmpField => {
            // get original property name
            let fieldName = tmpField.slice(3);
            fieldName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
            if (useTmpField) {
              newObj[fieldName] = obj[tmpField];
            }
            else if (isPendingAdd) {
              if (newObj[fieldName] !== null) {
                obj[tmpField] = newObj[fieldName];
              }
              newObj[fieldName] = null;
            }
            else {
              newObj[tmpField] = obj[fieldName];
            }
          });
        }
        else {
          log.info('Object does not contain pending status, no syncOriAndTmp done');
        }

        log.info(`syncOriAndTmp finished synchronizing original and tmp fields for ${obj.pendingStatus} and ${action}`);
        log.debug(newObj);
        resolve(newObj);
      }
      catch (error) {
        log.error(`helper syncOriAndTmp error for referenceNumber: ${referenceNumber}. Error: ${error.statusCode} - ${error.message}`);
        reject(new ApplicationError(unexpectedErrorCode, `Failed to sync between original and tmp fields: ${referenceNumber}`, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    });
  };
}

