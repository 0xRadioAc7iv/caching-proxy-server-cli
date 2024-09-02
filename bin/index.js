#!/usr/bin/env node

// Import necessary modules
import { Command } from "commander"; // Commander.js to handle CLI options and commands
import express from "express"; // Express.js to create a web server
import { isValidURL } from "url-validation-checker"; // Utility to validate URLs
import chalk from "chalk"; // Chalk.js to style console output with colors

// Initialize CLI command handler and Express app
const program = new Command();
const app = express();

// Initialize an in-memory cache to store responses for faster retrieval
const RESPONSE_CACHE = new Map();

// Global variable to store the current target URL for the proxy
let currentURL = "";

// Configure the CLI tool metadata
program
  .name("caching-proxy")
  .description("A Caching Proxy Server CLI Tool")
  .version("0.0.1");

// Define command-line options and actions
program
  .option("-p, --port <port>", "port number") // Option to specify the port number
  .option("-o, --origin <origin_url>", "origin URL") // Option to specify the origin URL for the proxy
  .option("-c, --clear-cache", "Clears cache") // Option to clear the in-memory cache
  .description("Start a Proxy Server") // Command description
  .action((options) => {
    // Clear cache if the corresponding option is specified
    if (options.clearCache) {
      RESPONSE_CACHE.clear();
      console.log(chalk.green("Cache cleared!")); // Inform the user that the cache has been cleared
      return; // Exit after clearing the cache
    }

    // Extract port and origin URL from the options
    const port = options.port;
    const origin = options.origin;

    // Validate port number
    if (!port) {
      console.log(chalk.red("Required Argument --port <port_number>")); // Error if port is not specified
      return;
    }

    // Validate origin URL
    if (!origin) {
      console.log(chalk.red("Required Argument --origin <origin_url>")); // Error if origin URL is not specified
      return;
    }

    // Ensure the port is a valid number
    if (isNaN(parseInt(port))) {
      console.log(chalk.red("Error: Port number should be a Number")); // Error if port is not a number
      return;
    }

    // Ensure the origin is a valid URL
    if (!isValidURL(origin)) {
      console.log(chalk.red("Error: Origin is not a Valid URL")); // Error if origin is not a valid URL
      return;
    }

    // Parse port number and set the current origin URL
    const portNum = parseInt(port);
    currentURL = origin;

    // Define a route handler for all incoming requests
    app.use("*", async (req, res) => {
      const targetURL = currentURL + req.baseUrl; // Construct the target URL for the proxy

      // Check if the response is already cached
      if (RESPONSE_CACHE.has(targetURL)) {
        const cachedResponse = RESPONSE_CACHE.get(targetURL);
        res.setHeader("X-Cache", "HIT"); // Set custom header to indicate cache hit

        // Set response headers from the cached response
        cachedResponse.headers.forEach(([name, value]) => {
          // Exclude certain headers for better performance
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

        console.log("X-Cache: ", chalk.green("HIT")); // Log cache hit
        res.status(cachedResponse.status).send(cachedResponse.body); // Send the cached response
        return;
      }

      // Fetch the response from the origin server if not cached
      try {
        const response = await fetch(targetURL, {
          method: req.method,
          headers: req.headers,
          body:
            req.method !== "GET" && req.method !== "HEAD"
              ? req.body
              : undefined,
        });

        const body = await response.text(); // Read the response body as text

        // Cache the response for future requests
        RESPONSE_CACHE.set(targetURL, {
          status: response.status,
          headers: Array.from(response.headers.entries()),
          body: body,
        });

        res.setHeader("X-Cache", "MISS"); // Set custom header to indicate cache miss
        response.headers.forEach((value, name) => {
          // Exclude 'content-encoding' header for better compatibility
          if (name.toLowerCase() !== "content-encoding") {
            res.setHeader(name, value);
          }
        });

        console.log("X-Cache: ", chalk.red("MISS")); // Log cache miss
        res.status(response.status).send(body); // Send the fetched response
      } catch (error) {
        console.log(chalk.red(error)); // Log any errors encountered during the fetch
        res.status(500).send("Error fetching the resource."); // Send error response to the client
      }
    });

    // Start the Express server on the specified port
    app.listen(portNum, () => {
      console.log(
        chalk.green(
          `✅ Proxy server successfully started for ${currentURL}!\n🌐 Access it at: http://localhost:${portNum}`
        )
      );
    });
  });

// Parse the command-line arguments
program.parse();
