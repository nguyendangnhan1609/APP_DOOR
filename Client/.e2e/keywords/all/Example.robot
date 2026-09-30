*** Settings ***
Resource               ../utils/check.robot
Resource               ../entry/check.robot
Resource               ../data-grid/check.robot

*** Keywords ***

All steps Example
  When In the "Example" section
  Then Webpage should contain "Form modal" button

  When Click "Form modal" button
  When In the "Form Example" section
  Then Heading should contain "Form Example" inner text
  Then Webpage should contain "Text" input field
  Then Webpage should contain "Number" input field
  Then Webpage should contain "Password" input field
  Then Webpage should contain "Textarea" input field
  Then Webpage should contain "Radio" radio field
  Then Webpage should contain "Checkbox" checkbox field
  Then Webpage should contain "Date" date picker field
  # Then Webpage should contain "Date Range" date picker field
  Then Webpage should contain "Upload" upload field
  Then Webpage should contain "Select" select field
  Then Webpage should contain "Save" button
  Then Webpage should contain "Cancel" button

  When Click "Save" button
  Then Required message "Please enter text" displayed under "Text" field
  Then Required message "Please enter number" displayed under "Number" field
  Then Required message "Please enter password" displayed under "Password" field
  Then Required message "Please enter textarea" displayed under "Textarea" field
  Then Required message "Please choose radio" displayed under "Radio" field
  Then Required message "Please choose checkbox" displayed under "Checkbox" field
  Then Required message "Please choose date" displayed under "Date" field
  # Then Required message "Please choose date range" displayed under "Date Range" field
  Then Required message "Please choose upload" displayed under "Upload" field
  Then Required message "Please choose select" displayed under "Select" field

  When Enter "word" in "Text" with "_RANDOM_"
  When Enter "number" in "Number" with "_RANDOM_"
  When Enter "word" in "Password" with "Password1!"
  When Enter "paragraph" in textarea "Textarea" with "_RANDOM_"
  When Click radio "Radio" with "Label Radio 1"
  When Click checkbox "Checkbox" with "Label Checkbox 1"
  When Click date picker in "Date" with "yesterday"
  When Click select "Select" with "Label Select 1"
  When Upload file in "Upload" with "image.jpg"

  Then Data's information in "Text" should be equal "_@Text@_"
  Then Data's information in "Number" should be equal "_@Number@_"
  Then Data's information in "Password" should be equal "_@Password@_"
  Then Data's information in "Textarea" should be equal "_@Textarea@_"
  Then Data's information in "Radio" should be equal "_@Radio@_"
  Then Data's information in "Checkbox" should be equal "_@Checkbox@_"
  Then Data's information in "Date" should be equal "_@Date@_"
  Then Data's information in "Select" should be equal "_@Select@_"

  When Click "Save" button
  When Click "Cancel" button

  # When In the "Example" section
  # Then Check data grid column "Id"
  # Then Check data grid column "Album Id"
  # Then Check data grid column "Title"
  # Then Check data grid column "Url"
  # Then Check data grid column "Thumbnail Url"
  # Then Check data grid column "Date"
