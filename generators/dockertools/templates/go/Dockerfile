FROM golang:1.10.3-alpine as builder

# Update packages and install dependency packages for services
RUN apk update && apk add --no-cache bash git

# Change working directory
WORKDIR $GOPATH/src/{{applicationName}}/

# Install dependencies
RUN go get -u github.com/golang/dep/...
RUN go get -u github.com/derekparker/delve/cmd/dlv/...
COPY . ./
RUN dep ensure -v

ENV PORT {{port}}
ENV GIN_MODE release
EXPOSE {{port}}

# build binary
RUN go build -o main .

FROM alpine
WORKDIR /go/src/{{applicationName}}
COPY --from=builder /go/src/{{applicationName}}/main ./
COPY --from=builder /go/src/{{applicationName}}/public ./public

ENV PORT {{port}}
ENV GIN_MODE release
EXPOSE {{port}}

CMD ["./main"]
