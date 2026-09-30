*** Settings ***
Resource               ../keywords/all/Login.robot
Resource               ../keywords/all/Example.robot
Test Setup             Setup
Test Teardown          Tear Down

*** Test Cases ***

PC_00 Example List
  [Tags]                                                                                                Develop                   UI                     Smoketest
  All steps Login
  All steps Example
