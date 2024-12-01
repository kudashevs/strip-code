// @ts-check
'use strict';

import Ajv from 'ajv';
const ajv = new Ajv({allErrors: true, strict: false, verbose: false});
import AvjErrors from 'ajv-errors';
AvjErrors(ajv /*, {singleError: true} */);

/**
 * @param {Object} schema
 * @param {Object} options
 * @param {Array<string>|undefined} [options.skips]
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>|undefined} [options.blocks]
 * @param {Object} [config]
 * @param {Object.<string, Array<string>>|undefined} [config.orders]
 */
function validate(schema, options, config = {}) {
  const validator = ajv.compile(schema);
  const validation = validator(options);

  if (!validation) {
    const errors = validator.errors || [];
    const message = formatValidationErrors(errors, config);

    throw new Error(message);
  }
}

/**
 * @param {Array<{keyword: string, instancePath: string, message?: string}>} errors
 * @param {Object} [config]
 * @param {Object.<string, Array<string>>|undefined} [config.orders]
 *
 * @returns {string}
 */
function formatValidationErrors(errors, config) {
  // prettier-ignore
  const errorsWithPriorities = errors
    .filter(isVisibleValidationError)
    .map(addPriorities(config));

  return errorsWithPriorities
    .sort(sortByPriorities)
    .map(err => err.message)
    .join(' and ');
}

/**
 * @param {Object} err
 * @param {string} err.keyword
 *
 * @returns {boolean}
 */
function isVisibleValidationError(err) {
  // prettier-ignore
  return err.keyword !== 'oneOf'
    && err.keyword !== 'if'
    && err.keyword !== 'then'
    && err.keyword !== 'else';
}

/**
 * @param {Object} [config]
 * @param {Object.<string, Array<string>>|undefined} [config.orders]
 *
 * @returns ({{keyword: string, instancePath: string, message?: string}}) => {{keyword: string, instancePath: string, message?: string, priorityByIndex: number, priorityByName: number}}
 */
function addPriorities(config) {
  /**
   * @param {{keyword: string, instancePath: string, message?: string}} err
   *
   * @returns {{keyword: string, instancePath: string, message?: string, priorityByIndex: number, priorityByName: number}}
   */
  return function (err) {
    // prettier-ignore
    const [
      section,
      position = 99,
      name = '',
    ] = err.instancePath.replace(/^\//, '').split('/');
    const order = config?.orders?.[section] || [];

    Object.defineProperties(err, {
      priorityByIndex: {
        value: position,
      },
      priorityByName: {
        value: retrieveOrder(name, order),
      },
    });

    return err;
  };
}

/**
 * @param {string} name
 * @param {Array<string>} order
 *
 * @returns {number}
 */
function retrieveOrder(name, order) {
  order = order || [];
  for (let i = 0; i < order.length; i++) {
    if (name.includes(order[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * @param {{priorityByIndex: number, priorityByName: number, instancePath: string}} a
 * @param {{priorityByIndex: number, priorityByName: number, instancePath: string}} b
 *
 * @returns {number}
 */
function sortByPriorities(a, b) {
  // prettier-ignore
  return a.priorityByIndex - b.priorityByIndex
    || a.priorityByName - b.priorityByName
    || a.instancePath.localeCompare(b.instancePath);
}

export default validate;
