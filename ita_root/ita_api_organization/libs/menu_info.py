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

import textwrap
from common_libs.common import *  # noqa: F403
from common_libs.loadtable import *  # noqa: F403
from common_libs.column import *  # noqa: F403
from flask import g


def collect_menu_info(objdbca, menu, menu_record={}, menu_table_link_record={}, privilege='1'):
    """
        メニュー情報の取得
        ARGS:
            objdbca:DB接クラス  DBConnectWs()
            menu: メニュー string
            menu_record: メニュー管理のレコード
            menu_table_link_record: メニュー-テーブル紐付管理のレコード
            privilege: メニューに対する権限
        RETRUN:
            info_data
    """
    # テーブル名
    t_common_menu_column_link = 'T_COMN_MENU_COLUMN_LINK'
    t_common_column_class = 'T_COMN_COLUMN_CLASS'
    t_common_column_group = 'T_COMN_COLUMN_GROUP'
    t_common_menu_group = 'T_COMN_MENU_GROUP'
    
    # 変数定義
    lang = g.LANGUAGE
    
    # メニュー管理のレコードが空の場合、検索する
    if len(menu_record) == 0:
        menu_record = objdbca.table_select('T_COMN_MENU', 'WHERE `MENU_NAME_REST` = %s AND `DISUSE_FLAG` = %s', [menu, 0])
        if not menu_record:
            log_msg_args = [menu]
            api_msg_args = [menu]
            raise AppException("499-00002", log_msg_args, api_msg_args)  # noqa: F405

    # メニュー-テーブル紐付管理のレコードが空の場合、検索する
    if len(menu_table_link_record) == 0:
        query_str = textwrap.dedent("""
            SELECT * FROM `T_COMN_MENU_TABLE_LINK` TAB_A
                LEFT JOIN `T_COMN_MENU` TAB_B ON ( TAB_A.`MENU_ID` = TAB_B.`MENU_ID`)
            WHERE TAB_B.`MENU_NAME_REST` = %s AND
                TAB_A.`DISUSE_FLAG`='0' AND
                TAB_B.`DISUSE_FLAG`='0'
        """).strip()
        menu_table_link_record = objdbca.sql_execute(query_str, [menu])
        if not menu_table_link_record:
            log_msg_args = [menu]
            api_msg_args = [menu]
            raise AppException("499-00003", log_msg_args, api_msg_args)  # noqa: F405

    # メニュー管理から情報取得
    menu_id = menu_record[0].get('MENU_ID')  # 対象メニューを特定するためのID
    menu_group_id = menu_record[0].get('MENU_GROUP_ID')  # 対象メニューグループを特定するためのID
    menu_name = menu_record[0].get('MENU_NAME_' + lang.upper())
    login_necessity = menu_record[0].get('LOGIN_NECESSITY')
    auto_filter_flg = menu_record[0].get('AUTOFILTER_FLG')
    initial_filter_flg = menu_record[0].get('INITIAL_FILTER_FLG')
    web_print_limit = menu_record[0].get('WEB_PRINT_LIMIT')
    web_print_confirm = menu_record[0].get('WEB_PRINT_CONFIRM')
    xls_print_limit = menu_record[0].get('XLS_PRINT_LIMIT')
    sort_key = menu_record[0].get('SORT_KEY')
    
    # メニュー-テーブル紐付管理から情報取得
    menu_info = menu_table_link_record[0].get('MENU_INFO_' + lang.upper())
    sheet_type = menu_table_link_record[0].get('SHEET_TYPE')
    history_table_flag = menu_table_link_record[0].get('HISTORY_TABLE_FLAG')
    table_name = menu_table_link_record[0].get('TABLE_NAME')
    view_name = menu_table_link_record[0].get('VIEW_NAME')
    pk_column_name_rest = menu_table_link_record[0].get('PK_COLUMN_NAME_REST')
    inherit = menu_table_link_record[0].get('INHERIT')
    vertical = menu_table_link_record[0].get('VERTICAL')
    row_insert_flag = menu_table_link_record[0].get('ROW_INSERT_FLAG')
    row_update_flag = menu_table_link_record[0].get('ROW_UPDATE_FLAG')
    row_disuse_flag = menu_table_link_record[0].get('ROW_DISUSE_FLAG')
    row_reuse_flag = menu_table_link_record[0].get('ROW_REUSE_FLAG')
    
    # 『メニューグループ管理』テーブルから対象のデータを取得
    ret = objdbca.table_select(t_common_menu_group, 'WHERE MENU_GROUP_ID = %s AND DISUSE_FLAG = %s', [menu_group_id, 0])
    if not ret:
        log_msg_args = [menu]
        api_msg_args = [menu]
        raise AppException("499-00004", log_msg_args, api_msg_args)  # noqa: F405
    
    menu_group_name = ret[0].get('MENU_GROUP_NAME_' + lang.upper())
    parent_menu_group_id = ret[0].get('PARENT_MENU_GROUP_ID')
    parent_menu_group_name = None
    if parent_menu_group_id:
        ret = objdbca.table_select(t_common_menu_group, 'WHERE MENU_GROUP_ID = %s AND DISUSE_FLAG = %s', [parent_menu_group_id, 0])
        if ret:
            parent_menu_group_name = ret[0].get('MENU_GROUP_NAME_' + lang.upper())
    
    menu_info_data = {
        'menu_info': menu_info,
        'menu_group_id': menu_group_id,
        'menu_group_name': menu_group_name,
        'parent_menu_group_id': parent_menu_group_id,
        'parent_menu_group_name': parent_menu_group_name,
        'menu_id': menu_id,
        'menu_name': menu_name,
        'sheet_type': sheet_type,
        'history_table_flag': history_table_flag,
        'table_name': table_name,
        'view_name': view_name,
        'pk_column_name_rest': pk_column_name_rest,
        'inherit': inherit,
        'vertical': vertical,
        'row_insert_flag': row_insert_flag,
        'row_update_flag': row_update_flag,
        'row_disuse_flag': row_disuse_flag,
        'row_reuse_flag': row_reuse_flag,
        'login_necessity': login_necessity,
        'auto_filter_flg': auto_filter_flg,
        'initial_filter_flg': initial_filter_flg,
        'web_print_limit': web_print_limit,
        'web_print_confirm': web_print_confirm,
        'xls_print_limit': xls_print_limit,
        'sort_key': sort_key,
        'privilege': privilege
    }
    
    # 『カラムクラスマスタ』テーブルからcolumn_typeの一覧を取得
    ret = objdbca.table_select(t_common_column_class, 'WHERE DISUSE_FLAG = %s', [0])
    column_class_master = {}
    for recode in ret:
        column_class_master[recode.get('COLUMN_CLASS_ID')] = recode.get('COLUMN_CLASS_NAME')
    
    # 『カラムグループ管理』テーブルからカラムグループ一覧を取得
    column_group_list = {}
    ret = objdbca.table_select(t_common_column_group, 'WHERE DISUSE_FLAG = %s', [0])
    col_group_recode_count = len(ret)  # 「カラムグループ管理」のレコード数を格納
    if ret:
        for recode in ret:
            add_data = {
                "column_group_id": recode.get('COL_GROUP_ID'),
                "column_group_name": recode.get('COL_GROUP_NAME_' + lang.upper()),
                "full_column_group_name": recode.get('FULL_COL_GROUP_NAME_' + lang.upper()),
                "parent_column_group_id": recode.get('PA_COL_GROUP_ID')
            }
            column_group_list[recode.get('COL_GROUP_ID')] = add_data
    
    # 『メニュー-カラム紐付管理』テーブルから対象のデータを取得
    ret = objdbca.table_select(t_common_menu_column_link, 'WHERE MENU_ID = %s AND DISUSE_FLAG = %s ORDER BY COLUMN_DISP_SEQ ASC', [menu_id, 0])
    
    column_info_data = {}
    tmp_column_group = {}
    tmp_column_group_input = {}
    tmp_column_group_view = {}
    column_group_parent_of_child = {}  # カラムグループの親子関係があるとき、子の一番大きい親を結びつける
    column_group_parent_of_child_input = {}  # カラムグループの親子関係があるとき、子の一番大きい親を結びつける
    column_group_parent_of_child_view = {}  # カラムグループの親子関係があるとき、子の一番大きい親を結びつける
    column_group_info_data = {}

    if ret:
        for count, recode in enumerate(ret, 1):

            # json形式のレコードは改行を削除
            validate_option = recode.get('VALIDATE_OPTION')
            if type(validate_option) is str:
                validate_option = validate_option.replace('\n', '')
                
            before_validate_register = recode.get('BEFORE_VALIDATE_REGISTER')
            if type(before_validate_register) is str:
                before_validate_register = before_validate_register.replace('\n', '')
                
            after_validate_register = recode.get('AFTER_VALIDATE_REGISTER')
            if type(after_validate_register) is str:
                after_validate_register = after_validate_register.replace('\n', '')
            
            # カラムグループIDがあればカラムグループ名を取得
            column_group_name = None
            column_group_id = recode.get('COL_GROUP_ID')
            if column_group_id:
                target_data = column_group_list.get(column_group_id)
                if target_data:
                    column_group_name = target_data.get('full_column_group_name')
            
            detail = {
                'column_id': recode.get('COLUMN_DEFINITION_ID'),
                'column_name': recode.get('COLUMN_NAME_' + lang.upper()),
                'column_name_rest': recode.get('COLUMN_NAME_REST'),
                'column_group_id': column_group_id,
                'column_group_name': column_group_name,
                'column_type': column_class_master[recode.get('COLUMN_CLASS')],
                'column_disp_seq': recode.get('COLUMN_DISP_SEQ'),
                'description': recode.get('DESCRIPTION_' + lang.upper()),
                'ref_table_name': recode.get('REF_TABLE_NAME'),
                'ref_pkey_name': recode.get('REF_PKEY_NAME'),
                'ref_col_name': recode.get('REF_COL_NAME'),
                'ref_sort_conditions': recode.get('REF_SORT_CONDITIONS'),
                'ref_multi_lang': recode.get('REF_MULTI_LANG'),
                'col_name': recode.get('COL_NAME'),
                'button_action': recode.get('BUTTON_ACTION'),
                'save_type': recode.get('SAVE_TYPE'),
                'auto_input': recode.get('AUTO_INPUT'),
                'input_item': recode.get('INPUT_ITEM'),
                'view_item': recode.get('VIEW_ITEM'),
                'unique_item': recode.get('UNIQUE_ITEM'),
                'required_item': recode.get('REQUIRED_ITEM'),
                'initial_value': recode.get('INITIAL_VALUE'),
                'validate_option': validate_option,
                'before_validate_register': before_validate_register,
                'after_validate_register': after_validate_register
            }
            col_num = 'c{}'.format(count)
            column_info_data[col_num] = detail
            
            # ####メモ：縦メニュー用の考慮がされていないため、最終的な修正が必要。
            # カラムグループ利用があれば、カラムグループ管理用配列に追加
            if column_group_id:
                tmp_column_group, column_group_parent_of_child = add_tmp_column_group(column_group_list,
                                                                                      col_group_recode_count,
                                                                                      column_group_id, col_num,
                                                                                      tmp_column_group,
                                                                                      column_group_parent_of_child
                                                                                      )
                if recode.get('INPUT_ITEM') in ['0', '1']:
                    tmp_column_group_input, column_group_parent_of_child_input = add_tmp_column_group(column_group_list,
                                                                                                      col_group_recode_count,
                                                                                                      column_group_id,
                                                                                                      col_num,
                                                                                                      tmp_column_group_input,
                                                                                                      column_group_parent_of_child_input
                                                                                                      )
                if recode.get('VIEW_ITEM') in ['1']:
                    tmp_column_group_view, column_group_parent_of_child_view = add_tmp_column_group(column_group_list,
                                                                                                    col_group_recode_count,
                                                                                                    column_group_id,
                                                                                                    col_num,
                                                                                                    tmp_column_group_view,
                                                                                                    column_group_parent_of_child_view
                                                                                                    )
        
        # カラムグループ管理用配列について、カラムグループIDをg1,g2,g3...に変換し、idやnameを格納する。
        column_group_info_data, key_to_id = collect_column_group_sort_order(column_group_list,
                                                                            tmp_column_group,
                                                                            tmp_column_group_input,
                                                                            tmp_column_group_view
                                                                            )
        
        # 大元のカラムの並び順を作成し格納
        # ####メモ：縦メニュー用の考慮がされていないため、最終的な修正が必要。
        columns, columns_input, columns_view = collect_parent_sord_order(column_info_data, column_group_parent_of_child, key_to_id)
        menu_info_data['columns'] = columns
        menu_info_data['columns_input'] = columns_input
        menu_info_data['columns_view'] = columns_view
    
    info_data = {
        'menu_info': menu_info_data,
        'column_info': column_info_data,
        'column_group_info': column_group_info_data
    }
    
    return info_data


