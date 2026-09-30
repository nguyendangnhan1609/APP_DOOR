*** Settings ***
Resource               ../common.robot
Resource               ./action.robot

*** Keywords ***

Check data grid column "${name}" 
  Then Webpage should contain "${name}" column with sort and search function
  Then Check the "${name}" column pinning
  Then Check the "${name}" column hiding
  Then Check the "${name}" column resizing

Check the "${name}" column pinning
  When Right click "${name}" column
  When Click the "Pin left" drop-down menu
  Then Webpage should contain "${name}" column on the left

  When Right click "${name}" column
  When Click the "Pin right" drop-down menu
  Then Webpage should contain "${name}" column on the right

  When Right click "${name}" column
  When Click the "Reset pin" drop-down menu

Check the "${name}" column hiding
  When Right click "${name}" column
  When Click the "Hide" drop-down menu
  Then Webpage should not contain "${name}" column

  When Click "Hide column" button
  Then Webpage should contain "${name}" column

Check the "${name}" column resizing
  ${width_old}=    Get Style    ${CURRENT_SECTION}//div[contains(@class,"title") and text()="${name}"]    width
  When Drag to resize "${name}" column
  ${width_new}=    Get Style    ${CURRENT_SECTION}//div[contains(@class,"title") and text()="${name}"]    width
  Then Should Not Be Equal         ${width_old}    ${width_new}

  When Right click "${name}" column
  When Click the "Reset size" drop-down menu
  ${width_reset}=             Get Style    //div[contains(@class,"title") and text()="${name}"]    width
  Should Be Equal             ${width_old}    ${width_reset}

Webpage should contain "${name}" column with sort and search function
  Wait Until Element Spin
  Wait Until Element Is Existent                                ${CURRENT_SECTION}//th[@aria-label = "${name}"]
  ${count2}=                Get Element Count                   ${CURRENT_SECTION}//th[@aria-label = "${name}" and contains(@class,"has-sorter")]
  Should Be True            ${count2} > 0
  ${count3}=                Get Element Count                   ${CURRENT_SECTION}//th[@aria-label = "${name}" and contains(@class,"has-filter")]
  Should Be True            ${count3} > 0

Webpage should contain "${name}" column on the ${location}
  ${count}=                   Get Element Count    ${CURRENT_SECTION}//thead//th
  ${value} =                  Set Variable    ${name}
  IF    '${location}' == 'left'
    ${text} =                 Browser.Get Text                  ${CURRENT_SECTION}//th[1]
    Should Be Equal           ${text}    ${name}
  END
  IF    '${location}' == 'right'
    ${text} =                 Browser.Get Text                  ${CURRENT_SECTION}//th[${count}]/div[contains(@class,"title")]
    Should Be Equal           ${text}    ${name}
  END
  
Webpage should not contain "${name}" column
  Wait For Elements State    ${CURRENT_SECTION}//*[self::th or self::td][@aria-label = "${name}"]   hidden    ${BROWSER_TIMEOUT}

Webpage should contain "${name}" column
  Wait For Elements State    ${CURRENT_SECTION}//*[self::th or self::td][@aria-label = "${name}"]   attached    ${BROWSER_TIMEOUT}

Webpage should contain the list data from database
  Wait Until Element Spin
  ${count}=                 Get Element Count                   //table[contains(@class,"c-virtual-scroll")]
  Should Be True            ${count} >= 1
