const { parse, read, write, buildQuery } = require("./lowlevel.js");
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
// TODO:
// * Important OpenTelemetry API & SemanticAttributes
// * Acquire Tracer

module.exports = {
  query: async function (queryString, debug = false) {
    // TODO:
    // * Remove all if(debug) { ... }
    // * Create a span that wraps query execution
    // * Make sure that the span ends AFTER the
    //   low level function has finished (between const result = ... & return result)
    // * Provide error details for not supported operations.
    // * Make use of db.* semantic conventions to set db system type (mysimpledb),
    //  db operation (query.op), db statement (buildQuery(query)), code function ('query) and code file path (__filename)

    const query = parse(queryString);
    if (debug) {
      console.log("Query: ", query);
    }
    if (query.op === "INSERT") {
      const result = await write(query.table, query.columns, query.values);
      return result;
    }
    if (query.op === "SELECT") {
      const result = read(query.table, query.columns, query.where);
      return result;
    }
    if (debug) {
      console.log(`Operation ${query.op} is not supported`);
    }
    throw new OperationNotSupportedError(query.op);
  },
};
