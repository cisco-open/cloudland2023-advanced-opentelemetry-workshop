FROM golang as BUILDER
RUN apt-get install -y ca-certificates git
RUN git clone https://github.com/CtrlSpice/otel-desktop-viewer.git /otel-desktop-viewer
RUN cd /otel-desktop-viewer ; sed -i s/localhost/0.0.0.0/g main.go; go build

FROM debian:11-slim
COPY --from=BUILDER /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=BUILDER /otel-desktop-viewer/otel-desktop-viewer /bin/otel-desktop-viewer

ENTRYPOINT ["/bin/otel-desktop-viewer"]
EXPOSE 4317 55678 55679 8000
