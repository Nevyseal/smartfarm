# Smart Farm Manager - PowerShell Launch Guide

## CORRECT WAY TO RUN IN POWERSHELL

Use ONE of these methods:

### METHOD 1: Navigate to folder first (Recommended)
```powershell
cd "c:\Users\Iraki\Desktop\Smart farming\farm-manager-app"
python -m http.server 8000 --bind 0.0.0.0
```

### METHOD 2: Call directly with full path
```powershell
cd "c:\Users\Iraki\Desktop\Smart farming\farm-manager-app"
& '.\LAUNCH-PUBLIC.bat'
```

### METHOD 3: Use cmd.exe
```powershell
cmd /c "cd c:\Users\Iraki\Desktop\Smart farming\farm-manager-app && python -m http.server 8000 --bind 0.0.0.0"
```

### METHOD 4: Use & operator to call bat
```powershell
& 'c:\Users\Iraki\Desktop\Smart farming\farm-manager-app\LAUNCH-PUBLIC.bat'
```

## WHAT YOU DID WRONG

You tried:
```powershell
PS C:\Users\Iraki\Desktop\Smart farming> LAUNCH-PUBLIC.bat
```

Issues:
1. You're in the parent "Smart farming" directory
2. The bat file is in "farm-manager-app" subdirectory
3. PowerShell doesn't auto-run .bat files like cmd does

## CORRECT COMMAND NOW

Copy and paste this:
```powershell
cd "c:\Users\Iraki\Desktop\Smart farming\farm-manager-app"
python -m http.server 8000 --bind 0.0.0.0
```

Then open browser at:
http://localhost:8000

## IF YOU PREFER CMD.EXE

Open Command Prompt (not PowerShell) and run:
```cmd
cd c:\Users\Iraki\Desktop\Smart farming\farm-manager-app
LAUNCH-PUBLIC.bat
```

That's it!
