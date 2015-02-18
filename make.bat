@ECHO building card.js
@CALL node node_modules/typescript/bin/tsc generator/js/card.ts -t ES6 -sourcemap -d --out generator/js/card.js

@ECHO building ui.js
@CALL node node_modules/typescript/bin/tsc generator/js/ui.ts -t ES6 -sourcemap -d --out generator/js/ui.js

@PAUSE