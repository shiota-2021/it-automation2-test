#   Copyright 2022 NEC Corporation
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
import ast


def menu_unique_constraint_valid(objdbca, objtable, option):
    retBool = True
    msg = ''
    
    entry_parameter = option.get('entry_parameter').get('parameter')
    menu_name = entry_parameter.get("menu_name")
    unique_constraint_item = entry_parameter.get("unique_constraint_item")

    # 値をリスト形式にフォーマット
    try:
        unique_constraint_item = ast.literal_eval(unique_constraint_item)
    except Exception:
        retBool = False
        msg = "一意制約(複数項目)の形式が不正です。"

    # 指定されたメニューからメニュー項目名(REST)を取得
    where_str = "WHERE DISUSE_FLAG = '0' AND MENU_CREATE_ID = %s"
    return_values = objdbca.table_select('T_MENU_COLUMN', where_str, [menu_name])
    item_name_rest = []
    if 0 < len(return_values):
        for data in return_values:
            try:
                item_name_rest.append(data.get('COLUMN_NAME_REST'))
            except Exception:
                retBool = False
                msg = "選択されたメニュー名は不正です"
        print(item_name_rest)
    else:
        retBool = False
        msg = "選択されたメニュー名は不正です"
    # リスト型かどうか判定
    if retBool:
        if isinstance(unique_constraint_item, list):
            for item_list in unique_constraint_item:
                if isinstance(item_list, list):
                    for item in item_list:
                        if item not in item_name_rest:
                            retBool = False
                            msg = "指定できない値です{}".format(item)
                            return retBool, msg, option
                else:
                    retBool = False
                    msg = "一意制約(複数項目)はリスト型にしてください。2"
        else:
            retBool = False
            msg = "一意制約(複数項目)はリスト型にしてください。"

    return retBool, msg, option