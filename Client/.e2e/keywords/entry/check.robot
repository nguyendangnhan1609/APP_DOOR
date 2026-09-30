*** Settings ***
Resource               ../common.robot
Resource               ./action.robot

*** Keywords ***

Webpage should contain "${name}" input field
  Wait Until Element Spin
  ${element}=               Get Element Item By Name          ${name}                      //*[(self::input or self::textarea) and contains(@class,"entry")]
  ${count}=                 Get Element Count                 ${element}
  Should Be True            ${count} >= 1

Webpage should contain "${name}" select field
  Wait Until Element Spin
  ${element}=               Get Element Item By Name          ${name}                      //div[contains(@class,"entry-select")]//input[@readonly]
  ${count}=                 Get Element Count                 ${element}
  Should Be True            ${count} >= 1

Webpage should contain "${name}" date picker field
  Wait Until Element Spin
  ${element}=               Get Element Item By Name          ${name}                      //div[contains(@class,"entry-date")]//input[@readonly]
  ${count}=                 Get Element Count                 ${element}
  Should Be True            ${count} >= 1

Webpage should contain "${name}" radio field
  Wait Until Element Spin
  ${element}=               Get Element Item By Name          ${name}                      //*[contains(@class,"choice-group")]//input[@type="radio"]
  ${count}=                 Get Element Count                 ${element}
  Should Be True            ${count} >= 1

Webpage should contain "${name}" checkbox field
  Wait Until Element Spin
  ${element}=               Get Element Item By Name          ${name}                      //*[contains(@class,"choice-group")]//input[@type="checkbox"]
  ${count}=                 Get Element Count                 ${element}
  Should Be True            ${count} >= 1

Webpage should contain "${name}" upload field
  Wait Until Element Spin
  ${element}=               Get Element Item By Name          ${name}                      //input[@type = "file"]
  ${count}=                 Get Element Count                 ${element}
  Should Be True            ${count} >= 1

Required message "${text}" displayed under "${name}" field
  ${text}=                  Check Text                        ${text}
  ${element}=               Get Element Item By Name          ${name}                       //*[contains(@class, "feedback")]
  Element Text Should Be    ${element}                        ${text}

Data's information in "${name}" should be equal "${value}"
  Wait Until Element Spin
  ${value}=                 Check Text                         ${value}
  ${element}=               Get Element Item By Name           ${name}
  ${count}=                 Get Element Count                  ${element}
  IF  ${count} > 0
    ${element}=             Get Element Item By Name           ${name}                     //div[contains(@class,"entry-select")]//input[@readonly]
      ${count}=             Get Element Count                  ${element}
      IF  ${count} > 0
        Browser.Get Text    ${element}                         equal                       ${value}
      ELSE
        ${element}=         Get Element Item By Name           ${name}                     //*[contains(@class,"entry-date")]//input[@readonly]
        ${count}=           Get Element Count                  ${element}
        IF  ${count} > 0
          Browser.Get Text  ${element}                         equal                       ${value}
        ELSE
          ${element}=       Get Element Item By Name           ${name}                     //*[contains(@class,"choice-group")]//div[@class="radio checked"]/ancestor::label/span[text()="${value}"]
          ${count}=         Get Element Count                  ${element}
          IF  ${count} > 0
            Browser.Get Text        ${element}                 equal                       ${value}
          ELSE
            ${element}=     Get Element Item By Name           ${name}                     //*[contains(@class,"choice-group")]//div[@class="checkbox checked"]/ancestor::label/span[text()="${value}"]
            ${count}=       Get Element Count                  ${element}
            IF  ${count} > 0
              Browser.Get Text      ${element}                 equal                       ${value}
            ELSE
              ${element}=   Get Element Item By Name           ${name}                     //*[(self::input or self::textarea) and contains(@class,"entry") and (@value="${value}" or .="${value}")]
              Hover         ${element}
              Browser.Get Text      ${element}                 equal                       ${value}
            END
          END
        END
      END
  END

Data's range information in "${name}" should be equal with from "${from}" and to "${to}"
  Wait Until Element Spin
  ${from}=                  Check Text                         ${from}
  ${elementFrom}=           Get Element Item By Name           ${name}                    //*[contains(@class,"ant-picker-input")]/input[@date-range="start"]
  Browser.Get Text          ${elementFrom}                     equal                      ${from}

  ${to}=                    Check Text                         ${to}
  ${elementTo}=             Get Element Item By Name           ${name}                    //*[contains(@class,"ant-picker-input")]/input[@date-range="end"]
  Browser.Get Text          ${elementTo}                       equal                      ${to}
