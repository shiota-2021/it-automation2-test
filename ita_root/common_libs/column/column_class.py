# Copyright 2022 NEC Corporation#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import json

"""
カラムクラス共通処理(カラム)
"""


class Column():
    """
    カラムクラス共通処理(カラム)

        以下のデータ群持っている前提、キー等は変更の可能性あり
            メニュー-テーブル紐付管理
            組み合わせ一意管理
            メニュー-カラム紐付管理

        def set_XXXXX(self) : selfの設定用
        def get_XXXXX(self) : selfの取得用

        maintenance関連
            before_iud_action   :レコード操作前の処理（バリデーション、カラムの個別処理）
                以下を呼び出し
                    before_iud_validate_check   ：カラムクラスのバリデーション
                    before_iud_menu_action  ：カラムの個別処理

            after_iud_action    :レコード操作後の処理（バリデーション、個別処理）
                以下を呼び出し
                    after_iud_common_action :カラムクラスの処理
                    after_iud_menu_action   :カラムの個別処理



            カラムクラス毎に行うバリデーション処理（クラスの継承でオーバライドさせる）
            check_basic_valid   ：カラムクラスのバリデーション処理

            e.g.作成するカラムクラスのバリデーション、個別処理に関して
            class カラムクラス名(継承元クラス):
                def __init__(self,objtable,col_name):

                # カラムクラス毎のバリデーション処理
                def check_basic_valid(self,val):
                # カラムの個別処理
                def before_iud_menu_action(self,val=''):
                def after_iud_menu_action(self,val=''):


        filter関連
            # where句の中身を返却 条件文,bind情報
            get_filter_query

        load_table.py関連
            # ID相互変換用のデータ生成
            get_convert_list
            # 初期値を返却
            set_default_value
            # 値をID連携先のIDへ変換
            convert_value_id
            # 値をID連携先のIDへ変換
            convert_id_value

    """

    # バリデーション閾値キー
    base_valid_list = {
        "min_length": None,  # 最大バイト数
        "max_length": None,  # 最大バイト数
        "preg_match": None,  # 正規表現
        "int_max": None,  # 最大値(整数)
        "int_min": None,  # 最小値(整数)
        "float_max": None,  # 最大値(小数)
        "float_min": None,  # 最大値(小数)
        "float_digit": None,  # 桁数(小数)
        "upload_max_size": None,  # ファイル最大バイト数
    }

    def __init__(self, objdbca, objtable, rest_key_name, cmd_type=''):
        # カラムクラス名
        self.class_name = self.__class__.__name__
        # バリデーション閾値
        self.dict_valid = {}
        # テーブル情報
        self.objtable = {}
        # テーブル名
        self.table_name = ''
        # カラム名
        self.col_name = ''
        # rest用項目名
        self.rest_key_name = ''

        # バリデーション閾値キー
        self.base_valid_list = base_valid_list

        self.db_qm = "'"

        self.objdbca = objdbca
        
        self.cmd_type = cmd_type

    # self 設定、取得関連
    def set_objtable(self, objtable):
        """
            テーブルデータを設定
            ARGS:
                objtable
        """
        self.objtable = objtable

    def get_objtable(self):
        """
            テーブルデータを設定
            RETRUN:
                self.objtable
        """
        return self.objtable

    def set_table_name(self, table_name):
        """
            テーブル名を設定
            ARGS:
                table_name
        """
        self.table_name = table_name

    def get_table_name(self):
        """
            テーブル名を取得
            RETRUN:
                self.table_name
        """
        return self.table_name

    def set_col_name(self, col_name):
        """
            カラム名を設定
            ARGS:
                col_name
        """
        self.col_name = col_name

    def get_col_name(self):
        """
            カラム名を取得
            RETRUN:
                self.col_name
        """
        return self.col_name

    def set_rest_key_name(self, rest_key_name):
        """
            REST用項目名を設定
            ARGS:
                rest_key_name
        """
        self.rest_key_name = rest_key_name

    def get_rest_key_name(self):
        """
            REST用項目名を取得
            RETRUN:
                self.rest_key_name
        """
        return self.rest_key_name

    def get_objcols(self):
        """
            全カラム設定を取得
            RETRUN:
                {}
        """
        return self.objtable.get('COLINFO')

    def get_objcol(self):
        """
            単一カラム設定を取得
            RETRUN:
                {}
        """
        return self.get_objcols().get(self.get_rest_key_name())

    def get_label(self):
        """
            項目名を取得
            RETRUN:
                {COLUMN_NAME_JA:XXXX,COLUMN_NAME_EN:XXXX,COLUMN_NAME_REST:XXXX}
        """
        tmpcols = self.get_objcol()
        ret_dict = {
            'COLUMN_NAME_JA': tmpcols.get('COLUMN_NAME_JA'),
            'COLUMN_NAME_EN': tmpcols.get('COLUMN_NAME_EN'),
            'COLUMN_NAME_REST': tmpcols.get('COLUMN_NAME_REST')
        }

        return ret_dict

    def get_dict_valid(self):
        """
            単一カラムバリデーション設定取得
            RETRUN:
                {}
        """
        # result = json.loads(self.get_objcol().get('VALIDATE_OPTION'))
        validate_option = {}
        tmp_validate_option = self.get_objcol().get('VALIDATE_OPTION')
        if tmp_validate_option is not None:
            try:
                validate_option = json.loads(tmp_validate_option)
            except json.JSONDecodeError:
                validate_option = {}

        return validate_option

    def get_call_before_valid_info(self):
        """
            バリデーション個別処理設定取得(レコード操作前)
            RETRUN:
                {}
        """
        return self.get_objcol().get('BEFORE_VALIDATE_REGISTER')

    def get_call_after_valid_info(self):
        """
            バリデーション個別処理設定取得(レコード操作後)
            RETRUN:
                {}
        """
        return self.get_objcol().get('AFTER_VALIDATE_REGISTER')

    def get_base_valid_list(self):
        """
            単一カラムバリデーション設定取得
            RETRUN:
                self.base_valid_list
        """
        return self.base_valid_list

    def get_required(self):
        """
            カラム名を設定
            RETRUN:
                0 / 1
        """
        return self.get_objcol().get('REQUIRED_ITEM')

    def get_uniqued(self):
        """
            カラム名を設定
            RETRUN:
                0 / 1
        """
        return self.get_objcol().get('UNIQUE_ITEM')

    def set_valid_value(self):
        """
            バリデーション閾値の設定（テンプレートのキー以外除外）
            RETRUN:
                {}
        """
        tmp_valid_val = {}
        if len(self.get_dict_valid()) != 0:
            # バリデーション閾値のキー取得
            tmp_valid_val = self.get_base_valid_list().copy()
            for valid_key in list(tmp_valid_val.keys()):
                # バリデーション閾値の値を書き込み
                if valid_key in self.get_dict_valid():
                    tmp_valid_val[valid_key] = self.get_dict_valid().get(valid_key)
                else:
                    # 対象外のキーを除外
                    del tmp_valid_val[valid_key]

        self.dict_valid = tmp_valid_val

    def get_cmd_type(self):
        """
            実行種別を取得
            RETRUN:
                self.cmd_type
        """
        return self.cmd_type
    
    ###
    # [maintenance] レコード操作前処理実施
    def before_iud_action(self, val='', option={}):
        """
            レコード操作前処理 (共通バリデーション + 共通処理 )
            ARGS:
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True

        # 標準バリデーションレコード操作前
        result_1 = self.before_iud_validate_check(val, option)
        if result_1[0] is not True:
            return result_1

        # 個別バリデーションレコード操作前
        result_2 = self.before_iud_menu_action(val, option)
        if result_2[0] is not True:
            return result_2

        return retBool,

    # [maintenance] レコード操作後処理実施
    def after_iud_action(self, val='', option={}):
        """
            共通バリデーション + 共通処理 レコード操作前
            ARGS:
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True
        # カラムの設定を取得

        # 標準バリデーションレコード操作前
        result_1 = self.after_iud_common_action(val, option)
        if result_1 is not True:
            return result_1

        # 個別バリデーションレコード操作前
        result_2 = self.after_iud_menu_action(val, option)
        if result_2 is not True:
            return result_2

        return retBool,

    # [maintenance] 共通バリデーション レコード操作前
    def before_iud_validate_check(self, val='', option={}):
        """
            共通バリデーション レコード操作前
            ARGS:
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True

        cmd_type = self.get_cmd_type()

        if cmd_type != "Discard":
            # バリデーション必須
            result_1 = self.is_valid_required(val, option)
            if result_1[0] is not True:
                return result_1

            # バリデーション一意 DBアクセス
            result_2 = self.get_uniqued()
            if result_2 == '1':
                result_2 = self.is_valid_unique(val, option)
                if result_2[0] is not True:
                    return result_2

            # カラムクラス毎のバリデーション
            result_3 = self.is_valid(val, option)
            if result_3[0] is not True:
                return result_3

        return retBool,

    # [maintenance] カラム個別処理 レコード操作前
    def before_iud_menu_action(self, val='', option={}):
        """
            カラム個別処理  レコード操作前
            ARGS:
                val:値
                option:個別バリデーション,個別処理
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True
        # coll_valid_info = self.get_call_before_valid_info()

        # 個別処理
        ###
        # 外部ファイル読込、関数/クラス/呼び出し？

        #  個別処理用のファイルの確認

        #  個別処理用のファイルの読込

        # 処理の呼び出し

        return retBool,

    # [maintenance] カラムクラスの個別処理 レコード操作後
    def after_iud_common_action(self, val='', option={}):
        """
            カラムクラス毎の個別処理 レコード操作後
            ARGS:
                val:値
                option:オプション
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True

        # カラムクラス毎の個別処理

        return retBool,

    # [maintenance] カラム個別処理 レコード操作後
    def after_iud_menu_action(self, val='', option={}):
        """
            カラム個別処理  レコード操作後
            ARGS:
                val:値
                option:個別処理
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True
        # coll_valid_info = self.get_call_after_valid_info()
        # カラム個別処理
        ###
        # 外部ファイル読込、関数/クラス/呼び出し？

        #  個別処理用のファイルの確認

        #  個別処理用のファイルの読込

        # 処理の呼び出し

        return retBool,

    # [maintenance] 共通バリデーション呼び出し
    def is_valid(self, val, option={}):
        """
            バリデーション実施
            ARGS:
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """

        # カラムクラス毎のバリデーション処理の呼び出し

        # バリデーション閾値の設定（テンプレートのキー以外除外）
        self.set_valid_value()
        # バリデーション閾値の設定（テンプレートのキー以外除外）
        result = self.check_basic_valid(val, option={})

        return result

    # [maintenance] 一意バリデーション呼び出し
    def is_valid_unique(self, val='', option={}):
        """
            一意バリデーション実施
            ARGS:
                col_name:カラム名
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """
        ###
        # DBアクセス一意処理を追加
        ###
        retBool = True
        msg = ''
        column_list, primary_key_list = self.objdbca.table_columns_get(self.get_table_name())
        if self.col_name not in primary_key_list:
            where_str = " where `{}` = %s ".format(self.col_name)
            bind_value_list = [val]

            if 'target_uuid' in option:
                if option.get('target_uuid') is not None:
                    where_str = where_str + " and `{}` <> %s ".format(primary_key_list[0])
                    bind_value_list.append(option.get('target_uuid'))

            result = self.objdbca.table_count(self.table_name, where_str, bind_value_list)
            if result != 0:
                retBool = False
                msg = '{}:一意制約'.format(self.col_name)
                return retBool, msg
        return retBool,

    # [maintenance] 必須バリデーション
    def is_valid_required(self, val='', option={}):
        """
            一意バリデーション実施
            ARGS:
                col_name:カラム名
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """
        retBool = True
        result = self.get_required()

        if result == 1:
            if val is None:
                retBool = False
            elif len(val) == 0:
                retBool = False

        return retBool,

    # [load_table] 初期値の埋め込み
    def set_default_value(self):
        """
            初期値の埋め込み
            ARGS:
                col_name:カラム名
                val:値
            RETRUN:
                初期値
        """

        default_val = None

        objcols = self.objtable.get('COLINFO')
        if objcols is not None and self.get_col_name() is not None:
            default_val = self.get_objcol().get('DEFAULT_VAL')

        return default_val

    # [load_table] 値をID連携先のIDへ変換
    def convert_value_id(self, val=''):
        """
           値をIDに変換
            ARGS:
                val:値
            RETRUN:
                string
        """
        # result = self.get_convert_list().get("VALUE").get(val)
        result = val
        return result

    # [load_table] 値をID連携先のIDへ変換
    def convert_id_value(self, val=''):
        """
           IDを値に変換
            ARGS:
                val:値
            RETRUN:
                string
        """
        # result = self.get_convert_list().get("ID").get(val)
        result = val
        return result

    # [load_table][filter] ID変換用のリスト取得
    def get_convert_list(self):
        """
            ID相互変換用のリスト取得
            ARGS:

            RETRUN:
                {"ID":{"uuid":"value"},"VALUE":{"value":"uuid"}
        """
        result = {
            "ID": None,
            "VALUE": None
        }
        # DB接続 連携先のテーブル情報から
        ####
        ####
        return result

    # [filter] SQL生成用のwhere句
    def get_filter_query(self, search_mode, search_conf):
        """
            SQL生成用のwhere句関連
            ARGS:
                search_mode: 検索種別[LIST/NOMAL/RANGE]
                search_conf: 検索条件
            RETRUN:
                {"bindkey":XXX,bindvalue :{ XXX: val },where: string }
        """

        result = {}

        if search_mode == "LIST":
            # tmp_conf = search_conf.get(search_mode)
            tmp_conf = search_conf
            listno = 0
            # bindkey = "__{}__{}".format(self.get_col_name(),listno)
            # bindvalue = "{}".format(",".join(map(str, tmp_conf)))
            bindkeys = []
            bindvalues = {}
            
            for bindvalue in tmp_conf:
                bindkey = "__{}__{}".format(self.get_col_name(), listno)
                bindkeys.append(bindkey)
                bindvalues.setdefault(bindkey, bindvalue)
                listno = +1

            bindkey = "{}".format(",".join(map(str, bindkeys)))
            str_where = " `{col_name}` IN ( {bindkey} ) ".format(
                col_name=self.get_col_name(),
                bindkey=bindkey
            )
            result.setdefault("bindkey", bindkeys)
            result.setdefault("bindvalue", bindvalues)
            result.setdefault("where", str_where)

        elif search_mode == "NORMAL":
            # bindvalue = search_conf.get(search_mode)
            bindvalue = search_conf

            bindkey = "__{}__".format(self.get_col_name())
            str_where = " `{col_name}` LIKE {bindkey} ".format(
                col_name=self.get_col_name(),
                bindkey=bindkey,
            )
            result.setdefault("bindkey", bindkey)
            result.setdefault("bindvalue", {bindkey: "%{}%".format(bindvalue)})
            result.setdefault("where", str_where)

        elif search_mode == "RANGE":
            # tmp_conf = search_conf.get(search_mode)
            tmp_conf = search_conf
            bindkeys = []
            bindvalues = {}
            start_val = tmp_conf.get('START')
            end_val = tmp_conf.get('END')
            bindkey_s = "__{}_S__".format(self.get_col_name())
            bindkey_e = "__{}_E__".format(self.get_col_name())
            if start_val is not None and end_val is not None:
                if len(start_val) > 0 and len(end_val) > 0:
                    str_where = " `{col_name}` >= {bindkey_s} and `{col_name}` <= {bindkey_e} ".format(
                        col_name=self.get_col_name(),
                        bindkey_s=bindkey_s,
                        bindkey_e=bindkey_e,
                    )
                    bindkeys.append(bindkey_s)
                    bindkeys.append(bindkey_e)
                    bindvalues.setdefault(bindkey_s, start_val)
                    bindvalues.setdefault(bindkey_e, end_val)

                elif len(start_val) > 0 and len(end_val) == 0:
                    str_where = " `{col_name}` >= {bindkey_s} ".format(
                        col_name=self.get_col_name(),
                        bindkey_s=bindkey_s,
                    )
                    bindkeys.append(bindkey_s)
                    bindvalues.setdefault(bindkey_s, start_val)

                elif len(end_val) > 0 and len(start_val) == 0:
                    str_where = " `{col_name}` <= {bindkey_e} ".format(
                        col_name=self.get_col_name(),
                        bindkey_e=bindkey_e,
                    )
                    bindkeys.append(bindkey_e)
                    bindvalues.setdefault(bindkey_e, end_val)

            result.setdefault("bindkey", bindkeys)
            result.setdefault("bindvalue", bindvalues)
            result.setdefault("where", str_where)
        else:
            result.setdefault("bindkey", None)
            result.setdefault("bindvalue", None)
            result.setdefault("where", None)

        return result

    # バリデーション処理(カラムクラス毎) (バリデーションクラスで上書き)
    def check_basic_valid(self, val, option={}):
        """
            共通バリデーション処理実行(バリデーションクラスで上書き)
            ARGS:
                val:値
            RETRUN:
                ( True / False , メッセージ )
        """
        return True,