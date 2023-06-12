FROM otel/opentelemetry-collector-contrib:latest as BASE

FROM alpine

COPY --from=BASE /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=BASE otelcol-contrib /bin/otelcol-contrib
COPY --from=BASE /etc/otelcol-contrib/config.yaml /etc/otelcol-contrib/config.yaml

ENTRYPOINT ["/bin/otelcol-contrib"]
CMD ["--config", "/etc/otelcol-contrib/config.yaml"]
EXPOSE 4317 55678 55679

