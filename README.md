# typescript start
乾淨的TypeScript初始架構。


## VSCODE Debug
如果使用`VSCODE`編輯程式碼，可於.vscode目錄下，包含下面兩個json檔，方便debug時自動編譯typescript並執行。

### launch.json : 執行時會先觸發 build，執行typescript編譯
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node",
          "request": "launch",
          "name": "啟動程式",
          "program": "${workspaceFolder}/dist/server",
          "preLaunchTask": "build",
          "cwd": "${workspaceFolder}",
          "envFile": "${workspaceFolder}/.env",
          "outputCapture": "std"
        }
      ]
    }

### tasks.json : debug執行時，自動編譯的觸發設定
    {
      "version": "2.0.0",
      "tasks": [
        {
          "type": "shell",
          "label": "build",
          "command":"grunt",
          "group": {
            "kind": "build",
            "isDefault": true
          }
        }
      ]
    }