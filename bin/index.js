#!/usr/bin/env node

import { Command } from "commander";
import express from "express";
import { isValidURL } from "url-validation-checker";

const program = new Command();
const app = express();
const responses = new Map();

let currentURL = "";

program
  .name("caching-proxy")
  .description("A Caching Proxy Server CLI Tool")
  .version("0.0.1");

program
  .option("-p, --port <port>")
  .option("-o, --origin <origin_url>")
  .description("Start a Proxy Server")
  .action((options) => {
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

    app.listen(parseInt(port), () => {
      console.log("Proxy Server Started!");
    });
  });

program.option("-c, --clear-cache", "Clear the proxy cache", () => {
  responses.clear();
  console.log("cache cleared!");
});

program.parse();
