/*
 * index.js: Identity client for Openstack
 *
 * (C) 2014 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    openstack = require('../../client');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  this.serviceType = null;
};

util.inherits(Client, openstack.Client);

/**
 * Client._getUrl
 *
 * @description a helper function for determining the ultimate URL for this service
 * @param options
 * @returns {exports|*}
 * @private
 */
Client.prototype._getUrl = function (options) {
  options = options || {};

  return urlJoin(this._serviceUrl,
    typeof options === 'string'
      ? options
      : options.path);

};

/**
 * Client.validateToken
 *
 * This is an administrative API that allows a admin user to validate the token of
 * another authenticated user.
 *
 * @param {String}  token   the token to validate
 * @param {String|Function}  [belongsTo]  The tenantId of the user to match with the token
 * @param callback
 */
Client.prototype.validateToken = function (token, belongsTo, callback) {
  if (!token || typeof token === 'function') {
    throw new Error('Token is a required argument');
  }

  if (typeof belongsTo === 'function' && !callback) {
    callback = belongsTo;
    belongsTo = null;
  }

  var options = {
    path: urlJoin('/v2.0/tokens', token)
  };

  if (belongsTo) {
    options.qs = {
      belongsTo: belongsTo
    };
  }

  this._request(options, function (err, body) {
    return err
      ? callback(err)
      : callback(err, body);
  });
};

/**
 *  Client.getTenantInfo
 *
 *  This is an administrative API that allows a admin to get detailed information about the specified tenant by ID
 *
 *  @param {String|Function}  [tenantId]  The tenantId for which we are seeking info
 *  @param callback
 *
 */
Client.prototype.getTenantInfo = function (tenantId, callback) {

  if (typeof tenantId === 'function' && !callback) {
    callback = tenantId;
    tenantId = null;
  }

  var options = {
    path: urlJoin('/v2.0/tenants', tenantId ? tenantId : '')
  };

  this._request(options, function (err, body) {
    return err
      ? callback(err)
      : callback(err, body);
  });

};

/**
 * Client.createProject
 *
 * @description helper function for create a project via remote API.
 *
 * @param property
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.createProject = function (property, callback) {
  this.emit('log::trace', 'Creating project', property);

  return this._request({
    method: 'POST',
    path: '/v3/projects',
    body: {
      project: property
    }
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.project);
  });
};

Client.prototype.createTenant = function(property, callback) {
  return this.createProject(property, callback);
};

/**
 * Client.deleteProject
 *
 * @description helper function for delete a project via remote API.
 *
 * @param project_id
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.deleteProject = function (project_id, callback) {
  var project_id = (typeof project_id === 'object') ? project_id.project_id : project_id;
  this.emit('log::trace', 'Deleting project', project_id);

  return this._request({
    method: 'DELETE',
    path: urlJoin('/v3/projects', project_id),
  }, function (err) {
    return callback(err);
  });
};
Client.prototype.deleteTenant = function(project_id, callback) {
  return this.deleteProject(project_id, callback);
};

/**
 * Client.updateProject
 *
 * @description helper function for update a project via remote API.
 *
 * @param project_id
 * @param property
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.updateProject = function (project_id, property, callback) {
  if (typeof project_id === 'object') {
    callback = property;
    property = project_id;
    project_id = property.project_id;
  }
  this.emit('log::trace', 'Updating project', project_id, property);

  return this._request({
    method: 'PATCH',
    path: urlJoin('/v3/projects', project_id),
    body: {
      project: property
    }
  }, function (err, body) {
    return err ? callback(err) : callback(null, body.project);
  });
};
Client.prototype.updateTenant = function(project_id, property, callback) {
  return this.updateProject(project_id, property, callback);
};


/**
 * Client.createUser
 *
 * @description helper function for create a user via remote API.
 *
 * @param property
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.createUser = function (property, callback) {
  this.emit('log::trace', 'Creating user', property);

  return this._request({
    method: 'POST',
    path: '/v2.0/users',
    body: {
      user: property
    }
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.user);
  });
};

/**
 * Client.getUserById
 *
 * @description helper function for get a user by id via remote API.
 *
 * @param user_id
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.getUserById = function (user_id, callback) {
  var user_id = (typeof user_id === 'object') ? user_id.id : user_id;

  return this._request({
    method: 'GET',
    path: urlJoin('/v2.0/users', user_id),
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.user);
  });
};

/**
 * Client.updateUser
 *
 * @description helper function for update a user via remote API.
 *
 * @param user_id
 * @param property
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.updateUser = function (user_id, property, callback) {
  if (typeof user_id === 'object') {
    callback = property;
    property = user_id;
    user_id = property.id;
  }
  this.emit('log::trace', 'Updating user', user_id, property);

  return this._request({
    method: 'PUT',
    path: urlJoin('/v2.0/users', user_id),
    body: {
      user: property
    }
  }, function (err, body) {
    return err ? callback(err) : callback(null, body.user);
  });
};

/**
 * Client.deleteUser
 *
 * @description helper function for delete a user by id via remote API.
 *
 * @param user_id
 * @param callback
 * @returns {*}
 * @private
 */
Client.prototype.deleteUser = function (user_id, callback) {
  var user_id = (typeof user_id === 'object') ? user_id.id : user_id;
  this.emit('log::trace', 'Deleting user', user_id);

  return this._request({
    method: 'DELETE',
    path: urlJoin('/v2.0/users', user_id),
  }, function (err) {
    return callback(err);
  });
};

