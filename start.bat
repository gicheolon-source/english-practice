@echo off
echo Starting OPIc trainer server at http://localhost:8000
start "" http://localhost:8000
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
