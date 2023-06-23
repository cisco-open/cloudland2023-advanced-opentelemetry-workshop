# Manual, automatic and native instrumentation

In this directory you will find a [basic application](./app) written in Node.JS
that makes use of a Database called `mysimpledb` which is accessed using a
[library](./lib).

You can start the application by going into the `app` folder and running the app
with Node.JS:

```bash
cd app
npm install
node app.js
```

For faster development you can use `nodemon`, which will make sure that your
application is restarted on a file change:

```bash
npx nodemon app/app.js
```

\*_Note_: By running the application from the parent directory, it will also be
restarted when you apply changes to the `mysimpledb` library code.

\*_Note_: If you don't have `Node.JS` installed locally, you can use a container for development:

```bash
docker run -p 8080:8080 --rm -t -i -v ${PWD}:/app:z node:18-alpine /bin/sh
```

## Step 1: Application instrumentation

To quickly instrument your application make use of the predefined
[instrumentation.js](./app/instrumentation.js):

```shell
cd app
npm install npm install @opentelemetry/sdk-node @opentelemetry/api @opentelemetry/auto-instrumentations-node @opentelemetry/sdk-metrics
cd ..
npx nodemon -r ./app/instrumentation.js app/app.js
```

This formally counts as _manual_ instrumentation since the `instrumentation.js`
is part of your codebase and it's your responsibility to maintain and keep it
updated, for real _automatic_ instrumentation make use of the
[auto-instrumentation-node](https://www.npmjs.com/package/@opentelemetry/auto-instrumentations-node)
package:

```bash
node --require '@opentelemetry/auto-instrumentations-node/register' app/app.js
```

This package currently does not support metrics, so we stick with the manual
instrumentation for now.

## Step 2: Add custom spans and metrics to your application

Review the [app/app.js](./app/app.js), there are multiple TODOs for you to
complete. The goal is to have the application emit one additional span and a
metric.

Run the application _with instrumentation_ once to verify that your code is
working.

Run the application **\*without** instrumentation\* to see that the
OpenTelemetry API is not active and no telemetry is produced and computation
resources are minimized.

## Step 3: _Natively_ instrument the `mysimpledb` library

If the application would use well-established databases like mySQL, sqlite or
mongo, you would be able to use existing
[instrumentation libraries](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node).
But there is none for the not-so-well-known `mysimpledb`. However, instead of
providing an instrumentation library that is separate from the library itself,
we are going to provide _native instrumentation_ by adding OpenTelemetry code
into it directly.

Review the [lib/index.js](./lib/index.js), there are again multiple TODOs for
you to complete. The goal is to have the application when instrumented emit
additional spans for the `mysimpledb` queries.

After finishing, once again, run the application _with_ and _without_
instrumentation to verify that your code is working and to make sure that the
library still works if the OpenTelemetry SDK is not present (so that the
OpenTelemetry API works in a "no-op" mode.)
