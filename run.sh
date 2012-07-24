#!/bin/sh

NODE_ENV=production PORT=3050 supervisor -p 500 app.js
