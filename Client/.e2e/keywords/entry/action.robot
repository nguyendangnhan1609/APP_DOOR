*** Settings ***
Resource               ../common.robot
Resource               ../utils/check.robot

*** Keywords ***

Enter "${type}" in "${name}" with "${text}"
  Wait Until Element Spin
  ${text}=                  Get Random Text                   ${type}                       ${text}
  ${element}=               Get Element Item By Name          ${name}                       //*[contains(@class, "entry")]
  Clear Text                ${element}
  Fill Text                 ${element}                        ${text}                       True
  ${condition}=             Browser.Get Text                          ${element}
  Scroll To Element         ${element}
  ${cnt}=                   Get Length                        ${text}
  IF  ${cnt} > 0
    Set Global Variable     \${STATE["${name}"]}              ${text}
  END

Enter "${type}" in textarea "${name}" with "${text}"
  Wait Until Element Spin
  ${text}=                  Get Random Text                   ${type}                       ${text}
  ${element}=               Get Element Item By Name          ${name}                       //textarea
  Clear Text                ${element}
  Fill Text                 ${element}                        ${text}
  ${condition}=             Browser.Get Text                          ${element}
  Scroll To Element         ${element}
  ${cnt}=                   Get Length                        ${text}
  IF  ${cnt} > 0
  Set Global Variable       \${STATE["${name}"]}              ${text}
  END

Click radio "${name}" with "${text}"
  ${element}=               Get Element Item By Name          ${name}                       //label[@class="choice"]/span[text()="${text}"]
  Click                     ${element}
  ${cnt}=                   Get Length                        ${text}
  IF  ${cnt} > 0
    Set Global Variable     \${STATE["${name}"]}              ${text}
  END

Click checkbox "${name}" with "${text}"
  ${element}=               Get Element Item By Name          ${name}                       //label[@class="choice"]/span[text()="${text}"]
  Click                     ${element}
  ${cnt}=                   Get Length                        ${text}
  IF  ${cnt} > 0
    Set Global Variable     \${STATE["${name}"]}              ${text}
  END

Click date picker in "${name}" with "${text}"
  IF  "${text}" == "today"
    ${text}=                Get Current Date                  local                         result_format=%d-%m-%Y
  ELSE IF  "${text}" == "yesterday"
    ${text}=                Get Current Date                  local                         -1 day                                     result_format=%d-%m-%Y
  ELSE
    ${text}=                Get Random Text                   date                          ${text}
  END
  ${element}=               Get Element Item By Name          ${name}                       //div[contains(@class,"entry-date")]//input[@readonly]
  Fill Text                 ${element}                        ${text}                       True
  Click                     ${element}
  ${d_text}=                Get Regexp Matches                ${text}                       (.+)-(..)-            1
  ${m_text}=                Get Regexp Matches                ${text}                       (..)-(..)-            2
  ${y_text}=                Get Regexp Matches                ${text}                       (..)-(..)-(.+)        3
  ${after_text}=            Catenate                          SEPARATOR=/                   ${y_text[0]}          ${m_text[0]}          ${d_text[0]}
  Click                     //div[@class="calendar"][1]//button[@title = "${after_text}"]
  ${cnt}=                   Get Length                        ${text}
  IF  ${cnt} > 0
  Set Global Variable       ${STATE["${name}"]}               ${after_text}
  END

Click select "${name}" with "${text}"
  ${text}=                  Get Random Text                   Text                          ${text}
  ${element}=               Get Element Item By Name          ${name}                       //*[contains(@class, "entry-select")]
  Hover                     ${element}
  Hover                     ${element}
  Click                     ${element}
  # ${element}=               Get Element Item By Name          ${name}                       //*[contains(@class, "ant-select-selection-search-input")]
  # Fill Text                                                   ${element}                    ${text}
  # Keyboard Key              press                             Backspace
  # ${element}=               Get Element Item By Name          ${name}                       //*[contains(@class, "anticon-spin")]
  # Wait Until Page Does Not Contain Element                    ${element}
  Click                     //*[contains(@class, "menu ")]//button[contains(text(),'${text}')]
  ${cnt}=                   Get Length                        ${text}
  IF  ${cnt} > 0
    Set Global Variable     \${STATE["${name}"]}              ${text}
  END

Upload file in "${name}" with "${text}"
  ${element}=               Get Element Item By Name          ${name}                       //input[@type = "file"]
  Upload File By Selector   ${element}                        .e2e/upload/${text}
  Wait For Load State       domcontentloaded                  timeout=${BROWSER_TIMEOUT}
  Wait Until Element Spin
