#!/bin/bash
# Install dependencies
npm install

# Build the application
npm run build

# Create an empty database if it doesn't exist
touch meetup.db
