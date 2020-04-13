"use strict";
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
const app = require('../../server/server');
const HttpStatus = require('http-status-codes');
const { ApplicationError } = require('../ApplicationError');
const helper_service_1 = require("./helper-service");
const log = require('../logger').getLogger('user-profile-service');
// tslint:disable: max-line-length one-line
class CustomerProfileService {
    static createCustomer(customerReq, referenceNumber, username, channelId) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                log.info('referenceNumber: %s, username: %s, channelId: %s', referenceNumber, username, channelId);
                yield app.dataSources.default.transaction((models) => __awaiter(this, void 0, void 0, function* () {
                    const { CustomerProfile } = models;
                    log.info('Creating new user with email: %s', customerReq.fullName);
                    const customerRawProperties = CustomerProfile.definition.properties;
                    customerReq.pendingStatus = "PENDING_ADD" /* pendingAdd */;
                    customerReq.status = "ACTIVE" /* active */;
                    if (username) {
                        customerReq.createdBy = username;
                        customerReq.updatedBy = username;
                    }
                    customerReq = yield helper_service_1.default.syncOriAndTmp(referenceNumber, customerRawProperties, customerReq, "CREATE" /* create */);
                    console.log(customerReq);
                    const userCreation = yield CustomerProfile.create(customerReq);
                    resolve(userCreation);
                }));
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    static searchCustomer(filter) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield app.dataSources.default.transaction((models) => __awaiter(this, void 0, void 0, function* () {
                    const { CustomerProfile } = models;
                    log.info('searchUser - filter: %s', filter);
                    let filterObject = {};
                    let countFilterObject = {};
                    let customerInfo = [];
                    let totalCount;
                    if (filter) {
                        filterObject = JSON.parse(filter);
                        countFilterObject = filterObject.where;
                    }
                    customerInfo = yield CustomerProfile.find(filterObject);
                    totalCount = yield CustomerProfile.count(countFilterObject);
                    const results = { user: customerInfo, totalCount };
                    resolve(results);
                }));
            }
            catch (ex) {
                reject(ex);
            }
        }));
    }
    static updateCustomer(req, username, id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield app.dataSources.default.transaction((models) => __awaiter(this, void 0, void 0, function* () {
                    const { CustomerProfile } = models;
                    const whereClause = {
                        and: [
                            { id },
                            {
                                or: [
                                    { status: "ACTIVE" /* active */ },
                                    { status: "REJECTED" /* rejected */ }
                                ]
                            }
                        ]
                    };
                    let userInfo = yield CustomerProfile.findOne({ where: whereClause });
                    if (!userInfo) {
                        throw new ApplicationError("160000000001" /* UPDATE_CUSTOMER_NOT_FOUND */, `User ID: ${id} not found`, HttpStatus.NOT_FOUND, [id]);
                    }
                    else if (userInfo.pendingStatus !== "PENDING_NONE" /* pendingNone */) {
                        throw new ApplicationError("160000000002" /* UPDATE_CUSTOMER_NOT_VALID */, `User ID: ${id} pendingStatus is ${userInfo.pendingStatus}`, HttpStatus.BAD_REQUEST, [id, userInfo.pendingStatus]);
                    }
                    log.info('Updating user detail with User ID: %s', id);
                    const payloadRequest = req;
                    const rawProperties = CustomerProfile.definition.properties;
                    const propertiesList = Object.keys(rawProperties);
                    const tmpFields = propertiesList.filter(field => field.startsWith('tmp'));
                    const tmpPayload = {};
                    tmpFields.forEach(tmpField => {
                        // get original property name
                        let fieldName = tmpField.slice(3);
                        fieldName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                        tmpPayload[tmpField] = payloadRequest[fieldName];
                    });
                    if (userInfo.status === "REJECTED" /* rejected */) {
                        tmpPayload.pendingStatus = "PENDING_ADD" /* pendingAdd */;
                        tmpPayload.status = "ACTIVE" /* active */;
                    }
                    else {
                        tmpPayload.pendingStatus = "PENDING_MODIFY" /* pendingModify */;
                    }
                    tmpPayload.lastUpdated = new Date();
                    tmpPayload.updatedBy = username;
                    userInfo = yield userInfo.updateAttributes(tmpPayload, null);
                    resolve(userInfo);
                }));
            }
            catch (ex) {
                reject(ex);
            }
        }));
    }
    static deleteCustomer(id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield app.dataSources.default.transaction((models) => __awaiter(this, void 0, void 0, function* () {
                    const { CustomerProfile } = models;
                    const whereClause = {
                        id
                    };
                    let customerInfo = yield CustomerProfile.findOne({
                        where: whereClause
                    });
                    if (!customerInfo) {
                        throw new ApplicationError("1800000001" /* DELETE_CUSTOMER_NOT_FOUND */, `Customer ID: ${id} not found`, HttpStatus.NOT_FOUND, [id]);
                    }
                    log.info('Delete Customer ID: %s', id);
                    customerInfo = yield CustomerProfile.deleteById(id, null);
                    const results = { id };
                    resolve(results);
                }));
            }
            catch (ex) {
                reject(ex);
            }
        }));
    }
    static pushPromises(req, ids, processedItems, action) {
        const promises = [];
        return new Promise((resolve, reject) => {
            try {
                ids.forEach((id) => {
                    promises.push(CustomerProfileService.bulkApproveReject(req, id, action, processedItems));
                });
                resolve(promises);
            }
            catch (error) {
                reject(error.message);
            }
        });
    }
    static bulkApproveReject(req, id, action, processedItems) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield app.dataSources.default.transaction((models) => __awaiter(this, void 0, void 0, function* () {
                    const { CustomerProfile } = models;
                    try {
                        const customerInfo = yield CustomerProfile.findOne({
                            where: {
                                id
                            }
                        });
                        if (customerInfo == null) {
                            processedItems.push({ id, status: "FAILED" /* failed */, message: `Customer with ID: ${id} not found` });
                            resolve(processedItems);
                        }
                        else if (customerInfo.pendingStatus === "PENDING_NONE" /* pendingNone */) {
                            processedItems.push({ id, status: "FAILED" /* failed */, message: `This record with Customer ID: ${id} has been updated by another user` });
                            resolve(processedItems);
                        }
                        else {
                            if (customerInfo.pendingStatus === "PENDING_ADD" /* pendingAdd */ && action === "REJECT" /* reject */) {
                                log.info('Rejecting Customer id: %s, with status: Pending Add', id);
                                const attributes = {
                                    pendingStatus: "PENDING_NONE" /* pendingNone */,
                                    status: "REJECTED" /* rejected */,
                                    lastUpdated: new Date(),
                                    updatedBy: req.username
                                };
                                yield customerInfo.updateAttributes(attributes, null);
                            }
                            else {
                                let updatedCustomer = JSON.parse(JSON.stringify(customerInfo));
                                const rawProperties = CustomerProfile.definition.properties;
                                if (customerInfo.pendingStatus === "PENDING_MODIFY" /* pendingModify */) {
                                    updatedCustomer = yield helper_service_1.default.syncOriAndTmp(req.referenceNumber, rawProperties, updatedCustomer, action);
                                }
                                else {
                                    if (action === "APPROVE" /* approve */) {
                                        if (customerInfo.pendingStatus === "PENDING_DELETE" /* pendingDelete */) {
                                            updatedCustomer.status = "DELETED" /* deleted */;
                                        }
                                        else if (customerInfo.pendingStatus === "PENDING_ADD" /* pendingAdd */) {
                                            updatedCustomer = yield helper_service_1.default.syncOriAndTmp(req.referenceNumber, rawProperties, updatedCustomer, action);
                                        }
                                        else {
                                            // do nothing
                                        }
                                    }
                                    else if (action === "REJECT" /* reject */) {
                                        // do nothing
                                    }
                                }
                                updatedCustomer.pendingStatus = "PENDING_NONE" /* pendingNone */;
                                updatedCustomer.lastUpdated = new Date();
                                updatedCustomer.updatedBy = req.username;
                                yield customerInfo.updateAttributes(updatedCustomer, null);
                            }
                            processedItems.push({ id, status: "SUCCESSFUL" /* successful */ });
                            resolve(processedItems);
                        }
                    }
                    catch (error) {
                        processedItems.push({ id, status: "FAILED" /* failed */, message: error.message });
                        resolve(processedItems);
                    }
                }));
            }
            catch (error) {
                reject(error.message);
            }
        }));
    }
}
exports.default = CustomerProfileService;
//# sourceMappingURL=customer-profile-service.js.map