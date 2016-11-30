#!/usr/bin/env bash
echo ‘========== Start forecast update==================‘ >> /tmp/forecastUpdateLog.txt;
date >> /tmp/forecastUpdateLog.txt;
echo ‘==================================================‘ >> /tmp/forecastUpdateLog.txt;
/usr/local/bin/node /Volumes/MACEXDRIVE/Temporary/WebDev/WeatherForecast/weatherBackend/support/javascripts/cronForecastUpdate.js  >> /tmp/forecastUpdateLog.txt
echo ‘=================Update end=======================’ >> /tmp/forecastUpdateLog.txt