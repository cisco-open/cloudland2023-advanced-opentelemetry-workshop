# Collector

In this directory you will find a set of _stub_ collector configuration, which
we are going to fill out step-by-step.

Before you proceed, ideally, you have finished the
[instrumentation](../instrumentation/) tutorial, although the following also
works without it, but you will get less traces & metrics.

## Step 1: Setup a basic collector

Review the file [collector-config-1.yaml](./collector-config-1.yaml), which we
will use to setup a first collector. It contains a very basic setup:

- OTLP receivers for all three signals (traces, metrics logs)
- batch processors for all three signals
- two different `logging` exporters, one which will give basic information for
  telemetry received and one which will give detailed information, i.e. print
  all data to the console
- Look how we make use of both by turning on detailed telemetry for traces, but
  only basic for metrics and logs. You can use that pattern when setting up and
  troubleshooting your collectors.

To run the collector, spin up your docker engine and do the following:

```shell
docker run --rm -p 4317-4318:4317-4318 -v $(pwd)/collector-config-1.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib:latest
```

This way we start a collector using the
[collector-config-1.yaml](./collector-config-1.yaml) and open the OTLP ports to
be available locally.

Next, we want some traces & metrics send to our collector. We are going to use
the application from the [instrumentation](../instrumentation/) tutorial:

In the [instrumentation](../instrumentation/) tutorial we only made use of
exporters that print telemetry to the console, we now want to make use of the
OpenTelemetry Protocol (OTLP) to send telemetry to the collector, for this go
back to the [../instrumentation/app](../instrumentation/app) folder and install
the required dependencies:

```shell
npm install --save @opentelemetry/exporter-trace-otlp-proto @opentelemetry/exporter-metrics-otlp-proto
```

The folder already holds an additional
[instrumentation.otlp.js](../instrumentation/app/instrumentation.otlp.js) file,
that helps you to emit traces to your collector:

```shell
env OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:4318 npx nodemon -r ./app/instrumentation.otlp.js app/app.js
```

If all goes well your collector should dump traces & metrics to the console.

## Step 2: Loadbalancing with NGINX

In a real world scenario you want to have high availability for your collector.
To accomplish this you can setup a pair of collector behind a loadbalancer, e.g.
a NGINX instance. Review the [nginx-lb.conf](./nginx-lb.conf): it provides
balancing for gRPC and HTTP for two collectors. To start the nginx and a pair of
collector run

```shell
docker compose up
```

You should see two collectors, one nginx and one instance of the
[app](../instrumentation/app) coming back. The app will send some traces on
startup so one (or both) collectors will report them via the `logging/detailed`
exporter. Send some additional requests to the service, e.g. via
`curl http://localhost:8080/list` and see if/how they get distributed among both
collectors. To do so with some pressure run the load in a loop:

```shell
while [ true ] ; do curl localhost:8080/list; sleep 0.1; done;
```

Now, while running the load and seeing traces being sent to both collectors,
stop one of them forcefully:

```shell
docker stop collector-collector1-1
```

Check the nginx logs (e.g. `docker logs collector-loadbalancer1-1`), you should
see a line saying something like
`upstream server temporarily disabled while connecting to upstream`.

You have successfully made sure that no span gets left behind!

## Step 3: Loadbalancing with NGINX

NGINX is not trace aware, that's why a
[loadbalancing](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter)
exporter exists. So instead of using NGINX, you can use a third collector which
balances the load among the other two: Review the file
[collector-config-lb.yaml](./collector-config-lb.yaml), where you can see a
collector config making use of the `loadbalancing` exporter. Next, open the
`docker-compose.yaml` and uncomment the service `loadbalancer2`. Make also sure
that the service `app` is updated with the right exporter endpoint at
`loadbalancer2`: `OTEL_EXPORTER_OTLP_ENDPOINT=http://loadbalancer2:4318`

Run `docker compose up` once again, this time all traffic should flow through
the `loadbalancer2` service.

With our setup we are not able to validate the trace-awareness. As an optional
task, you can spin up the
[OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) and
report it's traces via the loadbalancing exporter.

## Step 4: "A path forward no matter where you are on your observability journey."

