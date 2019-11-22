FROM golang:1.10.3-alpine

# Update packages and install dependency packages for services
RUN apk update && apk add --no-cache bash git

# Set GOPATH Environment Variable
ENV GOPATH /go

# Change working directory
WORKDIR $GOPATH/src/{{applicationName}}/

# Install dependencies
RUN go get -u github.com/golang/dep/...
RUN go get -u github.com/derekparker/delve/cmd/dlv/...
COPY . ./
RUN if test -e "Gopkg.toml"; then dep ensure -v; fi

ENV PORT {{port}}
ENV GIN_MODE release
EXPOSE {{port}}

RUN go build -o app
CMD ["./app"]