*** Settings ***
Resource               ../utils/check.robot

*** Keywords ***

Right click "${text}" column
  ${text}=                  Check Text                        ${text}
  Scroll To Element         ${CURRENT_SECTION}//*[self::th or self::td][@aria-label = "${text}"]
  Click                     ${CURRENT_SECTION}//*[self::th or self::td][@aria-label = "${text}"]   right
  Wait For Load State       domcontentloaded                  timeout=${BROWSER_TIMEOUT}

Drag to resize "${name}" column
  Scroll To Element           ${CURRENT_SECTION}//div[contains(@class,"title") and text()="${name}"]/../button[contains(@class, "resizer")]
  Drag And Drop Relative To   ${CURRENT_SECTION}//div[contains(@class,"title") and text()="${name}"]/../button[contains(@class, "resizer")]    100    0