def add_tmp_column_group(column_group_list, col_group_recode_count, column_group_id, col_num, tmp_column_group, column_group_parent_of_child):
    """
        カラムグループ管理用配列にカラムグループの親子関係の情報を格納する
        ARGS:
            column_group_list: カラムグループのレコード一覧
            col_group_recode_count: カラムグループのレコード数
            column_group_id: 対象のカラムグループID
            col_num: カラムの並び順をc1, c2, c3...という名称に変換した値
            tmp_colmn_group: カラムグループ管理用配列
            column_group_parent_of_child: カラムグループの親子関係があるとき、子の一番大きい親を結びつけるための配列
        RETRUN:
            tmp_colmn_group, column_group_parent_of_child
    """
    if column_group_id not in tmp_column_group:
        tmp_column_group[column_group_id] = []
    
    tmp_column_group[column_group_id].append(col_num)
    
    # カラムグループの親をたどり格納
    end_flag = False
    target_column_group_id = column_group_id
    first_column_group_id = column_group_id
    loop_count = 0
    max_loop = int(col_group_recode_count) ** 2  # 「カラムグループ作成情報」のレコード数の二乗がループ回数の上限
    while not end_flag:
        for target in column_group_list.values():
            if target.get('column_group_id') == target_column_group_id:
                parent_column_group_id = target.get('parent_column_group_id')
                if not parent_column_group_id:
                    end_flag = True
                    break
                
                if parent_column_group_id not in tmp_column_group:
                    tmp_column_group[parent_column_group_id] = []
                
                if target_column_group_id not in tmp_column_group[parent_column_group_id]:
                    tmp_column_group[parent_column_group_id].append(target_column_group_id)
                
                target_column_group_id = parent_column_group_id
                column_group_parent_of_child[first_column_group_id] = parent_column_group_id
        
        # ループ数がmax_loopを超えたら無限ループの可能性が高いため強制終了
        loop_count += 1
        if loop_count > max_loop:
            end_flag = True
    
    return tmp_column_group, column_group_parent_of_child


