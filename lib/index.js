// @ts-check
'use strict';

import validate from './validator.js';
import {createRequire} from 'module';
import {EOL} from 'os';

const require = createRequire(import.meta.url);
const schema = require('./options.json');
const config = require('./config.json');

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
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>|undefined} [options.blocks]
 *
 * @return {string}
 *
 * @throws {Error} It throws an Error when options do not match the schema.
 */
function StripCode(content, options = {}) {
  if (shouldSkipProcessing(options)) {
    return content;
  }

  validate(schema, options, config);

  return stripCodeFrom(content, options.blocks ?? []);
}

/**
 * @param {Object} options
 * @param {Array<string>} [options.skips]
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>|undefined} [options.blocks]
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
 * @return {boolean}
 */
function shouldSkipEnvironment(skips = []) {
  const excluded = [...EXCLUDE_ENVS, ...skips];
  const env = process.env.NODE_ENV ?? '';

  return excluded.includes(env);
}

/**
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>|undefined} blocks
 *
 * @return {boolean}
 */
function shouldSkipEmptyBlocks(blocks) {
  return Array.isArray(blocks) && blocks.length === 0;
}

/**
 * @param {string} content
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>} blockOptions
 *
 * @return {string}
 */
function stripCodeFrom(content, blockOptions) {
  blockOptions.forEach(function (blockOption) {
    const block = prepareBlockFromOption(blockOption);
    const {start, end, prefix, suffix} = block;

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
 * @param {string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}} option
 *
 * @return {{start: string, end: string, prefix: string, suffix: string, replacement?: string}}
 */
function prepareBlockFromOption(option) {
  let block = {};

  if (typeof option === 'string') {
    block = generateBlockFromString(option, option);
  }

  if (typeof option === 'object') {
    block = generateBlockFromObject(option);
  }

  // @ts-expect-error
  return escapeBlockElements(block);
}

/**
 * note: default empty start and end guarantee that it won't remove anything even if the argument is wrong.
 *
 * @param {string} start
 * @param {string} end
 *
 * @return {{start: string, end: string, prefix: string, suffix: string, replacement: string}}
 */
function generateBlockFromString(start = '', end = '') {
  return {
    start: `${start}${DEFAULT_SEPARATOR}start`,
    end: `${end}${DEFAULT_SEPARATOR}end`,
    prefix: DEFAULT_TAG_PREFIX,
    suffix: DEFAULT_TAG_SUFFIX,
    replacement: '',
  };
}

/**
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} values
 *
 * @return {{start: string, end: string, prefix: string, suffix: string, replacement?: string}}
 */
function generateBlockFromObject(values) {
  const defaults = generateBlockFromString();

  return {...defaults, ...values};
}

/**
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} block
 *
 * @return {{start: string, end: string, prefix: string, suffix: string, replacement?: string}}
 */
function escapeBlockElements(block) {
  const keysToEscape = ['start', 'end', 'prefix', 'suffix'];

  /** @type {Object.<string, string>} */
  const escaped = {};
  for (const [key, value] of Object.entries(block)) {
    escaped[key] = keysToEscape.includes(key) ? regexEscape(value) : value;
  }

  return escaped;
}

/**
 * @param {string} str
 */
function regexEscape(str) {
  return str.replace(/([\^$.*+?=!:\\\/()\[\]{}])/gi, '\\$1');
}

/**
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @return {string}
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
 * @return {boolean}
 */
function isMultiLine(str) {
  return /[\r\n]/.test(str);
}

/**
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @return {string}
 */
function prepareMultiLineReplacement(block, found) {
  // prettier-ignore
  return (block.replacement)
    ? found.preline + found.prespace + block.replacement + found.postspace + found.endline
    : found.preline + '';
}

/**
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @return {string}
 */
function prepareSingleLineReplacement(block, found) {
  if (isWholeLine(found)) {
    // prettier-ignore
    return (block.replacement)
      ? found.preline + found.prespace + block.replacement + EOL
      : EOL;
  }

  return found.prespace + block.replacement + found.postspace + found.endline;
}

/**
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @return {boolean}
 */
function isWholeLine(found) {
  return found.preline.length > 0 && found.endline.length > 0;
}

export default StripCode;
