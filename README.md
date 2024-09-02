# Caching Proxy CLI Tool

**Caching Proxy** is a simple CLI tool that allows you to create a caching proxy server, which stores responses from an origin server to reduce load and improve response times for repeated requests.

## Features

- 🔄 Caches HTTP responses to reduce repeated load on the origin server.
- 🔗 Proxy server can be easily configured via command-line options.
- 🚀 Fast and lightweight, built using **Node.js** and **Express.js**.
- 🛠️ CLI interface powered by **Commander.js**.
- 🧹 Option to clear the cache whenever needed.

## Installation

To install the CLI tool, follow these steps:

    $ git clone https://github.com/0xRadioAc7iv/caching-proxy-server-cli.git
    $ cd caching-proxy-server-cli
    $ npm i -g

## Usage

To start the proxy server, use the following command:

    $ caching-proxy --port <port_number> --origin <origin_url>

**Example:**

    $ caching-proxy --port 3000 --origin https://example.com

### Options

- `-p, --port <port>`: Specify the port number for the proxy server (required).
- `-o, --origin <origin_url>`: Specify the origin URL that the proxy will forward requests to (required).
- `-c, --clear-cache`: Clears the in-memory cache of the proxy server.
- `-h, --help`: Displays help information about the CLI tool.

## How It Works

1.  🛠️ The proxy server listens on the specified port.
2.  🌐 Incoming requests are forwarded to the origin URL.
3.  📦 If the response for a given request is already cached, the cached version is returned with an `X-Cache: HIT` header.
4.  🔄 If the response is not cached, it is fetched from the origin, stored in the cache, and returned with an `X-Cache: MISS` header.

## Cache Management

You can clear the cache at any time using the `--clear-cache` option:

    $ caching-proxy --clear-cache

This will remove all stored responses from the in-memory cache.

## Logging

The proxy server logs whether a request is served from the cache or fetched from the origin:

- X-Cache: HIT - The response was served from the cache.
- X-Cache: MISS - The response was fetched from the origin and cached.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Project URL ([roadmap.sh](https://roadmap.sh))

```
https://roadmap.sh/projects/caching-server
```