def collect_column_group_sort_order(column_group_list, tmp_column_group, tmp_column_group_input, tmp_column_group_view):
    """
        カラムグループ管理用配列(tmp_column_group)を元に、カラムグループIDをg1,g2,g3...に変換し、idやnameを格納した配列を返す
        ARGS:
            column_group_list: カラムグループのレコード一覧
            tmp_colmn_group: カラムグループ管理用配列
            tmp_column_group_input: カラムグループ管理用配列(INPUT_ITEMが0,1)
            tmp_column_group_view: カラムグループ管理用配列(VIEW_ITEMが0)

        RETRUN:
            column_group_info_data: カラムグループ情報格納用配列
            key_to_id: カラムグループIDとg1,g2,g3...の紐付
    """
    # カラムグループIDと対応のg番号配列を作成
    key_to_id = {}
    group_num = 1
    column_group_info_data = {}

    for group_id in tmp_column_group.keys():
        key_to_id[group_id] = 'g' + str(group_num)
        group_num += 1
    
    # カラムグループ管理用配列について、カラムグループIDをg1,g2,g3...に変換し、idやnameを格納する。
    for group_id, value_list in tmp_column_group.items():
        add_data = {}
        columns = []
        for col in value_list:
            if col in key_to_id:
                columns.append(key_to_id[col])
            else:
                columns.append(col)

        # INPUT_ITEMが0,1のデータ
        columns_input = []
        if group_id in tmp_column_group_input.keys():
            for col in tmp_column_group_input[group_id]:
                if col in key_to_id:
                    columns_input.append(key_to_id[col])
                else:
                    columns_input.append(col)

        # INPUT_ITEMが1のデータ
        columns_view = []
        if group_id in tmp_column_group_view.keys():
            for col in tmp_column_group_view[group_id]:
                if col in key_to_id:
                    columns_view.append(key_to_id[col])
                else:
                    columns_view.append(col)
        
        add_data['columns'] = columns
        add_data['columns_input'] = columns_input
        add_data['columns_view'] = columns_view
        add_data['column_group_id'] = group_id
        add_data['column_group_name'] = None
        add_data['parent_column_group_id'] = None
        add_data['parent_column_group_name'] = None
        target_data = column_group_list.get(group_id)
        if target_data:
            add_data['column_group_name'] = target_data.get('column_group_name')
            parent_id = target_data.get('parent_column_group_id')
            if parent_id:
                add_data['parent_column_group_id'] = parent_id
                add_data['parent_column_group_name'] = column_group_list.get(parent_id).get('column_group_name')
        
        column_group_info_data[key_to_id[group_id]] = add_data
    
    return column_group_info_data, key_to_id


