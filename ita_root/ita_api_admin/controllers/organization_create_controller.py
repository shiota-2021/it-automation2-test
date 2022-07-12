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
"""
controller
organization_create
"""
# import connexion
from flask import g
import os
import shutil

from common_libs.api import api_filter
from common_libs.common.dbconnect import *  # noqa: F403
from common_libs.common.util import ky_encrypt


@api_filter
def organization_create(body, organization_id):  # noqa: E501
    """organization_create

    Organizationを作成する # noqa: E501

    :param body:
    :type body: dict | bytes
    :param organization_id: OrganizationID
    :type organization_id: str

    :rtype: InlineResponse200
    """
    g.ORGANIZATION_ID = organization_id

    common_db = DBConnectCommon()  # noqa: F405
    connect_info = common_db.get_orgdb_connect_info(organization_id)
    if connect_info:
        return '', "ALREADY EXISTS"

    # make storage directory for organization
    strage_path = os.environ.get('STORAGEPATH')
    organization_dir = strage_path + organization_id + "/"
    if not os.path.isdir(organization_dir):
        os.makedirs(organization_dir)
    else:
        return '', "ALREADY EXISTS"

    try:
        org_root_db = None

        user_name, user_password = common_db.userinfo_generate("ORG")
        org_db_name = user_name

        # register organization-db connect infomation
        data = {
            'ORGANIZATION_ID': organization_id,
            'DB_HOST': os.environ.get('DB_HOST'),
            'DB_PORT': int(os.environ.get('DB_PORT')),
            'DB_USER': user_name,
            'DB_PASSWORD': ky_encrypt(user_password),
            'DB_DATADBASE': org_db_name,
            'DB_ROOT_PASSWORD': ky_encrypt(os.environ.get('DB_ROOT_PASSWORD')),
            'DISUSE_FLAG': 0,
            'LAST_UPDATE_USER': g.get('USER_ID')
        }
        common_db.db_transaction_start()
        common_db.table_insert("T_COMN_ORGANIZATION_DB_INFO", data, "PRIMARY_KEY")

        g.db_connect_info = {}
        g.db_connect_info["ORGDB_HOST"] = data['DB_HOST']
        g.db_connect_info["ORGDB_PORT"] = str(data['DB_PORT'])
        g.db_connect_info["ORGDB_USER"] = data['DB_USER']
        g.db_connect_info["ORGDB_PASSWORD"] = data['DB_PASSWORD']
        g.db_connect_info["ORGDB_ROOT_PASSWORD"] = data['DB_ROOT_PASSWORD']
        g.db_connect_info["ORGDB_DATADBASE"] = data['DB_DATADBASE']
        org_root_db = DBConnectOrgRoot(organization_id)  # noqa: F405
        # create workspace-databse
        org_root_db.database_create(org_db_name)
        # create workspace-user and grant user privileges
        org_root_db.user_create(user_name, user_password, org_db_name)

        # connect organization-db
        org_db = DBConnectOrg(organization_id)  # noqa: F405
        # create table of organization-db
        org_db.sqlfile_execute("sql/organization.sql")

        common_db.db_commit()
    except Exception as e:
        shutil.rmtree(organization_dir)
        common_db.db_rollback()

        if org_root_db:
            org_root_db.database_drop(org_db_name)
            org_root_db.user_drop(user_name)

        raise Exception(e)

    return '',


@api_filter
def organization_delete(organization_id):  # noqa: E501
    """organization_delete

    Organizationを削除する # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str

    :rtype: InlineResponse200
    """
    # get organization_id
    g.ORGANIZATION_ID = organization_id

    common_db = DBConnectCommon()  # noqa: F405
    connect_info = common_db.get_orgdb_connect_info(organization_id)
    if connect_info is False:
        return '', "ALREADY DELETED"

    # delete storage directory for organization
    strage_path = os.environ.get('STORAGEPATH')
    organization_dir = strage_path + organization_id + "/"
    if os.path.isdir(organization_dir):
        shutil.rmtree(organization_dir)
    else:
        return '', "ALREADY DELETED"

    g.db_connect_info = {}
    g.db_connect_info["ORGDB_HOST"] = connect_info["DB_HOST"]
    g.db_connect_info["ORGDB_PORT"] = str(connect_info["DB_PORT"])
    g.db_connect_info["ORGDB_USER"] = connect_info["DB_USER"]
    g.db_connect_info["ORGDB_PASSWORD"] = connect_info["DB_PASSWORD"]
    g.db_connect_info["ORGDB_ROOT_PASSWORD"] = connect_info["DB_ROOT_PASSWORD"]
    g.db_connect_info["ORGDB_DATADBASE"] = connect_info["DB_DATADBASE"]

    # get ws-db connect infomation
    org_db = DBConnectOrg(organization_id)  # noqa: F405
    workspace_data_list = org_db.table_select("T_COMN_WORKSPACE_DB_INFO", "WHERE `DISUSE_FLAG`=0")

    org_root_db = DBConnectOrgRoot(organization_id)  # noqa: F405
    for workspace_data in workspace_data_list:
        # drop ws-db and ws-db-user
        org_root_db.database_drop(workspace_data['DB_DATADBASE'])
        org_root_db.user_drop(workspace_data['DB_USER'])

        # disuse ws-db connect infomation
        data = {
            'PRIMARY_KEY': workspace_data['PRIMARY_KEY'],
            'DISUSE_FLAG': 1
        }
        org_db.db_transaction_start()
        org_db.table_update("T_COMN_WORKSPACE_DB_INFO", data, "PRIMARY_KEY")
        org_db.db_commit()
    org_db.db_disconnect()

    # drop org-db and org-db-user
    org_root_db.database_drop(connect_info['DB_DATADBASE'])
    org_root_db.user_drop(connect_info['DB_USER'])
    org_root_db.db_disconnect()

    # disuse org-db connect infomation
    data = {
        'PRIMARY_KEY': connect_info['PRIMARY_KEY'],
        'DISUSE_FLAG': 1
    }
    common_db.db_transaction_start()
    common_db.table_update("T_COMN_ORGANIZATION_DB_INFO", data, "PRIMARY_KEY")
    common_db.db_commit()

    return '',
