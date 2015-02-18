@cd ..
@cd ..
@echo ------------------------------------------------------
@echo This copies all .svg files from all subdirectories
@echo of ./resources to ./generator/icons
@echo ------------------------------------------------------
@pause
copy .\resources\game-icons.net\*.svg .\generator\icons
copy .\resources\custom-icons\*.svg .\generator\icons
copy .\resources\class-icons\*.svg .\generator\icons
@pause