def collect_parent_sord_order(column_info_data, column_group_parent_of_child, key_to_id):
    """
        大元のカラムの並び順を作成
        ARGS:
            column_info_data: 対象のカラム情報
            column_group_parent_of_child: カラムグループの親子関係があるとき、子の一番大きい親を結びつけるための配列
            key_to_id: カラムグループIDと対応のg番号配列
        RETRUN:
            columns
            columns_input
            columns_view
    """
    columns = []
    columns_input = []
    columns_view = []
    for col_num, col_data in column_info_data.items():
        column_group_id = col_data['column_group_id']
        if not column_group_id:
            # カラムグループが無い場合はcol_num(c1, c2, c3...)を格納
            columns.append(col_num)
            if col_data['input_item'] in ['0', '1']:
                columns_input.append(col_num)
            if col_data['view_item'] in ['1']:
                columns_view.append(col_num)
            continue
        
        if column_group_id in column_group_parent_of_child:
            # 大親のカラムグループIDをg番号(g1, g2, g3...)に変換した値を格納
            parent_column_group_id = column_group_parent_of_child.get(column_group_id)
            if key_to_id[parent_column_group_id] not in columns:
                columns.append(key_to_id[parent_column_group_id])
                if col_data['input_item'] in ['0', '1']:
                    columns_input.append(key_to_id[parent_column_group_id])
                if col_data['view_item'] in ['1']:
                    columns_view.append(key_to_id[parent_column_group_id])
            continue
        else:
            # カラムグループIDをg番号(g1, g2, g3...)に変換した値を格納
            if key_to_id[column_group_id] not in columns:
                columns.append(key_to_id[column_group_id])
                if col_data['input_item'] in ['0', '1']:
                    columns_input.append(key_to_id[column_group_id])
                if col_data['view_item'] in ['1']:
                    columns_view.append(key_to_id[column_group_id])
            continue

    return columns, columns_input, columns_view 


