#!/bin/sh

NODE_ENV=production HOST=localhost PORT=3050 supervisor -p 500 app.js
