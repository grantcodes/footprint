# Footprint

A small tool to estimate the CO2 output of every resource on a webpage using [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview/) and the [performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API).

## Installation

```bash
npm install @grantcodes/footprint
```

## Usage

```js
import { Footprint } from "@grantcodes/footprint";

const footprint = new Footprint(performance);

// Get an array of all loaded resources. 
const resources = footprint.resources;
resources.foreach(result => console.log(result.name, result.co2));

// Can also get results for a specific category ("media" | "js" | "css" | "html" | "other").
const cssResources = footprint.getByCategory("css");

// And get totals for the resources
console.log(`The ${cssResources.totalBytes} bytes of css resources on this page are estimated to generate ${cssResources.totalCo2} of CO2`);
```