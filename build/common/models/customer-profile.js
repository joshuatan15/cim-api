'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_profile_service_1 = require("../services/customer-profile-service");
const helper_service_1 = require("../services/helper-service");
const HttpStatus = require('http-status-codes');
const { ApplicationError } = require('../ApplicationError');
const logger = require('../logger');
// tslint:disable: max-line-length one-line only-arrow-functions
module.exports = function (CustomerProfile) {
    const moduleName = 'customer-profile';
    helper_service_1.default.disableAllMethods(CustomerProfile, []);
    CustomerProfile.createCustomer = function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
            try {
                log.info(`createCustomer - username: ${req.username}, email: ${req.user.email}`);
                log.info('createCustomer - request: %o', req.user);
                const createdUser = yield customer_profile_service_1.default.createCustomer(req.user, req.referenceNumber, req.username, req.channelId);
                const response = yield helper_service_1.default.generateResponseObject(true, req.referenceNumber, '', '', [], createdUser, '000');
                res.status(HttpStatus.CREATED).send(response).end();
                log.info('createCustomer - response: %o', response);
                log.info(`createCustomer - Create User Id: ${createdUser.id}, Email: ${req.user.email} Successfully`);
            }
            catch (error) {
                if (error instanceof ApplicationError) {
                    log.error(`createCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
                    res.status(error.httpStatusCode).send(response).end();
                }
                else {
                    log.error(`createCustomer - ${error.message}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, "1000000000" /* CREATE_UNEXPECTED_ERROR */, 'Unexpected error', [], {}, 'xxxxxxx');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
                }
            }
        });
    };
    CustomerProfile.remoteMethod('createCustomer', {
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
    });
    CustomerProfile.search = function (filter, referenceNumber, channelId, username, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = logger.getLogger(moduleName, { referenceNumber, channelId });
            try {
                log.info(`searchUser - CustomerProfilename: ${username}`);
                const searchResult = yield customer_profile_service_1.default.searchCustomer(filter);
                const response = yield helper_service_1.default.generateResponseObject(true, referenceNumber, '', '', [], searchResult, '000');
                res.status(HttpStatus.OK).send(response).end();
            }
            catch (error) {
                if (error instanceof ApplicationError) {
                    log.error(`searchUser - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
                    res.status(error.httpStatusCode).send(response).end();
                }
                else {
                    log.error(`searchUser - ${error.message}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, referenceNumber, "1100000000" /* SEARCH_UNEXPECTED_ERROR */, 'Unexpected error', [], {}, 'xxxxxxx');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
                }
            }
        });
    };
    CustomerProfile.remoteMethod('search', {
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
    });
    CustomerProfile.updateCustomer = function (req, res, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
            log.info(`${moduleName} module - update - referenceNumber: ${req.referenceNumber} channelId: ${req.channelId} username: ${req.username}`);
            try {
                log.info(`updateCustomer - username: ${req.username}, user id: ${id}`);
                log.info('updateCustomer - request: %o', req.user);
                const updatedUser = yield customer_profile_service_1.default.updateCustomer(req.user, req.username, id);
                const response = yield helper_service_1.default.generateResponseObject(true, req.referenceNumber, '', '', [], updatedUser, '000');
                res.status(HttpStatus.CREATED).send(response).end();
                log.info('updateCustomer - response: %o', response);
                log.info(`updateCustomer - username: ${req.username}, user id: ${id} : Update Successfully`);
            }
            catch (error) {
                if (error instanceof ApplicationError) {
                    log.error(`updateCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
                    res.status(error.httpStatusCode).send(response).end();
                }
                else {
                    log.error(`updateCustomer - ${error.message}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, "1600000000" /* UPDATE_UNEXPECTED_ERROR */, 'Unexpected error', [], {}, 'xxxxxxx');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
                }
            }
        });
    };
    CustomerProfile.remoteMethod('updateCustomer', {
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
    });
    CustomerProfile.approve = function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
            try {
                log.info(`approveCustomer - username: ${req.username}`);
                log.info('approveCustomer - request - ids: %o', req.payload);
                const ids = req.payload;
                const processedItems = [];
                const promises = yield customer_profile_service_1.default.pushPromises(req, ids, processedItems, 'APPROVE');
                const result = yield Promise.all(promises);
                const response = yield helper_service_1.default.generateResponseObject(true, req.referenceNumber, '', '', [], result[0], '000');
                log.info('approveCustomer - response: %o', response);
                res.status(HttpStatus.OK).send(response).end();
            }
            catch (error) {
                if (error instanceof ApplicationError) {
                    log.error(`approveCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
                    res.status(error.httpStatusCode).send(response).end();
                }
                else {
                    log.error(`approveCustomer - ${error.message}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, "1200000000" /* APPROVE_UNEXPECTED_ERROR */, 'Unexpected error', [], {}, 'xxxxxxx');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
                }
            }
        });
    };
    CustomerProfile.remoteMethod('approve', {
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
    });
    CustomerProfile.reject = function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = logger.getLogger(moduleName, { referenceNumber: req.referenceNumber, channelId: req.channelId });
            try {
                log.info(`rejectCustomer - username: ${req.username}`);
                log.info('rejectCustomer - request - ids: %o', req.payload);
                const ids = req.payload;
                const processedItems = [];
                const promises = yield customer_profile_service_1.default.pushPromises(req, ids, processedItems, 'REJECT');
                const result = yield Promise.all(promises);
                const response = yield helper_service_1.default.generateResponseObject(true, req.referenceNumber, '', '', [], result[0], '000');
                log.info('rejectCustomer - response: %o', response);
                res.status(HttpStatus.OK).send(response).end();
            }
            catch (error) {
                if (error instanceof ApplicationError) {
                    log.error(`rejectCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
                    res.status(error.httpStatusCode).send(response).end();
                }
                else {
                    log.error(`rejectCustomer - ${error.message}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, req.referenceNumber, "170000000000" /* REJECT_UNEXPECTED_ERROR */, 'Unexpected error', [], {}, 'xxxxxxx');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
                }
            }
        });
    };
    CustomerProfile.remoteMethod('reject', {
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
    });
    CustomerProfile.delete = function (referenceNumber, channelId, username, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = logger.getLogger(moduleName, { referenceNumber, channelId });
            try {
                log.info(`deleteCustomer - username: ${username}, id: ${id}`);
                log.info(`deleteCustomer - referenceNumber: ${referenceNumber} channelId: ${channelId} username: ${username}`);
                const deleteCustomer = yield customer_profile_service_1.default.deleteCustomer(id);
                const response = yield helper_service_1.default.generateResponseObject(true, referenceNumber, '', '', [], deleteCustomer, '000');
                log.info('deleteCustomer - response: %o', response);
                res.status(HttpStatus.OK).send(response).end();
            }
            catch (error) {
                if (error instanceof ApplicationError) {
                    log.error(`deleteCustomer - ${error.errorCode} - ${error.errorMessage}, params: ${error.params}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, referenceNumber, error.errorCode, error.errorMessage, error.params, {}, 'xxxxxxx');
                    res.status(error.httpStatusCode).send(response).end();
                }
                else {
                    log.error(`deleteCustomer - ${error.message}`);
                    const response = yield helper_service_1.default.generateResponseObject(false, referenceNumber, "1800000000" /* DELETE_UNEXPECTED_ERROR */, 'Unexpected error', [], {}, 'xxxxxxx');
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(response).end();
                }
            }
        });
    };
    CustomerProfile.remoteMethod('delete', {
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
    });
};
//# sourceMappingURL=customer-profile.js.map