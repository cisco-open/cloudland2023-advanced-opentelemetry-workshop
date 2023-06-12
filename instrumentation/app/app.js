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
const express = require("express");
const mySimpleDB = require("../lib/index.js");
// TODO:
// * Import OpenTelemetry API
// * Acquire Tracer & Meter
// * Create a counter (or UpDownCounter) called "query counter" of type INT
//   that "counts how many queries have been executed"

const PORT = parseInt(process.env.PORT || "8080");
const app = express();

function validate(key, value) {
  // TODO:
  // Create a validation span
  // the SpanType is 'INTERNAL'
  // The SpanStatus depends on the error
  // Set `exception.` attributes accordingly
  // Set `code.` attributes accordingly
  if (typeof key !== "string") {
    return { error: "key is not a string" };
  }
  if (isNaN(value)) {
    return { error: "value is not a number" };
  }
  return { key, value };
}

app.get("/list", (req, res) => {
  mySimpleDB.query("SELECT * FROM entries").then((result) => {
    // TODO: increment the query counter by 1
    res.send(result);
  });
});

app.get("/get", (req, res) => {
  const key = req.query.key;
  mySimpleDB
    .query(`SELECT * FROM entries WHERE key = ${key}`)
    .then((result) => {
      // TODO: increment the query counter by 1
      res.send(result);
    });
});

app.get("/add", (req, res) => {
  const { error, key, value } = validate(
    req.query.key,
    parseInt(req.query.value, 10)
  );
  if (error) {
    // We send a validation error.
    res.send(422);
  }
  mySimpleDB
    .query(`INSERT INTO entries (key,value) values (${key},${value})`)
    .then((result) => {
      // TODO: increment the query counter by 1
      res.send(result);
    });
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
