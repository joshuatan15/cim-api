export const enum CustomerStatus {
  active= "ACTIVE",
  locked= "LOCKED",
  deleted= "DELETED"
}

module.exports = {
  pendingNone: 'PENDING_NONE',
  pendingAdd: 'PENDING_ADD',
  pendingModify: 'PENDING_MODIFY',
  pendingDelete: 'PENDING_DELETE',
}