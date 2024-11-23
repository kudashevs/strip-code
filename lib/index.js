'use strict';

import validate from './validator.js';
import schema from './options.json';
import config from './config.json';
import {EOL} from 'os';

/** type {Array<string>} */
const EXCLUDE_ENVS = ['development'];
/** type {string} */
const DEFAULT_SEPARATOR = '-';
/** type {string} */
const DEFAULT_TAG_PREFIX = '/*';
/** type {string} */
const DEFAULT_TAG_SUFFIX = '*/';

/**
 * @param {string} content
 * @param {Object} options
 * @param {Array<string>|undefined} [options.skips]
 * @param {Array<string|{name: string, prefix: string, suffix: string}>|undefined} [options.blocks]
 *
 * @return {string}
 *
 * @throws {Error} Will throw an Error when options do not match the schema.
 */
function StripCode(content, options = {}) {
  if (shouldSkipProcessing(options)) {
    return content;
  }

  validate(schema, options, config);

  return removeBlocksFrom(content, options.blocks ?? []);
}

/**
 * @param {Object} options
 * @param {Array<string>} [options.skips]
 * @param {Array<string|{name: string, prefix: string, suffix: string}>|undefined} [options.blocks]
 *
 * @return {boolean}
 */
function shouldSkipProcessing(options) {
  if (shouldSkipEnvironment(options.skips)) {
    return true;
  }

  if (shouldSkipEmptyBlocks(options.blocks)) {
    return true;
  }

  return false;
}

/**
 * @param {Array<string>} skips
 *
 * @returns {boolean}
 */
function shouldSkipEnvironment(skips = []) {
  const excluded = [...EXCLUDE_ENVS, ...skips];
  const env = process.env.NODE_ENV ?? '';

  return excluded.includes(env);
}

/**
 * @param {Array<string|{name: string, prefix: string, suffix: string}>|undefined} blocks
 *
 * @returns {boolean}
 */
function shouldSkipEmptyBlocks(blocks) {
  return Array.isArray(blocks) && blocks.length === 0;
}

/**
 * @param {string} content
 * @param {Array<string|{name: string, prefix: string, suffix: string}>} blocks
 *
 * @return {string}
 */
function removeBlocksFrom(content, blocks) {
  blocks.forEach(function (block) {
    const {start, end, prefix, suffix} = prepareBlock(block);

    const regex = new RegExp(
      // prettier-ignore
      '(\\n?)([\\t ]*)' + prefix + '[\\t ]* ?' + start + '[\\t ]* ?' + suffix + '([\\s\\S]*?)?' + prefix + '[\\t ]* ?' + end + '[\\t ]* ?' + suffix + '([\\t ]*)(\\n?)',
      'g',
    );

    content = content.replace(regex, (substring, preline, prespace, marked, postspace, endline) => {
      const found = {preline, prespace, marked, postspace, endline};

      return prepareReplacement(block, found);
    });
  });

  return content;
}

/**
 * @param {string|{name: string, prefix: string, suffix: string}} blockFromOptions
 *
 * return {{start: string, end: string, prefix: string, suffix: string}}
 */
function prepareBlock(blockFromOptions) {
  let block = {start: '', end: '', prefix: '', suffix: ''};

  if (typeof blockFromOptions === 'string') {
    block = generateBlockFromString(blockFromOptions);
  }

  if (typeof blockFromOptions === 'object') {
    block = generateBlockFromObject(blockFromOptions);
  }

  return escapeBlockElements(block);
}

/**
 * note: default empty name guarantees that it won't remove anything even if the argument is wrong.
 *
 * @param {string} name
 *
 * @return {{start: string, end: string, prefix: string, suffix: string}}
 */
function generateBlockFromString(name = '') {
  return {
    start: `${name}${DEFAULT_SEPARATOR}start`,
    end: `${name}${DEFAULT_SEPARATOR}end`,
    prefix: DEFAULT_TAG_PREFIX,
    suffix: DEFAULT_TAG_SUFFIX,
  };
}

/**
 * @param {{name: string, prefix: string, suffix: string}} block
 *
 * return {{start: string, end: string, prefix: string, suffix: string}}
 */
function generateBlockFromObject(block) {
  const defaults = generateBlockFromString(block.name);

  return {...defaults, ...block};
}

/**
 * @param {{start: string, end: string, prefix: string, suffix: string}} block
 *
 * return {{start: string, end: string, prefix: string, suffix: string}}
 */
function escapeBlockElements(block) {
  return {
    start: regexEscape(block.start),
    end: regexEscape(block.end),
    prefix: regexEscape(block.prefix),
    suffix: regexEscape(block.suffix),
  };
}

/**
 * @param {string} str
 */
function regexEscape(str) {
  return str.replace(/([\^$.*+?=!:\\\/()\[\]{}])/gi, '\\$1');
}

/**
 * @param {Object} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @returns {string}
 */
function prepareReplacement(block, found) {
  if (isMultiLine(found.marked)) {
    return prepareMultiLineReplacement(block, found);
  }

  return prepareSingleLineReplacement(block, found);
}

/**
 * @param {string} str
 *
 * @returns {boolean}
 */
function isMultiLine(str) {
  return /[\r\n]/.test(str);
}

/**
 * @param {Object} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @returns {string}
 */
function prepareMultiLineReplacement(block, found) {
  return found.preline + '';
}

/**
 * @param {Object} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @returns {string}
 */
function prepareSingleLineReplacement(block, found) {
  if (isWholeLine(found)) {
    return EOL;
  }

  return found.prespace + '' + found.postspace + found.endline;
}

/**
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @returns {boolean}
 */
function isWholeLine(found) {
  return found.preline.length > 0 && found.endline.length > 0;
}

export default StripCode;
