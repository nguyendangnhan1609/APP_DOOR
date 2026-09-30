*** Settings ***
Resource               ../keywords/all/Login.robot
Test Setup             Setup
Test Teardown          Tear Down

*** Test Cases ***

LO_00 Login
  [Tags]                                                                                                Develop                   UI                     Smoketest
  All steps Login