def collect_menu_column_list(objdbca, menu, menu_record):
    """
        メニューのカラム一覧の取得
        ARGS:
            objdbca:DB接クラス  DBConnectWs()
            menu: メニュー string
            menu_record: メニュー管理のレコード
        RETRUN:
            column_list
    """
    # 変数定義
    t_common_menu_column_link = 'T_COMN_MENU_COLUMN_LINK'
    
    # メニュー管理から情報取得
    menu_id = menu_record[0].get('MENU_ID')
    
    # 『メニュー-カラム紐付管理』テーブルから対象のデータを取得
    ret = objdbca.table_select(t_common_menu_column_link, 'WHERE MENU_ID = %s ORDER BY COLUMN_DISP_SEQ ASC', [menu_id])
    if not ret:
        log_msg_args = [menu]
        api_msg_args = [menu]
        raise AppException("499-00004", log_msg_args, api_msg_args)  # noqa: F405
    
    column_list = []
    for recode in ret:
        column_list.append(recode.get('COLUMN_NAME_REST'))
    
    return column_list


def collect_pulldown_list(objdbca, menu, menu_record):
    """
        IDカラム(IDColumn, LinkIDColumn, AppIDColumn)のプルダウン選択用一覧の取得
        ARGS:
            objdbca:DB接クラス  DBConnectWs()
            menu: メニュー string
            menu_record: メニュー管理のレコード
        RETRUN:
            pulldown_list
    """
    # 変数定義
    t_common_menu_column_link = 'T_COMN_MENU_COLUMN_LINK'
    t_common_column_class = 'T_COMN_COLUMN_CLASS'
    
    # 『カラムクラスマスタ』テーブルからcolumn_typeの一覧を取得
    ret = objdbca.table_select(t_common_column_class, 'WHERE DISUSE_FLAG = %s', [0])
    column_class_master = {}
    for recode in ret:
        column_class_master[recode.get('COLUMN_CLASS_ID')] = recode.get('COLUMN_CLASS_NAME')
    
    # メニュー管理から情報取得
    menu_id = menu_record[0].get('MENU_ID')
    
    # 『メニュー-カラム紐付管理』テーブルから対象のメニューのデータを取得
    ret = objdbca.table_select(t_common_menu_column_link, 'WHERE MENU_ID = %s AND DISUSE_FLAG = %s', [menu_id, 0])
    
    pulldown_list = {}
    # 7(IDColumn), 11(LinkIDColumn), 18(RoleIDColumn), 21(JsonIDColumn), 22(EnvironmentIDColumn)
    id_column_list = ["7", "11", "18", "21", "22"]
    for recode in ret:
        column_class_id = str(recode.get('COLUMN_CLASS'))
        
        if column_class_id not in id_column_list:
            continue

        column_name_rest = str(recode.get('COLUMN_NAME_REST'))

        objmenu = load_table.loadTable(objdbca, menu)
        objcolumn = objmenu.get_columnclass(column_name_rest)
        # ####メモ：現状、ソートコンディションを考慮していない。
        column_pulldown_list = objcolumn.get_values_by_key()
        pulldown_list[column_name_rest] = column_pulldown_list

    return pulldown_list


