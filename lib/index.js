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
 * @returns {boolean}
 */
function shouldSkipEnvironment(skips = []) {
  const excluded = [...EXCLUDE_ENVS, ...skips];
  const env = process.env.NODE_ENV ?? '';

  return excluded.includes(env);
}

/**
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>|undefined} blocks
 *
 * @returns {boolean}
 */
function shouldSkipEmptyBlocks(blocks) {
  return Array.isArray(blocks) && blocks.length === 0;
}

/**
 * @param {string} content
 * @param {Array<string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}>} blocks
 *
 * @return {string}
 */
function stripCodeFrom(content, blocks) {
  blocks.forEach(function (rawBlock) {
    const block = prepareBlock(rawBlock);
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
 * @param {string|{start: string, end: string, prefix: string, suffix: string, replacement?: string}} representation
 *
 * @return {{start: string, end: string, prefix: string, suffix: string, replacement?: string}}
 */
function prepareBlock(representation) {
  let block = {};

  if (typeof representation === 'string') {
    block = generateBlockFromString(representation, representation);
  }

  if (typeof representation === 'object') {
    block = generateBlockFromObject(representation);
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
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} block
 *
 * @return {{start: string, end: string, prefix: string, suffix: string, replacement?: string}}
 */
function generateBlockFromObject(block) {
  const defaults = generateBlockFromString();

  return {...defaults, ...block};
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
 * @param {{start: string, end: string, prefix: string, suffix: string, replacement?: string}} block
 * @param {{preline: string, prespace: string, marked: string, postspace: string, endline: string}} found
 *
 * @returns {string}
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
 * @returns {string}
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
 * @returns {boolean}
 */
function isWholeLine(found) {
  return found.preline.length > 0 && found.endline.length > 0;
}

export default StripCode;
