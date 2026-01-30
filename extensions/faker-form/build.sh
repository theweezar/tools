#!/bin/bash
ENTRY="extensions/faker-form/dist/content.js"
npx esbuild extensions/faker-form/src/content.js --bundle --platform=browser --outfile=$ENTRY
npx babel $ENTRY -o $ENTRY
npx terser $ENTRY -c -m -o $ENTRY