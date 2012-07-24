#!/bin/bash

token="e23184e3b659b19ce672393abfe67c4944ee655e6572a365003e8d985fa1f74"
url="https://api.vk.com/method/audio.search?q=test&access_token=$token"
echo $url
curl $url