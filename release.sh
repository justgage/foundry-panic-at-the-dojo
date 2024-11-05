#!/bin/bash

# Update system.json with the new download URL
jq --arg version $(cat system.json | jq -r .version) \
   '.download = "https://github.com/justgage/foundry-panic-at-the-dojo/raw/main/releases/v\($version).zip"' \
   system.json > tmp.json && mv tmp.json system.json

# Move releases directory out of the way
mv releases ..

# Zip up the project, excluding .git
zip -r release.zip * --exclude ".git/*"

# Move releases directory back
mv ../releases .

# Move the zip file to releases
mv release.zip releases

# Rename the zip file with the version number
mv releases/release.zip "releases/v$(cat system.json | jq -r .version).zip"