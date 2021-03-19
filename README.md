## About

This project visualizes the flow of funds from donor advised funds across the U.S as a proof of concept.

## The Data

Data is [available on AWS](https://aws.amazon.com/blogs/publicsector/irs-990-filing-data-now-available-as-an-aws-public-data-set/).


## To Do

- Fix bar chart title issue
- Ensure main parallel chart does not go across boundaries
- Fix parallel chart width and y0 y1 coordinate issues 
- Fix colors on EIN / Grant amount indicators on the parallel chart to see better when colors are dark.
- Fix link width issues
- Solve problem with parallel chart changing colors across clears
- Update/Exit cycle rather than innerHTML clear

## Credits

Thank you to Andrew Mcnutt for debugging help (even though some do remain) and examples by Mike Bostock, specifically [the Parallel Sets chart here](https://observablehq.com/@d3/parallel-sets).