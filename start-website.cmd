@echo off
REM ===================================================================
REM  Translational Neurosurgery Laboratory - local preview
REM  Double-click this file to view the website on this computer.
REM  Close the black window when you are finished.
REM ===================================================================

cd /d "%~dp0"

echo.
echo   Starting the local web server...
echo   The website will open in your browser in a moment.
echo.
echo   Leave this window open while you browse.
echo   Press Ctrl+C or close this window to stop.
echo.

start "" http://127.0.0.1:8777/
python -m http.server 8777 --bind 127.0.0.1

REM If python is not found, tell the user rather than flashing away.
if errorlevel 9009 (
  echo.
  echo   Python was not found on this computer.
  echo   Install it from https://www.python.org/downloads/
  echo   and tick "Add Python to PATH" during setup.
  echo.
  pause
)
