@cd ..
@cd ..
@echo ------------------------------------------------------
@echo This lists all files in ./generator/icons
@echo and saves the list as icons.txt in that directory
@echo ------------------------------------------------------
@pause
node ./resources/scripts/list.js ../../generator/icons icons.txt
@pause