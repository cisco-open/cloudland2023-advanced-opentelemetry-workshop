# CloudLand 2023 - Workshop "Advanced OpenTelemetry"

> [!IMPORTANT]
> This repository is archived and will not receive any updates or accept issues or pull requests

_Workshop content for a session during
[Cloud Land 2023](https://www.cloudland.org/en/home/)_

## Abstract

Observability and [OpenTelemetry](https://opentelemetry.io/) are on everyone's lips. It is very likely that
you have already heard a lecture that introduced you to this topic, or you have
read up on the topic yourself. So you know about the "Three Pillars", you can
instrument your code and you may have already solved one or the other
performance problem with tracing.

In this talk I want to go one step further with you and introduce you to some
advanced topics related to Observability & OpenTelemetry:

- Why you only need the "OpenTelemetry Collector" to receive, process and send
  **any** telemetry
- What is the difference between "manual", "native" and "automatic"
  instrumentation and when to use which
- Why you should love "semantic conventions".
- What you can expect from OpenTelemetry in the future and where there are still
  limitations today

The session will be accompanied by live demos and there will be an opportunity
to ask lots of questions!

Requirements for participants:

- Basic knowledge (e.g. done a tutorial, watched a few documentaries or videos,
  first practical experiences, ...) with [OpenTelemetry](https://opentelemetry.io/) (or other types of
  observability).
- Access to Docker engine (local or remote)
- Node.JS
- IDE or other preferred editor

## Tutorials

### 1. Manual, automatic and native instrumentation

The goal of this tutorial is to teach you how to make use of manual, native and
automatic instrumentation, how they are different but also how they can used
together to get the best results for your instrumentation.

Follow [./instrumentation/README.md](./instrumentation/README.md) for more
details

### 2. Collector

The goal of this tutorial is to show you how the collector can be used to
receive **any** telemetry, not only OTLP data. For that you will configure
different receivers to collect logs, metrics & traces from different sources.

Additionally you will learn how to chain & load balance your collectors, how you
can make use of observers and the receiver creator, and how you can organize
your collector config through multiple files.

Follow [./instrumentation/README.md](./collector/README.md) for more details.

## Issues and contributions

We use GitHub to track issues and contributions. Note, that this project
contains supplemental for a workshop given in June 2023 and may not be updated
beyond that date.
