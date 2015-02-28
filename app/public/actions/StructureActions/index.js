var dispatcher         = require('../../dispatcher');
var ApiActions        = require('../ApiActions');
var StructureConstants = require('../../constants/StructureConstants');

module.exports = {
  list: function () {
    ApiActions.request({
      url:    '/api/structures',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      dataType: 'json'
    }).success(function (data) {
      dispatcher.dispatch({
        actionType: StructureConstants.LIST_SUCCESS,
        data:       data
      });
    }).error(function (err) {
      dispatcher.dispatch({
        actionType: StructureConstants.LIST_ERROR
      })
    });
  }
};