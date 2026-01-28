@echo off
SETLOCAL

REM === Run as Administrator ===
SET HOST_NAME=com.provider.downloader.app
SET MANIFEST_PATH=D:\development\tools\idm\native.provider.json

REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f
REG ADD "HKLM\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f