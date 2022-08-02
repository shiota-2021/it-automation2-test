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

import connexion
import six

from common_libs.common import *  # noqa: F403
from libs import execute_info
from common_libs.api import api_filter

@api_filter
def get_driver_execute_data(organization_id, workspace_id, menu, execution_no):  # noqa: E501
    """get_driver_execute_data

    Driver作業実行の状態取得 # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param execution_no: 実行No
    :type execution_no: str

    :rtype: InlineResponse20011
    """
    return 'do some magic!',


@api_filter
def get_driver_execute_info(organization_id, workspace_id, menu):  # noqa: E501
    """get_driver_execute_info

    Movement,Operationのメニューの基本情報および項目情報を取得する # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str

    :rtype: InlineResponse20018
    """
    return 'do some magic!',


@api_filter
def get_driver_execute_search_candidates(organization_id, workspace_id, menu, target, column):  # noqa: E501
    """get_driver_execute_search_candidates

    表示フィルタで利用するプルダウン検索の候補一覧を取得する # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param target: movement_list or operation_list
    :type target: str
    :param column: REST用項目名
    :type column: str

    :rtype: InlineResponse2003
    """
    return 'do some magic!',


@api_filter
def post_driver_cancel(organization_id, workspace_id, menu, execution_no):  # noqa: E501
    """post_driver_cancel

    Driver作業実行の予約取消 # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param execution_no: 実行No
    :type execution_no: str

    :rtype: InlineResponse20011
    """
    return 'do some magic!',


@api_filter
def post_driver_excecute(organization_id, workspace_id, menu, body=None):  # noqa: E501
    """post_driver_excecute

    Driver作業実行 # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param body: 
    :type body: dict | bytes

    :rtype: InlineResponse20017
    """
    if connexion.request.is_json:
        body = DriverExecuteBody.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!',


@api_filter
def post_driver_execute_check_parameter(organization_id, workspace_id, menu, body=None):  # noqa: E501
    """post_driver_execute_check_parameter

    Driver作業実行(実行時に使用するパラメータ確認) # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param body: 
    :type body: dict | bytes

    :rtype: InlineResponse20017
    """
    if connexion.request.is_json:
        body = DriverExecuteCheckParameterBody.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!',


@api_filter
def post_driver_execute_dry_run(organization_id, workspace_id, menu, body=None):  # noqa: E501
    """post_driver_execute_dry_run

    Driver作業実行（ドライラン）&lt;/br&gt; AnsibleDriverの場合はDryRun、TerraformDriverの場合はPlanのみの実行を行う  # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param body: 
    :type body: dict | bytes

    :rtype: InlineResponse20017
    """
    if connexion.request.is_json:
        body = DriverExecuteDryRunBody.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!',


@api_filter
def post_driver_execute_filter(organization_id, workspace_id, menu, target, body=None):  # noqa: E501
    """post_driver_execute_filter

    Movement,Operationを対象に、検索条件を指定し、レコードを取得する # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param target: movement_list or operation_list
    :type target: str
    :param body: 
    :type body: dict | bytes

    :rtype: InlineResponse2005
    """
    if connexion.request.is_json:
        body = FilterTargetBody1.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!',


@api_filter
def post_driver_execute_filter_count(organization_id, workspace_id, menu, target, body=None):  # noqa: E501
    """post_driver_execute_filter_count

    Movement,Operationを対象に、検索条件を指定し、レコードの件数する # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param target: movement_list or operation_list
    :type target: str
    :param body: 
    :type body: dict | bytes

    :rtype: InlineResponse2004
    """
    if connexion.request.is_json:
        body = CountTargetBody1.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!',


@api_filter
def post_driver_scram(organization_id, workspace_id, menu, execution_no):  # noqa: E501
    """post_driver_scram

    Driver作業実行の緊急停止 # noqa: E501

    :param organization_id: OrganizationID
    :type organization_id: str
    :param workspace_id: WorkspaceID
    :type workspace_id: str
    :param menu: メニュー名
    :type menu: str
    :param execution_no: 実行No
    :type execution_no: str

    :rtype: InlineResponse20011
    """
    return 'do some magic!',