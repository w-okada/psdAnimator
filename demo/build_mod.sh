cd ../lib/; npm run build:dev; cd -
# cd ../lib/; npm run build:prod; cd -
# cd ../lib/; npm run tsc:dev; cd -
rm node_modules/@dannadori/psdanimator/dist/* -rf
cp -r ../lib/dist/* node_modules/@dannadori/psdanimator/dist/
cp ../lib/dist/index.js public/js/

