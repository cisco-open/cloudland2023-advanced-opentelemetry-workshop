/*
  SPDX-License-Identifier: Apache-2.0

  Copyright (c) 2023 Cisco Systems, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const util = require('util');
const os = require('os');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

function sleep(delay, deviation) {
  d = delay + Math.random() * 2 * deviation - deviation;
  return new Promise((resolve) => {
    setTimeout(() => resolve({}), d);
  });
}

function getFile() {
  return path.join(os.tmpdir(), 'my-simple-database');
}

class OperationNotSupportedError extends Error {
  constructor(operation) {
    super(`Operation ${operation} is not supported.`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  OperationNotSupportedError,
  read: async function (table, columns, where) {
    const db = getFile();
    await sleep(150, 50);
    const { stdout, stderr } = await exec(
      `[ -f ${db} ] && cat ${db} || echo '{}'`
    );
    const current = JSON.parse(stdout);
    if (where.value) {
      return current[where.value];
    }
    return current;
  },
  write: async function (table, columns, values) {
    try {
      const db = getFile();
      await sleep(300, 100);
      const { stdout, stderr } = await exec(
        `[ -f ${db} ] && cat ${db} || echo '{}'`
      );
      const current = JSON.parse(stdout);
      current[values[0]] = values[1];
      const { stdout2, stderr2 } = await exec(
        `echo '${JSON.stringify(current)}' > ${db}`
      );
      return true;
    } catch (e) {
      return false;
    }
  },
  buildQuery: function (queryObject, sanitized = true) {
    if (queryObject.op === 'SELECT') {
      let str = `${queryObject.op} ${queryObject.columns.join(',')} FROM ${
        queryObject.table
      }`;
      if (queryObject.where.column) {
        str += ` WHERE ${queryObject.where.column} = ${
          sanitized ? '?' : queryObject.where.value
        }`;
      }
      return str;
    }
    if (queryObject.op === 'INSERT') {
      return `${queryObject.op} INTO ${
        queryObject.table
      } (${queryObject.columns.join(',')}) VALUES (${
        sanitized ? '?' : queryObject.values.join(',')
      })`;
    }
    return 'UNKNOWN';
  },
  parse: function (queryString) {
    const segments = queryString.split(' ');
    if (segments[0] === 'SELECT' && segments.length === 4) {
      return {
        op: 'SELECT',
        columns: ['*'],
        table: 'entries',
        where: {},
      };
    }
    if (segments[0] === 'SELECT' && segments.length === 8) {
      return {
        op: 'SELECT',
        columns: ['key', 'value'],
        table: 'entries',
        where: {
          column: 'key',
          value: segments[7],
        },
      };
    }
    if (segments[0] === 'INSERT') {
      return {
        op: 'INSERT',
        columns: ['key', 'value'],
        table: 'entries',
        values: segments[5].slice(1, -1).split(','),
      };
    }
    return {
      op: 'UNKNOWN',
    };
  },
};
