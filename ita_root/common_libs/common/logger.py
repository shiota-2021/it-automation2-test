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

"""
application logging module
"""

import logging
import logging.config
import yaml
import os


class AppLog:
    """
    application logging class
    """

    # logging namespace ex."stdAppLogger" or "fileAppLogger"
    __name__ = "stdAppLogger"

    # Instance of logging-Library（get from logging.getLogger）
    __logger_obj = None

    # logging dict-config
    _config = {}

    def __init__(self):
        """
        constructor
        """
        # is no-container-app or not(bool)
        isMyapp = True if os.getenv('IS_MYAPP') == "1" else False

        # read config.yml
        with open('logging.yml', 'r') as yml:
            dictConfig = yaml.safe_load(yml)

        self.__create_instance(isMyapp, dictConfig)

    def __create_instance(self, isMyapp, dictConfig={}):
        """
        create Instance of logging-Library and save it

        Arguments:
            isMyapp: (bool) True : no-container-app, False : container-app(Saas)
            dictConfig: (dict) logging dict-config
        Returns:
            
        """
        self.__name__ = "fileAppLogger" if isMyapp is True else "stdAppLogger"

        if isMyapp is False:  # container-app(Saas)
            del dictConfig['loggers']["fileAppLogger"]
            if "myfile" not in list(dictConfig['loggers']["stdAppLogger"]["handlers"]):
                del dictConfig['handlers']["myfile"]
        else:  # no-container-app
            del dictConfig['loggers']["stdAppLogger"]
            if "myfile" not in list(dictConfig['loggers']["fileAppLogger"]["handlers"]):
                del dictConfig['handlers']["myfile"]

        # set config
        self._config = dictConfig
        logging.config.dictConfig(self._config)
        # set instance
        self.__logger_obj = logging.getLogger(self.__name__)
        self.__logger_obj.debug("create AppLog instance [{}]".format(self.__name__))

    def set_user_setting(self, wsdb_instance):
        """
        set user-setting

        Arguments:
            wsdb_instance: class(DBConnectWs) instance
        """
        data_list = wsdb_instance.table_select('T_COMN_SYSTEM_CONFIG', 'WHERE `CONFIG_ID`=%s AND IFNULL(`CONFIG_ID`, 0)=0', ['LOG_LEVEL'])
        if len(data_list) == 1:
            log_level = data_list[0]['VALUE']
            self.setLevel(log_level)
            self.debug("LOG-LVEL:{} is set".format(log_level))

    def setLevel(self, level):
        """
        set user-setting log level

        Arguments:
            level: (str) "ERROR" | "INFO" | "DEBUG"
        """
        self.__logger_obj.setLevel(level)
        self._config['loggers'][self.__name__]['level'] = level

    def critical(self, message):
        """
        output critical log

        Arguments:
            message: message for output
        """
        self.__logger_obj.critical(self.env_message() + str(message))

    def exception(self, message):
        """
        output exception log

        Arguments:
            message: message for output
        """
        self.__logger_obj.exception(self.env_message() + str(message))

    def error(self, message):
        """
        output error log

        Arguments:
            message: message for output
        """
        self.__logger_obj.error(self.env_message() + str(message))

    def warning(self, message):
        """
        output warning log

        Arguments:
            message: message for output
        """
        self.__logger_obj.warning(self.env_message() + str(message))

    def info(self, message):
        """
        output info log

        Arguments:
            message: message for output
        """
        self.__logger_obj.info(self.env_message() + str(message))

    def debug(self, message):
        """
        output debug log

        Arguments:
            message: message for output
        """
        self.__logger_obj.debug(self.env_message() + str(message))

    def env_message(self):
        """
        make environ info message

        Arguments:
            msg: (str)
        """
        msg = ""
        organization_id = os.environ.get('ORGANIZATION_ID')
        if organization_id is None:
            return msg
        msg += "[ORGANIZATION_ID:{}]".format(organization_id)
        
        workspace_id = os.environ.get('WORKSPACE_ID')
        if workspace_id is None:
            return msg + " "
        msg += "[WORKSPACE_ID:{}]".format(workspace_id)

        return msg + " "