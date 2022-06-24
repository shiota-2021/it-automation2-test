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
database connection agnet class for organization-db on mariadb
"""

import pymysql.cursors  # https://pymysql.readthedocs.io/en/latable_name/
import os

from .dbconnect_common import DBConnectCommon


class DBConnectOrg(DBConnectCommon):
    """
    database connection agnet class for organization-db on mariadb
    """

    def __init__(self, organization_id=None):
        """
        constructor
        """
        if self._db_con is not None and self._db_con.open is True:
            return True

        if organization_id is None:
            organization_id = os.environ.get('ORGANIZATION_ID')
        self._organization_id = organization_id

        # decide database name, prefix+organization_id
        common_db = DBConnectCommon()
        self._db = common_db.get_orgdb_name(organization_id)

        # get db-connect-infomation from organization-db
        connect_info = common_db.get_orgdb_connect_info(self._db)
        if connect_info is False:
            msg = "Dabase Connect Error db_name={} : Database is not found".format(self._db)
            raise Exception(msg)

        self._host = connect_info['DB_HOST']
        self._port = int(connect_info['DB_PORT'])
        self._db_user = connect_info['DB_USER']
        self._db_passwd = connect_info['DB_PASSWORD']

        # connect database
        self.db_connect()

    def __del__(self):
        """
        destructor
        """
        self.db_disconnect()

    def get_wsdb_name(self, workspace_id):
        """
        get database name for workspace
        
        Arguments:
            workspace_id: workspace_id
        Returns:
            database name for workspace: str
        """

        return "WS_" + self._organization_id.upper() + "_" + workspace_id.upper()

    def get_wsdb_connect_info(self, db_name):
        """
        get database connect infomation for workspace
        
        Arguments:
            db_name: database name
        Returns:
            database connect infomation for workspace: dict
            or
            get failure: (bool)False
        """
        ws_db_name = os.environ.get("WSDB_DATADBASE")
        if ws_db_name is None or ws_db_name != db_name:
            data_list = self.table_select("T_COMN_WORKSPACE_DB_INFO", "WHERE `DB_DATADBASE`=%s and IFNULL(`DISUSE_FLAG`, 0)=0", [db_name])

            if len(data_list) == 0:
                return False

            return data_list[0]

        return {
            "DB_HOST": os.environ.get("WSDB_HOST"),
            "DB_PORT": os.environ.get("WSDB_PORT"),
            "DB_USER": os.environ.get("WSDB_USER"),
            "DB_PASSWORD": os.environ.get("WSDB_PASSWORD"),
            "DB_ROOT_PASSWORD": os.environ.get("WSDB_ROOT_PASSWORD"),
            "DB_DATADBASE": os.environ.get("WSDB_DATADBASE")
        }


class DBConnectOrgRoot(DBConnectOrg):
    """
    database connection agnet class for organization-db on mariadb
    """

    def __init__(self, organization_id=None):
        """
        constructor
        """
        if self._db_con is not None and self._db_con.open is True:
            return True

        if organization_id is None:
            organization_id = os.environ.get('ORGANIZATION_ID')
        self._organization_id = organization_id

        # decide database name, prefix+organization_id
        common_db = DBConnectCommon()
        self._db = common_db.get_orgdb_name(organization_id)

        # get db-connect-infomation from ita-common-db
        connect_info = common_db.get_orgdb_connect_info(self._db)
        if connect_info is False:
            msg = "Dabase Connect Error db_name={} : Database is not found".format(self._db)
            raise Exception(msg)

        self._host = connect_info['DB_HOST']
        self._port = int(connect_info['DB_PORT'])
        self._db_user = 'root'
        self._db_passwd = connect_info['DB_ROOT_PASSWORD']

        # connect database
        self.db_connect()

    def __del__(self):
        """
        destructor
        """
        self.db_disconnect()

    def db_connect(self):
        """
        connect database

        Returns:
            is success:(bool)
        """
        if self._db_con is not None and self._db_con.open is True:
            return True

        try:
            self._db_con = pymysql.connect(
                host=self._host,
                port=self._port,
                user=self._db_user,
                passwd=self._db_passwd,
                charset='utf8',
                cursorclass=pymysql.cursors.DictCursor
            )
        except pymysql.Error as e:
            msg = "Dabase Connect Error db_name={} : {}".format(self._db, e)
            raise Exception(msg)

        return True

    def database_create(self, db_name):
        """
        create database
        """
        self.database_drop(db_name)

        sql = "CREATE DATABASE `{}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci".format(db_name)
        self.sql_execute(sql)

    def database_drop(self, db_name):
        """
        drop database
        """
        sql = "DROP DATABASE IF EXISTS `{}`".format(db_name)
        self.sql_execute(sql)

    def user_create(self, user_name, user_password, db_name):
        """
        create user
        
        Arguments:
            user_name: user name
            user_password: user_password
            db_name: database name
        """
        self.user_drop(user_name)

        sql = "CREATE USER IF NOT EXISTS '{user_name}'@'%' IDENTIFIED BY '{user_password}'".format(user_name=user_name, user_password=user_password)
        self.sql_execute(sql)

        sql = "GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{user_name}'@'%' WITH GRANT OPTION".format(user_name=user_name, db_name=db_name)
        self.sql_execute(sql)

    def user_drop(self, user_name):
        """
        drop user
        """
        sql = "DROP USER IF EXISTS '{}'@'%'".format(user_name)
        self.sql_execute(sql)