#!/usr/bin/env bash
echo "The name of this script is 'basename $0'.";
date >> /tmp/MyLaunchdTest.out
node /Volumes/MACEXDRIVE/Temporary/WebDev/WeatherForecast/weatherBackend/support/javascripts/cronForecastUpdate.js  >> /tmp/forecastUpdateLog.txt