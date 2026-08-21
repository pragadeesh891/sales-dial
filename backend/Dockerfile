# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go modules manifests
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build API and Worker binaries
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/worker ./cmd/worker

# Runtime stage
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/bin/api /app/api
COPY --from=builder /app/bin/worker /app/worker
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080

CMD ["/app/api"]

