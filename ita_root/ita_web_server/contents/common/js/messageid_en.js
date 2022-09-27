////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   Exastro IT Automation / messageid_en.js
//
//   -----------------------------------------------------------------------------------------------
//
//   Copyright 2022 NEC Corporation
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////////////////////////

// メッセージIDの頭文字 FTE
// 標準メニュー        00001～01000
// メニュー定義・作成   01001～02000
// Conductorクラス編集 02001～03000
// Conductor作業確認   03001～04000
// 作業実行            04001～05000
// 作業状態確認        05001～06000
// 
//


const getMessage = ( function() {

    const message = {
        'FTE01001' : "Item",
        'FTE01002' : "Group",
        'FTE01003' : "Cancel",
        'FTE01004' : "Redo",
        'FTE01005' : "Preview",
        'FTE01006' : "Log",
        'FTE01007' : "List(Preview)",
        'FTE01008' : "Menu creation information",
        'FTE01009' : "Basic information",
        'FTE01010' : "Id",
        'FTE01011' : "Auto-input",
        'FTE01012' : "Menu name",
        'FTE01013' : "Menu name(Rest)",
        'FTE01014' : "Creation target",
        'FTE01015' : "Display order",
        'FTE01016' : "Create as vertical menu",
        'FTE01017' : "Last modified",
        'FTE01018' : "Last updated by",
        'FTE01019' : "Target menu group",
        'FTE01020' : "Input",
        'FTE01021' : "Substitution value",
        'FTE01022' : "Reference",
        'FTE01023' : "Unique constraint(Multiple items)",
        'FTE01024' : "Pattern",
        'FTE01025' : "Permission role",
        'FTE01026' : "Role",
        'FTE01027' : "Explanation",
        'FTE01028' : "Remarks",
        'FTE01029' : "Enter the menu name of the menu to be created.\nThe maximum size is 256 bytes.\nThe menu name &quot;Main menu&quot; cannot be used.\n &quot;&#92;&#47;&#58;&#42;&#63;&#34;&#60;&#62;&#124;&#91;&#93;：￥／＊［］&quot; characters cannot be used.",
        'FTE01030' : "Enter the name for the REST API of the menu to be created.",
        'FTE01031' : "Select &quot;Parameter Sheet (Host / Operation)&quot; or\n&quot;Data Sheet (master available)&quot; from the pull-down menu.",
        'FTE01032' : "Enter the display order in the menu group. They are displayed in ascending order.\nInteger value from 0 to 2147483647 can be entered.",
        'FTE01033' : "If the &quot;use&quot; checkbox is checked, a parameter sheet corresponding to the vertical menu will be created.",
        'FTE01034' : "Yes",
        'FTE01035' : "Select Target menu group",
        'FTE01036' : "Select Unique constraint(Multiple items)",
        'FTE01037' : "Select Permission role",
        'FTE01038' : "Enter the description.\nThe maximum size is 8192 bytes.",
        'FTE01039' : "Enter the remarks.\nThe maximum size is 8192 bytes.",
        'FTE01040' : "Required item",
        'FTE01041' : "Create",
        'FTE01042' : "Edit",
        'FTE01043' : "Initialize",
        'FTE01044' : "Diversion new",
        'FTE01045' : "Menu creation history",
        'FTE01046' : "Create(Initialize)",
        'FTE01047' : "Reload",
        'FTE01048' : "Cancel",
        'FTE01049' : "Create(Edit)",
        'FTE01050' : "Close",
        'FTE01051' : "Decision",
        'FTE01052' : "Cansel",
        'FTE01053' : "Item",
        'FTE01054' : "Group",
        'FTE01055' : "Maximum number of bytes",
        'FTE01056' : "Regular expression",
        'FTE01057' : "Minimum value",
        'FTE01058' : "Maximum value",
        'FTE01059' : "Digit number",
        'FTE01060' : "Selection item",
        'FTE01061' : "Required",
        'FTE01062' : "Unique constraint",
        'FTE01063' : "Explanation",
        'FTE01064' : "Remark",
        'FTE01065' : "Host name",
        'FTE01066' : "Operation",
        'FTE01067' : "Parameter",
        'FTE01068' : "Operation name",
        'FTE01069' : "Reference date and time",
        'FTE01070' : "Scheduled date",
        'FTE01071' : "Last run date",
        'FTE01072' : "Remark",
        'FTE01073' : "Last Modified",
        'FTE01074' : "Last updated by",
        'FTE01075' : "Operation",
        'FTE01076' : "System Administrator",
        'FTE01077' : "Target menu group",
        'FTE01078' : "Repeat item will be canceled.",
        'FTE01079' : "Items containing repeats cannot be copied.",
        'FTE01080' : "Input",
        'FTE01081' : "Substitution<br>value",
        'FTE01082' : "Reference",
        'FTE01083' : "Menu group name",
        'FTE01084' : "About vertical menu",
        'FTE01085' : "Yes",
        'FTE01086' : "Maximum number of<br>bytes in the file",
        'FTE01087' : "Reference item",
        'FTE01088' : "[Referenced value]",
        'FTE01089' : "Select reference item",
        'FTE01090' : "Create",
        'FTE01091' : "Unique constraint(Multiple items)",
        'FTE01092' : "Permission role",
        'FTE01093' : "Reference Item",
        'FTE01094' : "Default value",
        'FTE01095' : "Menu",
        'FTE01096' : "Item",
        'FTE01097' : "String",
        'FTE01098' : "Multi string",
        'FTE01099' : "Password",
        'FTE01100' : "File",
        'FTE01101' : "Link",
        'FTE01102' : "[Referenced value]",
        'FTE01103' : "Move item.",
        'FTE01104' : "Enter the item name to be displayed on the menu. \nThe maximum size is 256 bytes.\nDo not use \"/\" in the item names.\n\"Names [numbers] used in the repeat frame\" cannot be used for item names outside the repeat frame.",
        'FTE01105' : "Enter the name of the item (for REST API).",
        'FTE01106' : "Delete the item.",
        'FTE01107' : "Copy the item.",
        'FTE01108' : "Enter the number of repeats.\nInteger value from 2 to 99 can be entered.",
        'FTE01109' : "Selecte \"String\", \"Multi string\", \"Integer\", \"Decimal number\", \"Date\", \"Date/time\",\n\"Pull down selection\", \"Password\", \"File upload\", \"Link\", \"Parameter Sheet Reference\" from the pulldown menu.",
        'FTE01110' : "Enter the maximum number of bytes.\nThe maximum size is 8192 bytes.\nFor editing, it is possible to increase it from the original value.\nThe byte count of half-width alphanumeric characters are equivalent to the number of characters.\nFor full-width characters, the number of characters x 3 + 2 bytes is required.",
        'FTE01111' : "If you want to check input values with regular expression, enter the regular expression.\nThe maximum size is 8192 bytes.\nExample: For half-width numeric items of 0 bytes or more: /^[0-9]*$/\n For half-width alphanumeric characters of 1 byte or more:/^[a-zA-Z0-9]+$/",
        'FTE01112' : "Enter the minimum value of the column.\nFor editing, it is possible to reduce it from the original value.\nInteger value from -2147483648 to 2147483647 can be entered.\nThe value will be -2147483648 if not entered.\nPlease enter value smaller than the maximum value.",
        'FTE01113' : "Enter the maximum value of the column.\nFor editing, it is possible to increase it from the original value.\nInteger value from -2147483648 to 2147483647 can be entered.\nThe value will be 2147483647 if not entered.\nPlease enter value larger than the minimum value.",
        'FTE01114' : "Enter the minimum value of the column.\nFor editing, it is possible to reduce it from the original value.\nInteger value from -99999999999999 to 99999999999999 with total digit for whole\nnumber + fraction part less than 14 digits can be entered.\nThe value will be -99999999999999 if not entered.\nPlease enter value smaller than the maximum value.",
        'FTE01115' : "Enter the maximum value of the column.\nFor editing, it is possible to increase it from the original value.\nInteger value from -99999999999999 to 99999999999999 with total digit for whole\nnumber + fraction part less than 14 digits can be entered.\nThe value will be 99999999999999 if not entered.\nPlease enter value larger than the minimum value.",
        'FTE01116' : "Enter the upper limit of the total digit for whole number + fraction part.\nFor editing, it is possible to increase it from the original valu.\n\nExample: 0.123 has 4 digits (whole number 1 digit, fraction part 3 digits)\n 11.1111 has 6 digits (whole number 2 digit2, fraction part 3 digits)\nInteger value from 1 to 14 can be entered.",
        'FTE01117' : "Select the item to be referenced in the pulldown menu from the pull-down menu.\n※Items that satisfy the following conditions are displayed in the pull-down menu .\nMenu: 「Basic Console: Device List」 and menu created with this function\nItem: String, required and unique constraint item.",
        'FTE01118' : "You can refer to other items based on the menu item you selected in \"Pulldown Selection\".",
        'FTE01119' : "Enter the maximum number of bytes for the file to upload.\nFor editing, it is possible to increase it from the original value.\nThe maximum size is 4294967296 bytes.",
        'FTE01120' : "Select the item to be referenced from the menu items created in the Creation target \"Parameter Sheet(Operation)\".\nRefers to the value of the same operation from the selected items.",
        'FTE01121' : "When registering from the created menu, set the value to be entered in the input field by default.\nYou cannot set a value that exceeds the \"Maximum number of bytes\" or a value that does not match the \"Regular expression\".",
        'FTE01122' : "When registering from the created menu, set the value to be entered in the input field by default.\nYou cannot set a Values outside the range of \"Maximum value\" and \"Minimum value\".",
        'FTE01123' : "When registering from the created menu, set the value to be entered in the input field by default.\nYou cannot set a Values outside the range of \"Maximum value\" and \"Minimum value\" and \"Digit number\".",
        'FTE01124' : "When registering from the created menu, set the value to be entered in the input field by default.",
        'FTE01125' : "When registering from the created menu, set the value to be entered in the input field by default.\nYou cannot set a value that exceeds the \"Maximum number of bytes\".",
        'FTE01126' : "When registering from the created menu, Set the value selected by default.",
        'FTE01127' : "To make it a required item, check the check box.",
        'FTE01128' : "To make it a unique item, check the check box.",
        'FTE01129' : "Enter the description that will be displayed when users hover mouse cursor over the item name.\nThe maximum size is 1024 bytes.",
        'FTE01130' : "Enter the remarks column.\nThe maximum size is 8192 bytes.",
        'FTE01131' : "Please Wait... Loading",
        'FTE01132' : "Failed to get the Default value",
        'FTE01133' : "Exchange ID has failed",
        'FTE01134' : "Date/time",
        'FTE01135' : "Date",
        'FTE01136' : "Do you want to create the  Menu ?\n*If a menu with the same menu name or a menu the same 'Menu definition information' ID already exists, the existing data will be deleted and overwritten by the new data.\\nIf you need to retain the existing data, select 'Cancel' and perform a backup.",
        'FTE01137' : "Do you want to perform menu initialization? \n*The data you have already entered in this menu will be deleted. \nIf you need the entered data, please select \"Cancel\" to back up the data.",
        'FTE01138' : "Do you want to perform an edit of the menu? \n*The data entered in the existing item will remain, but if you had deleted the existing item, the data entered in that item will be deleted. \nIf you change the \"Regular expression\" in an existing item, it may cause inconsistency with the existing data. \nAlso, if the newly added item was set as \"Required\" and \"Unique constraint\", empty data will be entered in the required field, which may cause data inconsistency. \nIf you need to modify the data, please select \"Cancel\".",
        'FTE01139' : "Failed to get the reference item.",
        'FTE01140' : "Menu creation was accepted.\nPlease click the Menu creation history button and check the creation status.\nUUID:",
        'FTE01141' : "Validation errors occurred.",
        'FTE01142' : "No items.",
        'FTE01143' : "Delete",
        'FTE01144' : "Add a pattern",
        'FTE01145' : "No patterns.",
        'FTE01146' : "Item name",
        'FTE01147' : "Item name(rest)",
        'FTE05001' : "Execution No.",
        'FTE05002' : "Check execution status",
        'FTE05003' : "Schedule cancellation",
        'FTE05004' : "Emergency stop",
        'FTE05005' : "Execution No. has not been set.",
        'FTE05006' : "Enter the execution No. and click the check execution status button, or",
        'FTE05007' : "Work management page",
        'FTE05008' : "Please press the Details button",
        'FTE05009' : "Operation status",
        'FTE05010' : "Execution type",
        'FTE05011' : "Status",
        'FTE05012' : "Execution engine",
        'FTE05013' : "Caller conductor",
        'FTE05014' : "Execution user",
        'FTE05015' : "Populated data",
        'FTE05016' : "Result data",
        'FTE05017' : "Operation status",
        'FTE05018' : "Scheduled date/time",
        'FTE05019' : "Start date/time",
        'FTE05020' : "End date/time",
        'FTE05021' : "Operation",
        'FTE05022' : "ID",
        'FTE05023' : "Name",
        'FTE05024' : "Confirmation of hosts to be worked on",
        'FTE05025' : "Confirmation of assignment value",
        'FTE05026' : "Movement",
        'FTE05027' : "Delay timer (minute)",
        'FTE05028' : "Movement detail confirmation",
        'FTE05029' : "Dedicated information for ansible",
        'FTE05030' : "Host specific format",
        'FTE05031' : "WinRM connection",
        'FTE05032' : "ansible.cfg",
        'FTE05033' : "Ansible Core dedicated information",
        'FTE05034' : "virtualenv",
        'FTE05035' : "Ansible Automation Controller dedicated information",
        'FTE05036' : "Execution environment",
    };

    return message;

}());
