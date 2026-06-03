Set oWS = WScript.CreateObject("WScript.Shell")
strDesktop = oWS.SpecialFolders("Desktop")
sLinkFile = strDesktop & "\Bot SEO.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "E:\wedsod\bot_seo\dist\win-unpacked\react-example.exe"
oLink.WorkingDirectory = "E:\wedsod\bot_seo\dist\win-unpacked"
oLink.Save
