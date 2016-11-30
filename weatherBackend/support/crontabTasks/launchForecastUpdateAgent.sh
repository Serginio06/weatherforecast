#!/usr/bin/env bash -v
pathCopyFrom=/Volumes/MACEXDRIVE/Temporary/WebDev/WeatherForecast/weatherBackend/support/txt/com.sergii.usersforecastsupdate.plist
pathToFileAgent=/Library/LaunchAgents/com.sergii.usersforecastsupdate.plist

sudo cp $pathCopyFrom $pathToFileAgent;
sudo chmod 600 $pathToFileAgent;
sudo chown root $pathToFileAgent;
launchctl load $pathToFileAgent;
launchctl list | grep 'sergii';
launchctl list com.sergii.usersforecastsupdate;