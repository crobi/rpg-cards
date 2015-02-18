@cd ..
@cd ..
@echo ------------------------------------------------------
@echo This moves all files from all subfolders of 
@echo ./resources/game-icons.net to the root of that folder
@echo ------------------------------------------------------
@pause
node ./resources/scripts/extract.js ../game-icons.net
@pause