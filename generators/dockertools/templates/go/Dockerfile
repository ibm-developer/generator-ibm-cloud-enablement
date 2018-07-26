FROM golang:1.10.3-alpine

# Update packages and install dependency packages for services
RUN apk update && apk add --no-cache bash git

# Change working directory
WORKDIR $GOPATH/src/<%= applicationName %>/

# Install dependencies
RUN go get -u github.com/golang/dep/...
RUN go get -u github.com/derekparker/delve/cmd/dlv/...
COPY . ./
RUN dep ensure -v

ENV PORT <%= port %>
EXPOSE <%= port %>

CMD ["go", "run", "server.go"]
