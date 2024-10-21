'use strict';

const {EOL} = require('os');

const EXCLUDE_MODES = ['development'];
const DEFAULT_LABEL = 'devblock';
const BLOCK_START = 'start';
const BLOCK_END = 'end';
const COMMENT_START = '/*';
const COMMENT_END = '*/';

const defaultOptions = {
  blocks: [generateDefaultOptions(DEFAULT_LABEL)],
};

/**
 * @param {string} label
 *
 * @return {Object}
 */
function generateDefaultOptions(label) {
  return {
    start: `${label}:${BLOCK_START}`,
    end: `${label}:${BLOCK_END}`,
    prefix: COMMENT_START,
    suffix: COMMENT_END,
    keepspace: true,
    replacement: null,
  };
}

/**
 * @param {string} content
 * @param options
 *
 * @return {string}
 */
function RemoveCodeBlocks(content, options = {}) {
  if (shouldSkip(process.env.NODE_ENV)) {
    return content;
  }

  if (isEmpty(options)) {
    options = defaultOptions;
  }

  options.blocks.forEach(function (block) {
    if (typeof block === 'string') {
      block = generateDefaultOptions(block);
    }

    let prefix = block.prefix ? regexEscape(block.prefix) : '';
    let suffix = block.suffix ? regexEscape(block.suffix) : '';
    let start = regexEscape(block.start);
    let end = regexEscape(block.end);

    // prettier-ignore
    let regex = new RegExp(
      // '(\\n?)([\\t ]*)' + prefix + '[\\t ]* ?' + start + '[\\t ]* ?' + suffix + '([\\s\\S]*?)?' + prefix + '[\\t ]* ?' + end + '[\\t ]* ?' + suffix + '([\\t ]*)(\\n?)',
      '(\\n?)([\\t ]*)' + prefix + '[\\t ]*?' + start + '[\\t ]*?' + suffix + '([\\s\\S]*?)?' + prefix + '[\\t ]*?' + end + '[\\t ]*?' + suffix + '([\\t ]*)(\\n?)',
      'g'
    );

    content = content.replaceAll(regex, (substring, preline, prespace, marked, postspace, endline) => {
      let found = {preline, prespace, marked, postspace, endline};

      if (hasReplacement(block)) {
        return prepareWithReplacement(block, found);
      }

      return prepareWithoutReplacement(block, found);
    });
  });

  return content;
}

/**
 * @param {string} mode
 *
 * @return {boolean}
 */
function shouldSkip(mode) {
  return EXCLUDE_MODES.includes(mode);
}

/**
 * @param {Object} options
 *
 * return {boolean}
 */
function isEmpty(options) {
  return Object.keys(options).length === 0;
}

/**
 * @param {string} str
 */
function regexEscape(str) {
  return str.replace(/([\^$.*+?=!:\\\/()\[\]{}])/gi, '\\$1');
}

/**
 * @param {Object} block
 *
 * @returns {boolean}
 */
function hasReplacement(block) {
  return Object.prototype.hasOwnProperty.call(block, 'replacement') && block.replacement !== null;
}

/**
 * @param {Object} block
 * @param {Object} found
 *
 * @returns {string}
 */
function prepareWithReplacement(block, found) {
  if (isMultiLine(found.marked)) {
    return prepareMultiLineWithReplacement(block, found);
  }

  return prepareSingleLineWithReplacement(block, found);
}

function prepareMultiLineWithReplacement(block, found) {
  if (block.keepspace) {
    let trailingSpaces = found.marked.match(/\*?([ \t]*)$/g)[0] || '';
    return found.preline + trailingSpaces + block.replacement + EOL;
  }

  return found.preline + block.replacement + EOL;
}

function prepareSingleLineWithReplacement(block, found) {
  if (block.keepspace) {
    return isWholeLine(found)
      ? found.preline + found.prespace + block.replacement + EOL
      : found.preline + found.prespace + block.replacement + found.postspace;
  }

  return isWholeLine(found) ? found.preline + '' + block.replacement + EOL : found.preline + '' + block.replacement;
}

/**
 * @param {Object} found
 *
 * @returns {boolean}
 */
function isWholeLine(found) {
  return found.preline.length && found.endline.length;
}

/**
 * @param {string} str
 *
 * @returns {boolean}
 */
function isMultiLine(str) {
  return /\r|\n/.test(str);
}

/**
 * @param {Object} block
 * @param {Object} found
 *
 * @returns {string}
 */
function prepareWithoutReplacement(block, found) {
  if (isMultiLine(found.marked)) {
    return prepareMultiLineWithoutReplacement(block, found);
  }

  return prepareSingleLineWithoutReplacement(block, found);
}

function prepareMultiLineWithoutReplacement(block, found) {
  if (block.keepspace) {
    return found.preline + found.postspace;
  }

  return found.preline + '';
}

function prepareSingleLineWithoutReplacement(block, found) {
  if (block.keepspace) {
    return isWholeLine(found) ? found.preline + '' : found.preline + found.prespace + found.postspace;
  }

  return found.preline + '';
}

module.exports = RemoveCodeBlocks;