[One of the promises OpenTelemetry makes](https://opentelemetry.io/docs/what-is-opentelemetry/#what-can-opentelemetry-do-for-me),
is that it provides you _"A path forward no matter where you are on your
observability journey._"

This is mainly accomplished by providing compatibility to existing observability
frameworks (Jaeger, Zipkin, Prometheus), but also by providing receivers for the
collector, that can collect traces, logs & metrics for you from arbitrary
sources like

- [Docker Stats API](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/dockerstatsreceiver)
- [Host Metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)
- [HTTP Check](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/httpcheckreceiver)
- [NGINX](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/nginxreceiver)
- [Log files](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
- [... and many more](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/)

In this step we want to setup a few of those. Open the
[docker-compose.yml](./docker-compose.yml) once again, since we need to add some
volumes to `collector1` to provide access to `docker.sock` and the Host-Root-FS.
Uncomment the following lines:

```yaml
- /var/run/docker.sock:/var/run/docker.sock
- /:/hostfs
```

Next, open the [collector-config-1.yaml](./collector-config-1.yaml). First set
the metrics exporter from `logging` to `logging/detailed`, such that metrics
will be visible to you. Then add configuration for some of the receivers. It is
recommended to add them one-by-one to see them in action.

```yaml
  nginx:
    endpoint: "http://loadbalancer1:80/nginx_status"
    collection_interval: 10s
  httpcheck:
    endpoint: "https://docs.opentelemetry.io"
    method: GET
    collection_interval: 10s
  docker_stats:
    collection_interval: 10s
  hostmetrics:
    root_path: /hostfs
    collection_interval: 10s
    scrapers:
      cpu:
      disk:
      load:
      filesystem:
      memory:
      network:
      paging:
      processes:

service:
  pipelines:
    metrics:
      receivers: [nginx,docker_stats,hostmetrics,httpcheck,otlp]
```

You should now have a lot more metrics for your infrastructure and remote
services!

## Step 4: Create receivers on demand

You very likely have log files stored in some files, so making use of the
[filelogreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
is definitely something you want!

Since our tutorial is running on plain docker, we want to try out to get all
logs from the docker containers. They are by default located at
`/var/lib/docker/containers:/var/lib/docker/containers`, so as a first step we
provide one more volume to the `collector1` service, by uncommenting the
following line:

```yaml
- /var/lib/docker/containers:/var/lib/docker/containers
```

Now we can not add the `filelogreceiver` into the `receivers` section of our
collector config, because there are some container logs we want to skip
(especially from our collectors to avoid some loops in log collection) and we
also want logs for containers that are created post start of the collector. Both
is not possible with the `filelogreceiver` out of the box.

What we need to use to accomplish both is a combination of the
[docker observer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/dockerobserver)
and the
[receivercreator](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/receivercreator)

```yaml
extensions:
  docker_observer:
    excluded_images: ['*collector*']

receivers:
  receiver_creator:
    watch_observers: [docker_observer]
    receivers:
      filelog:
        rule: type == "container"
        config:
          include:
            [
              '/var/lib/docker/containers/`container_id`/`container_id`-json.log',
            ]
          resource:
            container.id: '`container_id`'
          operators:
            - type: json_parser
              timestamp:
                parse_from: attributes.time
                layout: '%Y-%m-%dT%H:%M:%S.%LZ'
              severity:
                parse_from: attributes.stream
                preset: info
                mapping:
                  error: stderr
                  info: stdout

service:
  extensions:
    - docker_observer
  pipelines:
    logs:
      receivers: [otlp, receiver_creator]
      exporters: [logging/detailed]
```

There is a lot going on in this config update. Take some time to review what is
going on here:

- We add the `docker_observer` as an extension and tell it to observe the Docker
  API (but ignore containers with `*collector*` in their image name).
- We add the `receiver_creator` to the `logs.receivers`. The `receiver_creator`
  will _"connect"_ with the `docker_observer` and instantiate a `filelog`
  receiver every time a new container comes up. The config is tailored in a way
  that it picks up the right log file, adds the `container.id` as an attribute
  and does some parsing for you already.
- We update the `logs.exporters` from `logging` to `logging/detailed` to see
  collected logs printed to the console.

Run a `docker compose up` once again, after a while the logs for `collector1`
should show the other logs as well.

## Step 5: Multiple backends

The OpenTelemetry Collector can have multiple receivers, but also multiple exporters
to different backends. You can try this out by starting some OSS backends on your
local machine, updating your docker-compose file:

```yaml
  ## Local backends
  viewer:
    build: ./desktop-viewer
    ports:
      - "8000:8000"
  teletrace:
    image: teletrace/teletrace:latest
    command: ["--config=/etc/teletrace-collector-config.yaml"]
    volumes:
      - ./teletrace.yaml:/etc/teletrace-collector-config.yaml
    environment:
      - SPANS_STORAGE_PLUGIN=sqlite
    ports:
      - "8090:8080"
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - "./prometheus.yaml:/etc/prometheus/prometheus.yml"
    ports:
      - "9090:9090" 
```

Instead of updating the existing config files, we want to make use of multiple
config files which are merged by the collector for you. Update your composer
setup accordingly:

```yaml
    command: ["--config=/etc/otel-collector-config.yaml", "--config=file:/etc/otel-collector-config-exporters.yaml"]
    volumes:
      - ./collector-config-2.yaml:/etc/otelcol-contrib/config.yaml
      - ./collector-exporters.yaml:/etc/otel-collector-config-exporters.yaml
```

This will source the [collectors-exporters.yaml](./collector-exporters.yaml). Review
that file and fill out the missing pieces, e.g. for prometheus you need:

```yaml
exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
```

You can now turn on and turn off those exporters as you need them in your pipeline
in the collector-config-1.yaml / collector-config-2.yaml, e.g.

```yaml
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging,otlp/teletrace,otlp/viewer]
    metrics:
      receivers: [nginx,docker_stats,hostmetrics,httpcheck,otlp]
      processors: [batch]
      exporters: [logging,prometheus]
    logs:
      receivers: [otlp,receiver_creator]
      processors: [batch]
      exporters: [logging,otlp/viewer]

```

After restarting your docker compose setup, you should have multiple backends running
and your traces should be received by teletrace & OTel desktop viewer, and your metrics
by prometheus!
