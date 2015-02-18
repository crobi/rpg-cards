@cd ..
@cd ..
@echo ------------------------------------------------------
@echo This lists all files in ./resources/game-icons.net
@echo and saves the list as game-icons.net.txt
@echo ------------------------------------------------------
@pause
node ./resources/scripts/list.js ../game-icons.net ../scripts/game-icons.net.txt
@pause