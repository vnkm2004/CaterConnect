@echo off
copy /Y "C:\Users\vishw\.gemini\antigravity\brain\52058130-f2eb-409e-a15a-84504a60babd\login_illustration_1766149219430.png" "assets\images\login-illustration.png"
if %errorlevel% neq 0 (
    echo Failed > copy_status.txt
) else (
    echo Success > copy_status.txt
)
