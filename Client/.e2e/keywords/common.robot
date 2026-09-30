*** Settings ***
Library                 Browser
Library                 FakerLibrary        locale=en_IN
Library                 String
Library                 DateTime
Library                 DocTest.VisualTest

*** Variables ***
${BROWSER}              chromium
${HEADLESS}             %{HEADLESS=False}
${BROWSER_TIMEOUT}      %{BROWSER_TIMEOUT=10} seconds
${SHOULD_TIMEOUT}       0.01 seconds

${URL_DEFAULT}          %{HOST_ADDRESS=http://localhost:4200/}
${STATE}                Evaluate  json.loads("""{}""")  json

# Admin's default information #
${USER_NAME}            %{USER_NAME=admin@gmail.com}
${USER_PASSWORD}        %{USER_PASSWORD=Password1!}
${CURRENT_SECTION}

*** Keywords ***

Setup
  Set Browser Timeout         ${BROWSER_TIMEOUT}
  New Browser                 ${BROWSER}  headless=${HEADLESS}
  New Context                 viewport={'width': 1920, 'height': 953}
  New Page                    ${URL_DEFAULT}
  ${STATE}                    Evaluate  json.loads("""{}""")  json

Tear Down
  Close Browser               ALL
