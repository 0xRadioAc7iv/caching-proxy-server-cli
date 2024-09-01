#!/usr/bin/env node

import { Command } from "commander";
import express from "express";
import { isValidURL } from "url-validation-checker";

const program = new Command();
const app = express();
const RESPONSE_CACHE = new Map();

let currentURL = "";

program
  .name("caching-proxy")
  .description("A Caching Proxy Server CLI Tool")
  .version("0.0.1");

program
  .option("-p, --port <port>")
  .option("-o, --origin <origin_url>")
  .option("-c, --clear-cache")
  .description("Start a Proxy Server")
  .action((options) => {
    if (options.clearCache) {
      RESPONSE_CACHE.clear();
      console.log("Cache cleared!");
      return;
    }

    const port = options.port;
    const origin = options.origin;

    if (!port) {
      console.log("Required Argument --port <port_number>");
      return;
    }

    if (!origin) {
      console.log("Required Argument --origin <origin_url>");
      return;
    }

    if (isNaN(parseInt(port))) {
      console.log("Error: Port number should be a Number");
      return;
    }

    if (!isValidURL(origin)) {
      console.log("Error: Origin is not a Valid URL");
      return;
    }

    currentURL = origin;

    app.use("*", async (req, res) => {
      const targetURL = currentURL + req.baseUrl;

      if (RESPONSE_CACHE.has(targetURL)) {
        const cachedResponse = RESPONSE_CACHE.get(targetURL);
        res.setHeader("X-Cache", "HIT");

        cachedResponse.headers.forEach(([name, value]) => {
          if (
            ![
              "content-encoding",
              "transfer-encoding",
              "content-length",
            ].includes(name.toLowerCase())
          ) {
            res.setHeader(name, value);
          }
        });

        res.status(cachedResponse.status).send(cachedResponse.body);
        return;
      }

      try {
        const response = await fetch(targetURL, {
          method: req.method,
          headers: req.headers,
          body:
            req.method !== "GET" && req.method !== "HEAD"
              ? req.body
              : undefined,
        });

        const body = await response.text();

        RESPONSE_CACHE.set(targetURL, {
          status: response.status,
          headers: Array.from(response.headers.entries()),
          body: body,
        });

        res.setHeader("X-Cache", "MISS");
        response.headers.forEach((value, name) => {
          if (name.toLowerCase() !== "content-encoding") {
            res.setHeader(name, value);
          }
        });
        res.status(response.status).send(body);
      } catch (error) {
        res.status(500).send("Error fetching the resource.");
      }
    });

    app.listen(parseInt(port), () => {
      console.log("Proxy Server Started!");
    });
  });

program.parse();
