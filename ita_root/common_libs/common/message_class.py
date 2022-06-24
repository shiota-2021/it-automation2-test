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
import os
import json
import glob


class MessageTemplate:
    """
    constructor

    Arguments:
        lang: 言語コード
    """
    def __init__(self):
        # set lang
        default_lang = 'en'
        self.set_lang(default_lang)
        
        # set messages dir
        if not os.getenv('ITA_MESSAGES_DIR'):
            self.path = '/exastro/messages'
        else:
            self.path = os.getenv('ITA_MESSAGES_DIR')
        
        # define variable
        self.messages = {}
        
        # read message files
        ret = self.__read_message_files()
        if ret is not True:
            # ####メモ：失敗時の動作を考える必要あり
            # ファイル読み込み失敗時の処理
            print(ret)

    """
    メッセージファイル格納ディレクトリ配下の.jsonファイルを全て読み込み、
    self.messages(dict)に保存する。

    Returns:
        boolean

    """
    def __read_message_files(self):
        try:
            message_files = glob.glob(self.path + '/*.json')
            for file in message_files:
                # read message file
                op_file = open(file, 'r', encoding="utf-8")
                file_json = json.load(op_file)
                
                # set messages in dict
                file_name = os.path.splitext(os.path.basename(file))[0]
                s_file_name = file_name.split('_')
                msg_lang = s_file_name[1].lower()
                self.messages[msg_lang] = file_json
            
            return True

        except Exception as e:
            return e

    """
    set language
    
    Arguments:
        lang: (str) "ja" | "en"
    """
    def set_lang(self, lang):
        self.lang = lang

    """
    引数に指定したメッセージIDのメッセージ文字列を返却する。

    Arguments:
        message_id (str): メッセージID。[機能識別文字]_[タイプ識別文字]_[ID] で構成。
        format_strings (list): list型でメッセージの{}に埋め込む文字列を指定する。複数ある場合は{}の左から順番に埋め込まれる。

    Returns:
        message (str): メッセージ文字列

    """
    def get_message(self, message_id, format_strings=[]):
        try:
            # ####メモ：現状、メッセージファイルはAPI返却値用の考慮しかない。
            #     　　　ログ用のメッセージファイルをどうするか決まったら改めて修正する必要がある。
            ret_msg = self.messages.get(self.lang, {}).get(message_id, {})
            
            if format_strings:
                ret_msg = ret_msg.format(*format_strings)
            
            if not ret_msg:
                ret_msg = "Message id is not found.(Called-ID[{}])".format(message_id)
            
            return ret_msg

        except Exception as e:
            return 'Message Error : {}'.format(e)