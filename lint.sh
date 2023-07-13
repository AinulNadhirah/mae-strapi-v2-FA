#!/bin/bash

npx eslint $(git diff --name-only development | grep -E '\.(js|jsx)$' | xargs)  -f 'node_modules/eslint-html-reporter/reporter.js' > eslint-result.html

URL="eslint-result.html"
[[ -x $BROWSER ]] && exec "$BROWSER" "$URL"
path=$(which xdg-open || which gnome-open || which start) && exec "$path" "$URL"
if open -Ra "safari" ; then
  echo "VERIFIED: 'Safari' is installed, opening browser..."
  open -a safari "$URL"
else
  echo "Can't find any browser"
fi