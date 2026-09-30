*** Settings ***
Resource               ../common.robot
Resource               ./action.robot

*** Keywords ***

Check if the interface is the same as the '${name}' design file
  [Arguments]               ${mask}
  Sleep                     0.5s
  Take Screenshot           filename=${name}
  Compare Images            .e2e/designs/${name}.png          .e2e/result/browser/screenshot/${name}.png  mask=${mask}  threshold=0.01

Heading should contain "${text}" inner text
  ${text}=                  Check Text                        ${text}
  ${element}=               Set Variable                      ${CURRENT_SECTION}//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6][text()="${text}"]
  Hover                     ${element}
  Wait Until Element Is Existent                              ${element}

Heading should not contain "${text}" inner text
  ${text}=                  Check Text                        ${text}
  ${element}=               Set Variable                      ${CURRENT_SECTION}//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6][text()="${text}"]
  Wait Until Page Does Not Contain Element                    ${element}

Webpage should contain "${name}" button
  ${name}=                  Check Text                        ${name}
  Wait Until Element Spin
  ${element}=               Set Variable                      ${CURRENT_SECTION}//button[(@title="${name}")]
  Hover                     ${element}
  ${cnt}=                   Get Element Count                 ${element}
  Should Be True            ${cnt} > 0

Wait Until Element Spin
  Wait For Load State       domcontentloaded                  timeout=${BROWSER_TIMEOUT}
  ${element}                Set Variable                      //*[contains(@class, "spin-loading")]
  ${count}=                 Get Element Count                 ${element}
  IF    ${count} > 0
    Wait Until Page Does Not Contain Element                  ${element}
  END

Webpage should contain the search function
  ${element}=               Set Variable                        //*[contains(@class,"c-search")]
  Wait Until Element Is Existent                                ${element}
