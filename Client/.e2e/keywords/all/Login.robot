*** Settings ***
Resource               ../utils/check.robot
Resource               ../entry/check.robot

*** Keywords ***

All steps Login
  When In the "Sign In" section
  Then Heading should contain "Sign In" inner text
  Then Webpage should contain "Username" input field
  Then Webpage should contain "Password" input field
  Then Webpage should contain "Log In" button
  Then Check if the interface is the same as the 'login' design file    mask=top:27;bottom:27;left:32;right:32

  When Click "Log In" button
  Then Required message "Please enter username" displayed under "Username" field
  Then Required message "Please enter password" displayed under "Password" field

  When Enter "email" in "Username" with "admin.admin.com"
  Then Required message "Please enter a valid email address!" displayed under "Username" field

  When Enter "email" in "Username" with "${USER_NAME}"
  When Enter "text" in "Password" with "${USER_PASSWORD}"

  Then Data's information in "Username" should be equal "_@Username@_"
  Then Data's information in "Password" should be equal "_@Password@_"

  When Click "Log In" button
  Then Heading should not contain "Sign In" inner text
