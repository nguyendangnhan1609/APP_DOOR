*** Settings ***
Resource               ../common.robot

*** Keywords ***

Check Text
  [Arguments]               ${text}
  ${containsS}=             Get Regexp Matches                ${text}                      _@(.+)@_                   1
  ${cntS}=                  Get length                        ${containsS}
  IF  ${cntS} > 0
    ${text}=                Replace String                    ${text}         _@${containsS[0]}@_     ${STATE["${containsS[0]}"]}
  END
  RETURN    ${text}

Wait Until Element Is Existent
  [Arguments]               ${locator}  ${message}=${EMPTY}   ${timeout}=${BROWSER_TIMEOUT}
  Wait For Elements State   ${locator}  attached              ${timeout}                    ${message}

Wait Until Page Does Not Contain Element
  [Arguments]               ${locator}  ${message}=${EMPTY}   ${timeout}=${BROWSER_TIMEOUT}
  Wait For Elements State   ${locator}  detached              ${timeout}                    ${message}

Element Text Should Be
  [Arguments]               ${locator}  ${expected}           ${message}=${EMPTY}           ${ignore_case}=${EMPTY}
  Browser.Get Text          ${locator}  equal                 ${expected}                   ${message}

In the "${title}" section
  ${text}=                  Check Text                        ${title}
  Set Global Variable         ${CURRENT_SECTION}              //*[@aria-label="${text}"]

Get Random Text
  [Arguments]               ${type}                           ${text}
  ${symbol}                 Set Variable                      _RANDOM_
  ${new_text}               Set Variable
  ${containsS}=             Get Regexp Matches                ${text}                       _@(.+)@_                   1
  ${cntS}=                  Get length                        ${containsS}
  ${contains}=              Get Regexp Matches                ${text}                       ${symbol}
  ${cnt}=                   Get length                        ${contains}
  IF  ${cntS} > 0
    ${new_text}=            Set Variable                      ${STATE["${containsS[0]}"]}
    ${symbol}=              Set Variable                      _@${containsS[0]}@_
  ELSE IF  ${cnt} > 0 and "${type}" == "test name"
    ${random}=              FakerLibrary.Sentence             nb_words=3
    ${words}=               Split String                      ${TEST NAME}                  ${SPACE}
    ${new_text}=            Set Variable                      ${words[0]} ${random}
  ELSE IF  ${cnt} > 0 and "${type}" == "number"
    ${new_text}=            FakerLibrary.Random Int
    ${new_text}=            Convert To String                 ${new_text}
  ELSE IF  ${cnt} > 0 and "${type}" == "percentage"
    ${new_text}=            FakerLibrary.Random Int           max=100
    ${new_text}=            Convert To String                 ${new_text}
  ELSE IF  ${cnt} > 0 and "${type}" == "paragraph"
    ${new_text}=            FakerLibrary.Paragraph
  ELSE IF  ${cnt} > 0 and "${type}" == "email"
    ${new_text}=            FakerLibrary.Email
    ${create_text}=         Get Regexp Matches                ${new_text}                       (.+)@                   1
    ${new_text}=            Set Variable                      ${create_text[0]}
    ${new_text}=            Catenate                          SEPARATOR=                    0                           ${new_text}                  @yopmail.com
  ELSE IF  ${cnt} > 0 and "${type}" == "username"
    ${new_text}=            FakerLibrary.Email
    ${create_text}=         Get Regexp Matches                ${new_text}                       (.+)@                   1
    ${new_text}=            Set Variable                      ${create_text[0]}
  ELSE IF  ${cnt} > 0 and "${type}" == "phone"
    ${new_text}=            FakerLibrary.Random Int           min=200000000                 max=999999999
    ${new_text}=            Convert To String                 ${new_text}
    ${new_text}=            Catenate                          SEPARATOR=                    0                           ${new_text}
  ELSE IF  ${cnt} > 0 and "${type}" == "color"
    ${new_text}=            FakerLibrary.Safe Hex Color
  ELSE IF  ${cnt} > 0 and "${type}" == "password"
    ${new_text}=            FakerLibrary.Password            10                             True                        True                          True                        True
  ELSE IF  ${cnt} > 0 and "${type}" == "date"
    ${new_text}=            FakerLibrary.Date  	              pattern=%d-%m-%Y
  ELSE IF  ${cnt} > 0 and "${type}" == "word"
    ${new_text}=            FakerLibrary.Sentence             nb_words=1
  ELSE IF  ${cnt} > 0 and "${type}" == "otp"
    ${new_text}=            FakerLibrary.Random Int           min=100000                    max=999999
    ${new_text}=            Convert To String                 ${new_text}
  ELSE IF  ${cnt} > 0
    ${new_text}=            FakerLibrary.Sentence
  END
    ${cnt}=                 Get Length                        ${text}
  IF  ${cnt} > 0
    ${text}=                Replace String                    ${text}                       ${symbol}                   ${new_text}
  END
  RETURN    ${text}

Click "${text}" button
  ${text}=                  Check Text                        ${text}
  Click                     (${CURRENT_SECTION}//button[@title = "${text}"])[1]
  Scroll By                 ${None}
  Wait For Load State       domcontentloaded                  timeout=${BROWSER_TIMEOUT}

Click "${text}" button dialog
  ${text}=                  Check Text                        ${text}
  Click                     (//div[@class = 'ant-modal-content']//button[contains(.,"${text}")])[1]
  Scroll By                 ${None}
  Wait For Load State       domcontentloaded    

Get Element Item By Name
  [Arguments]               ${name}                           ${xpath}=${EMPTY}
  RETURN                    ${CURRENT_SECTION}//*[@data-item="true"]//*[(text()="${name}")]/ancestor::*[@data-item="true"][1]${xpath}

Click the "${name}" drop-down menu
  Click                     (//div[contains(@class,"dropdown")]/ul[contains(@class,"menu")]//button[text()="${name}"])[1]