def collect_search_candidates(objdbca, menu, column, menu_record={}, menu_table_link_record={}):
    """
        IDカラム(IDColumn, LinkIDColumn, AppIDColumn)のプルダウン選択用一覧の取得
        ARGS:
            objdbca:DB接クラス  DBConnectWs()
            menu: メニュー string
            column: カラム string
            menu_record: メニュー管理のレコード
            menu_table_link_record: メニュー-テーブル紐付管理のレコード
        RETRUN:
            search_candidates
    """
    # 変数定義
    t_common_menu_column_link = 'T_COMN_MENU_COLUMN_LINK'

    # メニュー管理のレコードが空の場合、検索する
    if len(menu_record) == 0:
        menu_record = objdbca.table_select('T_COMN_MENU', 'WHERE `MENU_NAME_REST` = %s AND `DISUSE_FLAG` = %s', [menu, 0])
        if not menu_record:
            log_msg_args = [menu]
            api_msg_args = [menu]
            raise AppException("499-00002", log_msg_args, api_msg_args)  # noqa: F405

    # メニュー-テーブル紐付管理のレコードが空の場合、検索する
    if len(menu_table_link_record) == 0:
        query_str = textwrap.dedent("""
            SELECT * FROM `T_COMN_MENU_TABLE_LINK` TAB_A
                LEFT JOIN `T_COMN_MENU` TAB_B ON ( TAB_A.`MENU_ID` = TAB_B.`MENU_ID`)
            WHERE TAB_B.`MENU_NAME_REST` = %s AND
                TAB_A.`DISUSE_FLAG`='0' AND
                TAB_B.`DISUSE_FLAG`='0'
        """).strip()
        menu_table_link_record = objdbca.sql_execute(query_str, [menu])
        if not menu_table_link_record:
            log_msg_args = [menu]
            api_msg_args = [menu]
            raise AppException("499-00003", log_msg_args, api_msg_args)  # noqa: F405

    # メニュー管理から情報取得
    menu_id = menu_record[0].get('MENU_ID')
    
    # 『メニュー-テーブル紐付管理』テーブルから対象のテーブル名を取得
    table_name = menu_table_link_record[0].get('TABLE_NAME')
    
    # 『メニュー-カラム紐付管理』テーブルから対象の項目のデータを取得
    ret = objdbca.table_select(t_common_menu_column_link, 'WHERE MENU_ID = %s AND COLUMN_NAME_REST = %s AND DISUSE_FLAG = %s', [menu_id, column, 0])  # noqa: E501
    if not ret:
        log_msg_args = [menu, column]
        api_msg_args = [menu, column]
        raise AppException("499-00006", log_msg_args, api_msg_args)  # noqa: F405
    
    col_name = str(ret[0].get('COL_NAME'))
    column_class_id = str(ret[0].get('COLUMN_CLASS'))
    
    # 対象のテーブルからレコードを取得し、対象のカラムの値を一覧化
    ret = objdbca.table_select(table_name, '', [])
    if not ret:
        # レコードが0件の場合は空をreturn
        return []
    
    search_candidates = []
    # 7(IDColumn), 11(LinkIDColumn), 14(LastUpdateUserColumn), 18(RoleIDColumn), 21(JsonIDColumn), 22(EnvironmentIDColumn)
    id_column_list = ["7", "11", "14", "18", "21", "22"]
    
    if column_class_id in id_column_list:
        # プルダウンの一覧を取得
        objmenu = load_table.loadTable(objdbca, menu)
        objcolumn = objmenu.get_columnclass(column)
        column_pulldown_list = objcolumn.get_values_by_key()

        # レコードのなかからプルダウンの一覧に合致するデータを抽出
        for recode in ret:
            if recode.get(col_name) in column_pulldown_list.keys():
                convert = column_pulldown_list[recode.get(col_name)]
                search_candidates.append(convert)
    else:
        for recode in ret:
            target = recode.get(col_name)
            search_candidates.append(target)
        
    # 重複を削除(元の並び順は維持)
    if search_candidates:
        search_candidates = list(dict.fromkeys(search_candidates))
    
    return search_candidates
