const { log } = require('./logger');
const HttpStatus = require('http-status-codes');
var app = require('../server/server');
var uuid = require('uuid/v1');
const EntityStatus = require('./enum/EntityStatus');
const PendingStatus = require('./enum/PendingStatus');
const Action = require('./enum/Action');
const ApplicationError = require('./ApplicationError');
const TransactionStatus = require('./enum/TransactionStatus')
const UserStatus = require('./enum/UserStatus');

var dataSource = app.dataSources.default;

module.exports = {
  HttpStatus: HttpStatus,
  log: log,
  dataSource: dataSource,
  EntityStatus: EntityStatus,
  PendingStatus: PendingStatus,
  Action: Action,
  ApplicationError: ApplicationError,
  TransactionStatus: TransactionStatus,
  UserStatus: UserStatus,
  uuid: uuid
};

module.exports.generateResponseObject = function generateResponseObject(
  requestStatus: boolean,
  referenceNumber: string,
  errorCode: string,
  errorMessage: string,
  errors: Array<any>,
  data: Object,
  unexpectedErrorCode: string
): Promise<IResponse> {

  return new Promise((resolve, reject) => {
    try {
      let response = { referenceNumber: uuid(), correlationId: referenceNumber } as IResponse;
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

module.exports.disableAllMethods = function disableAllMethods(model: any, methodsToExpose: any) {
  if (model && model.sharedClass) {
    methodsToExpose = methodsToExpose || [];

    var modelName = model.sharedClass.name;
    var methods = model.sharedClass.methods();
    var relationMethods: any = [];
    var hiddenMethods: any = [];

    try {
      Object.keys(model.definition.settings.relations).forEach(function(relation) {
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
      log.error(`disableAllMethods error: ${err.message}`);
    }

    methods.concat(relationMethods).forEach(function(method: any) {
      var methodName = method.name;
      if (methodsToExpose.indexOf(methodName) < 0) {
        hiddenMethods.push(methodName);
        model.disableRemoteMethodByName(methodName, method.isStatic);
        // disable relationships produced
        model.disableRemoteMethodByName(`prototype.${methodName}`);
      }
    });

    if (hiddenMethods.length > 0) {
      log.debug(`Remote methods hidden for ${modelName}:\n${hiddenMethods.join(', ')}`);
    }
  }
};

/**
 * Synchronize between original and tmp fields
 * @param referenceNumber A string that represents the transaction
 * @param rawProperties An object of the model's properties definition,
 *  Eg: app.model.BoUser.definition.properties
 * @returns {Promise} Promise object to which the object's original and tmp fields are in sync
 */
module.exports.syncOriAndTmp = function syncOriAndTmp(
  referenceNumber: any,
  rawProperties: any,
  obj: any,
  action: string,
  unexpectedErrorCode: string,
  status?: string) {
  return new Promise((resolve, reject) => {
    try {
      let propertiesList = Object.keys(rawProperties);
      let tmpFields = propertiesList.filter(field => field.startsWith("tmp"));
      let newObj = obj;

      if (obj.pendingStatus || status) {
        // sync original field with tmp field if approving a pending modify record
        let useTmpField = action === Action.approve;
        let isPendingAdd = obj.pendingStatus === PendingStatus.pendingAdd || status === PendingStatus.pendingAdd;
        log.debug(`useTmpField = ${useTmpField}`);

        tmpFields.forEach(function(tmpField) {
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
        log.info("Object does not contain pending status, no syncOriAndTmp done");
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
}
