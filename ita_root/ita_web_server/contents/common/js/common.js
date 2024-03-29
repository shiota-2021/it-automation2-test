////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   Exastro IT Automation / common.js
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

/*
##################################################
   Common funcitions
##################################################
*/
const fn = ( function() {
    'use strict';
    
    // インスタンス管理用
    const modalInstance = {},
          operationInstance = {},
          conductorInstance = {};
    
    // Contentローディングフラグ
    let contentLoadingFlag = false;

    // windowオブジェクトがあるかどうか
    const windowCheck = function() {
        try {
            window;
            return true;
        } catch( e ) {
            return false;
        }
    };
    const windowFlag = windowCheck();
    
    // iframeフラグ
    const iframeFlag = windowFlag? ( window.parent !== window ): false;
    
    const organization_id = ( windowFlag )? CommonAuth.getRealm(): null,
          workspace_id =  ( windowFlag )? window.location.pathname.split('/')[3]: null;
    
    const typeofValue = function( value ) {
        return Object.prototype.toString.call( value ).slice( 8, -1 ).toLowerCase();
    };
    
    const classNameCheck = function( className, type ) {
        if ( fn.typeof( className ) === 'array') {
            className = className.concat([ type ]);
        } else {
            className = [ className, type ];
        }
        return className;
    };
    
    const bindAttrs = function( attrs ) {
        const attr = [];
        
        for ( const key in attrs ) {
            if ( attrs[key] !== undefined ) {
                const attrName = ['checked', 'disabled', 'title', 'placeholder', 'style', 'class']; // dataをつけない
                if ( attrName.indexOf( key ) !== -1) {
                    attr.push(`${key}="${attrs[key]}"`);
                } else {
                    attr.push(`data-${key}="${attrs[key]}"`);
                }
            }
        }
        return attr;
    };
    
    const inputCommon = function( value, name, attrs, id ) {
        const attr = bindAttrs( attrs );
        
        if ( value !== undefined && value !== null ) {
            attr.push(`value="${value}"`);
        }
        
        if ( name ) {
            if ( id ) {
                attr.push(`id="${id}"`);
            } else {
                attr.push(`id="${name}"`);
            }
            attr.push(`name="${name}"`);
        }
        
        return attr;
    };

const cmn = {
/*
##################################################
   共通パラメーター
##################################################
*/
getCommonParams: function() {
    return Object.assign( {}, commonParams );
},
/*
##################################################
   script, styleの読み込み
##################################################
*/
loadAssets: function( assets ){
    const f = function( type, url ){
        return new Promise(function( resolve, reject ){
            type = ( type === 'css')? 'link': 'script';
            
            const body = document.body,
                  asset = document.createElement( type );
            
            switch ( type ) {
                case 'script':
                    asset.src = url;
                break;
                case 'link':
                    asset.href = url;
                    asset.rel = 'stylesheet';
                break;
            }            
            
            body.appendChild( asset );
            
            asset.onload = function() {
                resolve();
            };
            
            asset.onerror = function( e ) {
                reject( e )
            };
        });
    };
    if ( typeofValue( assets ) === 'array') {
        return Promise.all(
            assets.map(function( asset ){
                return f( asset.type, asset.url );
            })
        );
    }
},
/*
##################################################
   ワークスペース切替用URL
##################################################
*/
getWorkspaceChangeUrl: function( changeId ) {
    return `/${organization_id}/workspaces/${changeId}/ita/`;
},
/*
##################################################
   REST API用のURLを返す
##################################################
*/
getRestApiUrl: function( url, orgId = organization_id, wsId = workspace_id ) {
    return `/api/${orgId}/workspaces/${wsId}/ita${url}`;
},
/*
##################################################
   データ読み込み
##################################################
*/
fetch: function( url, token, method = 'GET', json ) {
    
    if ( !token ) {
        token = CommonAuth.getToken();
        console.group('Token( CommonAuth.getToken() )');
        console.log( cmn.date( new Date(), 'yyyy/MM/dd HH:mm:ss.SSS') );
        console.log( token );
        console.groupEnd('Token( CommonAuth.getToken() )');
    }
    
    let errorCount = 0;
    
    const f = function( u ){
        return new Promise(function( resolve, reject ){
            
            if ( windowFlag ) u = cmn.getRestApiUrl( u );
            
            const init = {
                method: method,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
            };
            
            if ( ( method === 'POST' || method === 'PATCH' ) && json !== undefined ) {
                console.group( method );
                console.log( json )
                console.groupEnd( method );
            
                try {
                    init.body = JSON.stringify( json );
                } catch ( e ) {
                    reject( e );
                }
            }
            
            console.group('Fetch');
            console.log( u );
            console.log( init );
            console.groupEnd('Fetch');
            
            fetch( u, init ).then(function( response ){
                if ( errorCount === 0 ) {
                
                    console.group('Fetch response');
                    console.log( response );
                    
                    if( response.ok ) {
                        //200の場合
                        response.json().then(function( result ){
                            console.log( result );
                            console.groupEnd('Fetch response');
                            
                            resolve( result.data );
                        });
                    } else {
                        errorCount++;
                        if( response.status === 499 ) {
                            //バリデーションエラーは呼び出し元に返す
                             response.json().then(function( result ){
                                console.log( result );
                                console.groupEnd('Fetch response');
                                
                                reject( result );
                            }).catch(function( e ) {
                                cmn.systemErrorAlert();
                            }); 
                        } else if ( response.status === 401 ){
                            //権限無しの場合、トップページに戻す
                            response.json().then(function( result ){
                                console.log( result );
                                console.groupEnd('Fetch response');
                                
                                if ( !iframeFlag ) {
                                    alert(result.message);
                                    location.replace('/' + organization_id + '/workspaces/' + workspace_id + '/ita/');
                                } else {
                                    cmn.iframeMessage( result.message );
                                }
                            }).catch(function( e ) {
                                cmn.systemErrorAlert();
                            });
                        } else {
                            //その他のエラー
                            cmn.systemErrorAlert();
                        }
                    }
                }
            }).catch(function( error ){
                if ( errorCount === 0 ) {
                    reject( error );
                }
            });
        });
    };
    if ( typeofValue( url ) === 'array') {
        return Promise.all(
            url.map(function( u ){
                return f( u );
            })
        );
    } else if ( typeofValue( url ) === 'string') {
        return f( url );
    }
},
/*
##################################################
   システムエラーAleat
##################################################
*/
systemErrorAlert: function() {
    if ( windowFlag ) {
        cmn.gotoErrPage( WD.COMMON.sys_err );
    } else {
        window.console.error( WD.COMMON.sys_err );
        throw new Error( WD.COMMON.sys_err );
    }
},
/*
##################################################
   編集フラグ
##################################################
*/
editFlag: function( menuInfo ) {
    const flag  = {};
    flag.initFilter = ( menuInfo.initial_filter_flg === '1')? true: false;
    flag.autoFilter = ( menuInfo.auto_filter_flg === '1')? true: false;
    flag.history = ( menuInfo.history_table_flag === '1')? true: false;
    
    flag.insert = ( menuInfo.row_insert_flag === '1')? true: false;
    flag.update = ( menuInfo.row_update_flag === '1')? true: false;
    flag.disuse = ( menuInfo.row_disuse_flag === '1')? true: false;
    flag.reuse = ( menuInfo.row_reuse_flag === '1')? true: false;
    flag.edit = ( menuInfo.row_insert_flag === '1' && menuInfo.row_update_flag === '1')? true: false;
    
    return flag;
},
/*
##################################################
   0埋め
##################################################
*/
zeroPadding: function( num, digit ){
    let zeroPaddingNumber = '0';
    for ( let i = 1; i < digit; i++ ) {
      zeroPaddingNumber += '0';
    }
    zeroPaddingNumber += String( num );
    return zeroPaddingNumber.slice( -digit );
},
/*
##################################################
   空値チェック
##################################################
*/
cv: function( value, subValue, escape ){
    const type = typeofValue( value );
    if ( type === 'undefined' || type === 'null') value = subValue;
    if ( value && escape ) value = cmn.escape( value );

    return value;
},
/*
##################################################
   エスケープ
##################################################
*/
escape: function( value, br, space ) {
    br = ( br === undefined )? false: true;
    space = ( space === undefined )? false: true;
    const entities = [
        ['&', 'amp'],
        ['\"', 'quot'],
        ['\'', 'apos'],
        ['<', 'lt'],
        ['>', 'gt'],
        /*['\\(', '#040'],['\\)', '#041'],['\\[', '#091'],['\\]', '#093']*/
    ];
    const type = typeofValue( value );

    if ( value !== undefined && value !== null && type === 'string') {
        for ( var i = 0; i < entities.length; i++ ) {
            value = value.replace( new RegExp( entities[i][0], 'g'), `&${entities[i][1]};`);
        }
        value = value.replace( new RegExp(/\\/, 'g'), `&#092;`);
        if ( br ) value = value.replace(/\r?\n/g, '<br>');
        if ( space ) value = value.replace(/^\s+|\s+$/g, '');
    } else if ( type !== 'number') {
        value = '';
    }
    return value;
},
/*
##################################################
   正規表現文字列エスケープ
##################################################
*/
regexpEscape: function( value ) {
    return value.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
},
/*
##################################################
   対象が存在するか
##################################################
*/
exists: function( name ) {
    if ( name.match(/^\./) ) {
        return ( document.getElementsByClassName( name.replace(/^./, '') ) !== null )? true: false;
    } else if ( name.match(/^#/) ) {
        return ( document.getElementById( name.replace(/^#/, '') ) !== null )? true: false;
    } else {
        return ( document.getElementsByTagName( name ) !== null )? true: false;
    }
},
/*
##################################################
   型名
##################################################
*/
typeof: typeofValue,
/*
##################################################
   間引き処理 Throttle
##################################################
*/
throttle: function( func, interval ) {
    let lastTime = Date.now() - interval;
    return function() {
        const now = Date.now();
        if (( lastTime + interval ) < now ) {
            lastTime = now;
            func();
        }
    }
},
/*
##################################################
   間引き処理 Debounce
##################################################
*/
debounce: function( func, interval ) {
    let timer;
    return function() {
        clearTimeout( timer );
        timer = setTimeout( function() {
            func();
        }, interval );
    }
},
/*
##################################################
   選択解除
##################################################
*/
deselection: function() {
    if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }
},
/*
##################################################
   日付フォーマット
##################################################
*/
date: function( date, format ) {
    if ( date ) {
        const d = new Date(date);
        
        format = format.replace(/yyyy/g, d.getFullYear());
        format = format.replace(/MM/g, ('0' + (d.getMonth() + 1)).slice(-2));
        format = format.replace(/dd/g, ('0' + d.getDate()).slice(-2));
        format = format.replace(/HH/g, ('0' + d.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + d.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + d.getSeconds()).slice(-2));
        format = format.replace(/SSS/g, ('00' + d.getMilliseconds()).slice(-3));
        return format;
    } else {
        return '';
    }
},
/*
##################################################
   URLパス
##################################################
*/
getPathname: function(){
    return ( new URL( document.location ) ).pathname;
},
/*
/*
##################################################
   URLパラメータ
##################################################
*/
getParams: function() {
    const searchParams = ( new URL( document.location ) ).searchParams.entries(),
          params = {};
    for ( const [ key, val ] of searchParams ) {
        params[ key ] = val;
    }
    return params;
},
/*
##################################################
   クリップボード
##################################################
*/
clipboard: {
    set: function( text ) {
        if ( navigator && navigator.clipboard ) {
            return navigator.clipboard.writeText( text );
        }
    }
},
/*
##################################################
   ダウンロード
##################################################
*/
download: function( type, data, fileName = 'noname') {
    
    let url;
    
    // URL形式に変換
    try {
        switch ( type ) {
        
            // エクセル
            case 'excel': {
                // BASE64 > Binary > Unicode変換
                const binary = window.atob( data ),
                      decode = new Uint8Array( Array.prototype.map.call( binary, function( c ){ return c.charCodeAt(); }));
                
                const blob = new Blob([ decode ], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                fileName += '.xlsx';
                url = URL.createObjectURL( blob );
            } break;
            
            // テキスト
            case 'text': {
                const blob = new Blob([ data ], {'type': 'text/plain'});
                fileName += '.txt';
                url = URL.createObjectURL( blob );
            } break;
            
            // JSON
            case 'json': {
                const blob = new Blob([ JSON.stringify( data, null, '\t') ], {'type': 'application/json'});
                fileName += '.json';
                url = URL.createObjectURL( blob );
            } break;
            
            // BASE64
            case 'base64': {
                url = 'data:;base64,' + data;
            } break;
                
        }
    } catch ( e ) {
        window.console.error( e );
    }
    
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    a.click();
    
    if ( type !== 'base64') URL.revokeObjectURL( url );

},
/*
##################################################
   ファイルを選択
##################################################
*/
fileSelect: function( type = 'base64', limitFileSize, accept ){
    return new Promise( function( resolve, reject ) {
        const file = document.createElement('input');
        let cancelFlag = true;
        
        file.type = 'file'; 
        if ( accept !== undefined ) file.accept = accept;
        
        file.addEventListener('change', function(){
            const file = this.files[0],
                  reader = new FileReader();
            
            cancelFlag = false;

            if ( limitFileSize && file.size >= limitFileSize ) {
                reject('File size limit over.');
            }
            
            if ( type === 'base64') {
                reader.readAsDataURL( file );

                reader.onload = function(){
                    resolve({
                        base64: reader.result.replace(/^data:.*\/.*;base64,|^data:$/, ''),
                        name: file.name,
                        size: file.size
                    });
                };

                reader.onerror = function(){
                    reject( reader.error );
                };
            } else if ( type === 'file') {
                const formData = new FormData();
                formData.append('file', file );
                resolve( formData );
            } else if ( type === 'json') {
                reader.readAsText( file );
                
                reader.onload = function(){
                    try {
                        const json = JSON.parse( reader.result );
                        resolve({
                            json: json,
                            name: file.name,
                            size: file.size
                        });
                    } catch( e ) {
                        reject('JSONの形式が正しくありません。');
                    }                    
                };

                reader.onerror = function(){
                    reject( reader.error );
                };                
            }
        });

        file.click();
        
        // bodyフォーカスでダイアログを閉じたか判定
        document.body.onfocus = function(){
            setTimeout( function(){
                if ( cancelFlag ) reject('cancel');
                document.body.onfocus = null;
            }, 1000 );
        };
    });
},
/*
##################################################
   Disabled timer
##################################################
*/
disabledTimer: function( $element, flag, time ) {
    if ( time !== 0 ) {
        setTimeout( function(){
            $element.prop('disabled', flag );
        }, time );
    } else {
        $element.prop('disabled', flag );
    }
},
/*
##################################################
   Web storage
##################################################
*/
storage: {
    check: function( type ) {
        const storage = ( type === 'local')? localStorage:
                        ( type === 'session')? sessionStorage:
                        undefined;
        try {
            const storage = window[type],
            x = '__storage_test__';
            storage.setItem( x, x );
            storage.removeItem( x );
            return true;
        }
        catch( e ) {
            return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
        }    
    },
    'set': function( key, value, type ) {
        if ( type === undefined ) type = 'local';
        const storage = ( type === 'local')? localStorage: ( type === 'session')? sessionStorage: undefined;
        if ( storage !== undefined ) {
            try {
                storage.setItem( key, JSON.stringify( value ) );
            } catch( e ) {
                window.console.error('Web storage error: setItem( ' + key + ' ) / ' + e.message );
                storage.removeItem( key );
            }
        } else {
            return false;
        }
    },
    'get': function( key, type ) {
        if ( type === undefined ) type = 'local';
        const storage = ( type === 'local')? localStorage: ( type === 'session')? sessionStorage: undefined;
        if ( storage !== undefined ) {
            if ( storage.getItem( key ) !== null  ) {
                return JSON.parse( storage.getItem( key ) );
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    'remove': function( key, type ) {
        if ( type === undefined ) type = 'local';
        const storage = ( type === 'local')? localStorage: ( type === 'session')? sessionStorage: undefined;
        if ( storage !== undefined ) {
            storage.removeItem( key )
        } else {
            return false;
        }
    },
    getKeys: function( type ) {
        if ( type === undefined ) type = 'local';
        const storage = ( type === 'local')? localStorage: ( type === 'session')? sessionStorage: undefined,
              l = storage.length,
              keys = [];
        for ( let i = 0; i < l; i++ ) {
            keys.push( storage.key(i) );
        }
        return keys;
    }
},
/*
##################################################
   Alert, Confirm
##################################################
*/
alert: function( title, elements, type = 'alert', buttons = { ok: { text: '閉じる', action: 'normal'}} ) {
    return new Promise(function( resolve ){
        const funcs = {};
        
        funcs.ok = function(){
            dialog.close();
            dialog = null;
            resolve( true );
        };
        if ( type === 'confirm') {
            funcs.cancel = function(){
                dialog.close();
                dialog = null;
                resolve( false );
            };
        }
        const config = {
            mode: 'modeless',
            position: 'center',
            header: {
                title: title,
                close: false,
                move: false
            },
            footer: {
                button: buttons
            }
        };
        let dialog = new Dialog( config, funcs );
        dialog.open(`<div class="alertMessage">${elements}</div>`);
    });
},
/*
##################################################
   Calendar
##################################################
*/
calendar: function( setDate, currentDate, startDate, endDate ){
    const weekText = ['日','月','火','水','木','金','土'],
          weekClass = ['sun','mon','tue','wed','thu','fri','sat'];
    
    if ( startDate ) startDate = fn.date( startDate, 'yyyy/MM/dd');
    if ( endDate ) endDate = fn.date( endDate, 'yyyy/MM/dd');
    
    // 今月
    const date = ( setDate )? new Date( setDate ): new Date(),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          end = new Date( year, month, 0 ).getDate();

    // 先月
    const lastMonthEndDate = new Date( year, month - 1 , 0 ),
          lastMonthYear = lastMonthEndDate.getFullYear(),
          lastMonth = lastMonthEndDate.getMonth() + 1,
          lastMonthEndDay = lastMonthEndDate.getDay(),
          lastMonthChangeNum = 7 + lastMonthEndDay,
          lastMonthStart = new Date( year, month - 1 , -lastMonthChangeNum ).getDate();

    // 来月
    const nextMonthDate = new Date( year, month + 1, 0 ),
          nextMonthYear = nextMonthDate.getFullYear(),
          nextMonth = nextMonthDate.getMonth() + 1;
    
    if ( currentDate ) currentDate = fn.date( currentDate, 'yyyy/MM/dd');    
    
    // HTML
    const thead = function() {
        const th = [],
              l = weekText.length;
        for ( let i = 0; i < l; i++ ) {
            th.push(`<th class="calTh ${weekClass[i]}">${weekText[i]}</th>`)
        }
        return `<tr class="calRow">${th.join('')}</tr>`;
    };
    const cell = function( num, className, dataDate ) {
        return `<td class="${className}"><span class="calTdInner"><button class="calButton" data-date="${dataDate}">${num}</butto></span></td>`;
    };
    const disabledCell = function( num, className ) {
        return `<td class="${className} disabled"><span class="calTdInner"><button class="calButton calButtonDisabled" disabled>${num}</button></span></td>`;
    };

    const rowHtml = [];
    let count = 0;
    for ( let w = 0; w < 7; w++ ) {
        const cellHtml = [];
        for ( let d = 0; d < 7; d++ ) {
            let num, dataDate, className = 'calTd ' + weekClass[d];
            if ( lastMonthChangeNum >= count ) {
                // 先月
                num = lastMonthStart + count++;
                className += ' lastMonth';
                dataDate = `${lastMonthYear}/${cmn.zeroPadding( lastMonth, 2 )}/`;
            } else if ( count - lastMonthChangeNum > end ) {
                // 来月
                className += ' nextMonth';
                num = count++ - end - lastMonthChangeNum;
                dataDate = `${nextMonthYear}/${cmn.zeroPadding( nextMonth, 2 )}/`;
            } else {
                // 今月
                num = count++ - lastMonthChangeNum;
                dataDate = `${year}/${cmn.zeroPadding( month, 2 )}/`;
            }
            const cellDate = dataDate + cmn.zeroPadding( num, 2 );
                        
            if ( currentDate ) {
                if ( currentDate === cellDate ) className += ' currentCell';
                if ( ( startDate === cellDate ) || ( endDate && currentDate === cellDate ) ) className += ' startCell';
                if ( ( endDate === cellDate ) || ( startDate && currentDate === cellDate ) ) className += ' endCell';
                if ( ( startDate && startDate < cellDate && currentDate > cellDate )
                    || ( endDate && endDate > cellDate && currentDate < cellDate )  ) className += ' periodCell';
            }
            
            if ( ( startDate && startDate > cellDate ) || ( endDate && endDate < cellDate ) ) {
                cellHtml.push( disabledCell( num, className ) );
            } else {
                cellHtml.push( cell( num, className, cellDate ) );
            }
        }
        rowHtml.push(`<tr class="calRow">${cellHtml.join('')}</tr>`);
    }

    return `<table class="calTable">`
        + `<thead class="calThead">`
            + thead()
        + `</thead>`
        + `<tbody class="calTbody">`
            + rowHtml.join('')
        + `</tbody>`
    + `</table>`;
},
/*
##################################################
   Date picker
##################################################
*/
datePicker: function( timeFlag, className, date, start, end ) {
    const monthText = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    
    let initDate;
    if ( date && !isNaN( new Date( date ) ) ) {
        initDate = new Date( date )
    } else {
        initDate = new Date();
    }
    
    let monthCount = 0;
    
    let inputDate;
    
    let year = initDate.getFullYear(),
        month = initDate.getMonth(),
        day = initDate.getDate();
    
    let hour, min , sec;
    
    if ( date ) {
        hour = initDate.getHours(),
        min = initDate.getMinutes(),
        sec = initDate.getSeconds();
    } else if ( className === 'datePickerToDateText') {
        hour = 23;
        min = sec = 59;
    } else {
        hour = min = sec = 0;
    }
    
    let placeholder = 'yyyy/MM/dd';
    if ( timeFlag ) {
        if ( timeFlag === 'hm') {
            placeholder += ' HH:mm';
        } else if  ( timeFlag === 'h') {
            placeholder += ' HH';
        } else {
            placeholder += ' HH:mm:ss';
        }
    }
    
    if ( className === 'datePickerFromDateText' && !end ) {
        end = date;
        placeholder = 'From : ' + placeholder;
    }
    if ( className === 'datePickerToDateText' && !start ) {
        start = date;
        placeholder = 'To : ' + placeholder;
    }
    
    const $datePicker = $('<div/>', {
        'class': 'datePickerBlock'
    }).html(`
    <div class="datePickerDate">
        <input type="text" class="datePickerDateInput ${className}" tabindex="-1" placeholder="${placeholder}" readonly>
        <input type="hidden" class="datePickerDateHidden datePickerDateStart">
        <input type="hidden" class="datePickerDateHidden datePickerDateEnd">
    </div>
    <div class="datePickerSelectDate">
        <div class="datePickerYear">
            <div class="datePickerYearPrev"><button class="datePickerButton" data-type="prevYear"><span class="icon icon-prev"></span></button></div>
            <div class="datePickerYearText">${year}</div>
            <div class="datePickerYearNext"><button class="datePickerButton" data-type="nextYear"><span class="icon icon-next"></span></button></div>
        </div>
        <div class="datePickerMonth">
            <div class="datePickerMonthPrev"><button class="datePickerButton" data-type="prevMonth"><span class="icon icon-prev"></span></button></div>
            <div class="datePickerMonthText">${monthText[month]}</div>
            <div class="datePickerMonthNext"><button class="datePickerButton" data-type="nextMonth"><span class="icon icon-next"></span></button></div>
        </div>
    </div>
    <div class="datePickerCalendar">
        ${cmn.calendar( initDate, date, start, end )}
    </div>`);
    
    const setInputDate = function( changeFlag = true ) {
        inputDate = `${year}/${fn.zeroPadding( month + 1, 2 )}/${fn.zeroPadding( day, 2 )}`;
        if ( timeFlag ) {
            let timeValue;
            if ( timeFlag === 'hm') {
                timeValue = `${inputDate} ${fn.zeroPadding( hour, 2 )}:${fn.zeroPadding( min, 2 )}`;
            } else if  ( timeFlag === 'h') {
                timeValue = `${inputDate} ${fn.zeroPadding( hour, 2 )}`;
            } else {
                timeValue = `${inputDate} ${fn.zeroPadding( hour, 2 )}:${fn.zeroPadding( min, 2 )}:${fn.zeroPadding( sec, 2 )}`;
            }
            $date.val( timeValue );
        } else {
            $date.val( inputDate );
        }
        if ( changeFlag ) $date.change();
    };
    
    const $date = $datePicker.find('.datePickerDateInput'),
          $year = $datePicker.find('.datePickerYearText'),
          $month = $datePicker.find('.datePickerMonthText'),
          $cal = $datePicker.find('.datePickerCalendar');
    
    if ( date ) setInputDate( false );
    
    $datePicker.find('.datePickerButton').on('click', function(){
        const $button = $( this ),
              type = $button.attr('data-type');
        
        switch ( type ) {
            case 'prevYear': monthCount -= 12; break;
            case 'nextYear': monthCount += 12; break;
            case 'prevMonth': monthCount -= 1; break;
            case 'nextMonth': monthCount += 1; break;
        }
        const newData = new Date( initDate.getFullYear(), initDate.getMonth() + monthCount, 1 );
        
        year = newData.getFullYear();
        month = newData.getMonth();
        
        $year.text( year );
        $month.text( monthText[month] );
                
        $cal.html( cmn.calendar( newData, inputDate, start, end ) );
    });
    
    $datePicker.on('click', '.calButton', function(){
        const $button = $( this ),
              ckickDate = $button.attr('data-date').split('/');
              
        year = ckickDate[0];
        month = Number( ckickDate[1] ) - 1;
        day = ckickDate[2];
        
        $year.text( year );
        $month.text( monthText[month] );
        
        setInputDate();
        $cal.html( cmn.calendar( inputDate, inputDate, start, end ) );
    });
    
    // FromTo用:片方のカレンダーの設定が変わった場合
    $datePicker.find('.datePickerDateHidden').on('change', function(){
        const $hidden = $( this ),
              value = $hidden.val();
              
        if ( $hidden.is('.datePickerDateStart') ) {
            start = value;
        } else {
            end = value;
        }
        
        const setDate = `${year}/${month+1}/1`;
        
        $cal.html( cmn.calendar( setDate, inputDate, start, end ) );
    });
    
    // 時間
    if ( timeFlag ) {
        const datePickerTime = [`<div class="datePickerHour">${cmn.html.inputFader('datePickerHourInput', hour, null, { min: 0, max: 23 }, { after: '時'} )}</div>`];
        if ( timeFlag === 'true' || timeFlag === true || timeFlag === 'hms' || timeFlag === 'hm') {
            datePickerTime.push(`<div class="datePickerMin">${cmn.html.inputFader('datePickerMinInput', min, null, { min: 0, max: 59 }, { after: '分'} )}</div>`);
        }
        if ( timeFlag === 'true' || timeFlag === true || timeFlag === 'hms') {
            datePickerTime.push(`<div class="datePickerSec">${cmn.html.inputFader('datePickerSecInput', sec, null, { min: 0, max: 59 }, { after: '秒'} )}</div>`);
        }
        
        $datePicker.append(`
        <div class="datePickerTime">
            ${datePickerTime.join('')}            
        </div>`);
        
        $datePicker.find('.inputFaderWrap').each(function(){
            cmn.faderEvent( $( this ) );
        });
        
        $datePicker.find('.inputFader').on('change', function(){
            const $input = $( this ),
                  value = $input.val();
            if ( $input.is('.datePickerHourInput') ) {
                hour = value;
            } else if ( $input.is('.datePickerMinInput') ) {
                min = value;
            } else {
                sec = value;
            }
            setInputDate( false );
        });
    }
    
    $datePicker.append(`<div class="datePickerMenu">
        <ul class="datePickerMenuList">
            <li class="datePickerMenuItem">${fn.html.button('現在', ['datePickerMenuButton', 'itaButton'], { type: 'current', action: 'normal', style: 'width:100%'})}</li>
            <li class="datePickerMenuItem">${fn.html.button('クリア', ['datePickerMenuButton', 'itaButton'], { type: 'clear', action: 'normal', style: 'width:100%'})}</li>
        </ul>
    </div>`);
    
    const nowCalender = function( clearFlag ) {
        const now = new Date();
        
        const $h = $datePicker.find('.datePickerHourInput'),
              $m = $datePicker.find('.datePickerMinInput'),
              $s = $datePicker.find('.datePickerSecInput');
        
        year = now.getFullYear();
        month = now.getMonth();
        day =  now.getDate();
        
        $year.text( year );
        $month.text( monthText[month] );
        
        if ( clearFlag ) {
            inputDate = null;
            $date.val('').change();
            $cal.html( cmn.calendar( now ) );
            
            if ( timeFlag ) {
                if ( className === 'datePickerToDateText') {
                    hour = 23;
                    min = 59;
                    sec = 59;
                } else {
                    hour = min = sec = 0;
                }
            }
        } else {
            if ( timeFlag ) {
                hour = now.getHours();
                min = now.getMinutes();
                sec = now.getSeconds();
            }
            setInputDate();
            $cal.html( cmn.calendar( inputDate, inputDate, start, end ) );
        }
        
        if ( timeFlag ) {
            $h.val( hour ).trigger('input');
            $m.val( min ).trigger('input');
            $s.val( sec ).trigger('input');
        }
    };
    
    $datePicker.find('.datePickerMenuButton').on('click', function(){
        const $button = $( this ),
              type = $button.attr('data-type');
        switch ( type ) {
            case 'current':
                nowCalender( false );
            break;
            case 'clear':
                nowCalender( true );
            break;
        }
    });
    
    return $datePicker;
},
/*
##################################################
   Date picker dialog
##################################################
*/
datePickerDialog: function( type, timeFlag, title, date ){
    return new Promise(function( resolve ){
        const funcs = {
            ok: function() {
                const result = {};
                
                if ( type === 'fromTo') {
                    result.from = $dataPicker.find('.datePickerFromDateText').val();
                    result.to = $dataPicker.find('.datePickerToDateText').val();
                } else {
                    result.date = $dataPicker.find('.datePickerDateText').val();
                }

                dialog.close().then(function(){
                    resolve( result );
                    dialog = null;
                });
            },
            cancel: function() {
                dialog.close().then(function(){
                    resolve('cancel');
                    dialog = null;
                });
            }
        };
        
        const buttons = {
            ok: { text: '反映', action: 'default', style: 'width:160px;'},
            cancel: { text: 'キャンセル', action: 'normal'}
        };
        
        const config = {
            mode: 'modeless',
            position: 'center',
            width: 'auto',
            header: {
                title: title,
                close: false,
                move: false
            },
            footer: {
                button: buttons
            }
        };
        
        let dialog = new Dialog( config, funcs );
        
        // Data picker
        const $dataPicker = $('<div/>', {
            'class': 'datePickerContainer'
        });
            
        if ( type === 'fromTo') {
            $dataPicker.addClass('datePickerFromToContainer').html(`<div class="datePickerFrom"></div>`
            + `<div class="datePickerTo"></div>`);

            $dataPicker.find('.datePickerFrom').html( cmn.datePicker( timeFlag, 'datePickerFromDateText', date.from, null, date.to ) );
            $dataPicker.find('.datePickerTo').html( cmn.datePicker( timeFlag, 'datePickerToDateText', date.to, date.from, null ) );
            
            // FromTo相互で日付の入力をチェックする
            $dataPicker.find('.datePickerFromDateText').on('change', function(){
                const val = $( this ).val();
                $dataPicker.find('.datePickerTo').find('.datePickerDateStart').val( val ).change();
            });
            $dataPicker.find('.datePickerToDateText').on('change', function(){
                const val = $( this ).val();
                $dataPicker.find('.datePickerFrom').find('.datePickerDateEnd').val( val ).change();
            });
            
        } else {
            $dataPicker.html( cmn.datePicker( timeFlag, 'datePickerDateText', date ) );
        }
        
        dialog.open( $dataPicker );
    });
},
/*
##################################################
   Date picker Event
##################################################
*/
setDatePickerEvent: function( $target, title ) {
    const $container = $target.closest('.inputDateContainer'),
          $button = $container.find('.inputDateCalendarButton'),
          timeFlag = $button.attr('data-timeflag');
    
    $button.on('click', function(){
        const value = $target.val();
        fn.datePickerDialog('date', timeFlag, title, value ).then(function( result ){
            if ( result !== 'cancel') {
                $target.val( result.date ).change().focus().trigger('input');
            }
        });
    });
    
},
/*
##################################################
   Input fader event
##################################################
*/
faderEvent: function( $item ) {
    const $window = $( window ),
          $fader = $item.find('.inputFaderRange'),
          $input = $item.find('.inputFader'),
          $knob = $item.find('.inputFaderRangeKnob'),
          $lower = $fader.find('.inputFaderRangeLower'),
          $tooltip = $fader.find('.inputFaderRangeTooltip'),
          min = Number( $input.attr('data-min') ),
          max = Number( $input.attr('data-max') ),
          inputRange = max - min;

    let   width = $fader.width(),
          val = $input.val(),
          ratio, positionX;

    // 位置をセット
    const setPosition = function(){
        const p =  Math.round( ratio * 100 ) + '%';
        $knob.css('left', p );
        $lower.css('width', p );
    };
    // 割合から位置と値をセット
    const ratioVal = function(){
      if ( ratio <= 0 ) ratio = 0;
      if ( ratio >= 1 ) ratio = 1;
      val = Math.round( inputRange * ratio ) + min;
      $input.val( val ).change();

      setPosition();
    };
    // 値から位置をセット
    const valPosition = function(){
      if ( val === '') val = min;
      ratio = ( val - min ) / inputRange;
      if ( Number.isNaN( ratio ) ) ratio = 0;
      positionX = Math.round( width * ratio );

      setPosition();
    };
    valPosition();

    $fader.on({
      'mousedown': function( mde ){
        if ( mde.button === 0 ) {
          getSelection().removeAllRanges();

          $fader.addClass('active');
          const clickX = mde.pageX - $fader.offset().left;

          width = $fader.width();
          ratio = clickX / width;
          positionX = Math.round( width * ratio );

          ratioVal();

          $window.on({
            'mouseup.faderKnob': function(){
              $fader.removeClass('active');
              $window.off('mouseup.faderKnob mousemove.faderKnob');
              valPosition();
            },
            'mousemove.faderKnob': function( mme ){
              const moveX = mme.pageX - mde.pageX;
              ratio = ( positionX + moveX ) / width;                  
              ratioVal();
            }
          });
        }
      },
      // ツールチップ
      'mouseenter': function(){
        const left =  $fader.offset().left,
              top = $fader.offset().top;
        $tooltip.show();
        width = $fader.width();
        $window.on({
          'mousemove.faderTooltip': function( mme ){
            const tRatio = ( mme.pageX - left ) / width;
            let   tVal = Math.round( inputRange * tRatio ) + min;
            if ( tVal < min ) tVal = min;
            if ( tVal > max ) tVal = max ;
            $tooltip.text( tVal );
            $tooltip.css({
              'left': mme.pageX,
              'top': top
            });
          }
        });
      },
      'mouseleave': function(){
        $tooltip.hide();
        $window.off('mousemove.faderTooltip');
      }
    });

    $input.on('input', function(){
      val = $input.val();
      width = $fader.width();
      if ( val !== '') {
        if ( val < min ) {
          $input.val( min ).change();
          val = min;
        }
        if ( val > max ) {
          $input.val( max ).change();
          val = max;
        }
      } else {
        val = '';
      }
      valPosition();
    });
},
/*
##################################################
   HTML
##################################################
*/
html: {
    icon: function( type, className ) {
        className = classNameCheck( className );
        return `<span class="icon icon-${type} ${className.join(' ')}"></span>`;
    },
    button: function( element, className, attrs = {}, toggle ) {
        const attr = inputCommon( null, null, attrs );
        className = classNameCheck( className, 'button');
        if ( toggle !== undefined ) className.push('toggleButton');
        
        attr.push(`class="${className.join(' ')}"`);
        
        if ( toggle !== undefined ) {
            attr.push(`data-toggle="${toggle.init}"`);
            const toggleSwitch = `<span class="toggleButtonSwitch">`
                + `<span class="toggleButtonSwitchOn">${toggle.on}</span>`
                + `<span class="toggleButtonSwitchOff">${toggle.off}</span>`
            + `</span>`;
            return `<button ${attr.join(' ')}><span class="inner">${element}${toggleSwitch}</span></button>`;
        } else { 
            return `<button ${attr.join(' ')}><span class="inner">${element}</span></button>`;
        }
    },
    iconButton: function( icon, element, className, attrs = {}, toggle ) {
        const html = `${cmn.html.icon( icon, 'iconButtonIcon')}<span class="iconButtonBody">${element}</span>`;
        className = classNameCheck( className, 'iconButton');
        return cmn.html.button( html, className, attrs, toggle );
    },
    inputHidden: function( className, value, name, attrs = {}) {
        const attr = inputCommon( value, name, attrs );
        attr.push(`class="${classNameCheck( className, 'inputHidden input').join(' ')}"`);
        
        return `<input type="hidden" ${attr.join(' ')}>`;
    },
    span: function( className, value, name, attrs = {}) {
        const attr = inputCommon( null, name, attrs );
        attr.push(`class="${classNameCheck( className, 'inputSpan').join(' ')}"`);
        
        return `<span ${attr.join(' ')}>${value}</span>`;
    },
    inputText: function( className, value, name, attrs = {}, option = {} ) {
        const attr = inputCommon( value, name, attrs );
        
        className = classNameCheck( className, 'inputText input');
        if ( option.widthAdjustment ) className.push('inputTextWidthAdjustment')
        attr.push(`class="${className.join(' ')}"` );
        
        let input = `<input type="text" ${attr.join(' ')} autocomplete="off">`;
        
        if ( option.widthAdjustment ) {
            input = ``
            + `<div class="inputTextWidthAdjustmentWrap">`
                + input
                + `<div class="inputTextWidthAdjustmentText">${value}</div>`
            + `</div>`
        }
        
        if ( option.before || option.after ) {
          const before = ( option.before )? `<div class="inputTextBefore">${option.before}</div>`: '',
                after =  ( option.after )? `<div class="inputTextAfter">${option.after}</div>`: '';
        
          input = `<div class="inputTextWrap">${before}<div class="inputTextBody">${input}</div>${after}</div>`;
        }
        return  input;
    },
    inputPassword: function( className, value, name, attrs = {}, option = {} ) {
        const wrapClass = ['inputPasswordWrap'],
              attr = inputCommon( value, name, attrs );
        
        className = classNameCheck( className, 'inputPassword input');
        if ( option.widthAdjustment ) className.push('inputTextWidthAdjustment')
        attr.push(`class="${className.join(' ')}"` );
        
        let input = `<input type="password" ${attr.join(' ')} autocomplete="new-password">`;
        
        if ( option.widthAdjustment ) {
            input = ``
            + `<div class="inputTextWidthAdjustmentWrap">`
                + input
                + `<div class="inputTextWidthAdjustmentText">${value}</div>`
            + `</div>`
        }
        
        // パスワード表示
        const eyeAttrs = { action: 'default'};
        if ( attrs.disabled ) eyeAttrs.disabled = 'disabled';
        input = `<div class="inputPasswordBody">${input}</div>`
        + `<div class="inputPasswordToggle">${cmn.html.button( cmn.html.icon('eye_close'), 'itaButton inputPasswordToggleButton', eyeAttrs )}</div>`;
        
        // パスワード削除
        if ( option.deleteToggle ) {
            const deleteClass = ['itaButton', 'inputPasswordDeleteToggleButton', 'popup'],
                  deleteAttrs = { action: 'danger', title: '入力済みパスワードの削除'};
            let iconName = 'cross';
            
            if ( attrs.disabled ) deleteAttrs.disabled = 'disabled';
            if ( option.deleteFlag ) {
                deleteClass.push('on');
                deleteAttrs.action = 'restore';
                iconName = 'ellipsis';
                wrapClass.push('inputPasswordDelete');
            }
            input += `<div class="inputPasswordDeleteToggle">`
                + `<div class="inputPasswordDeleteToggleText"><span class="inner">削除</span></div>`
                + cmn.html.button( cmn.html.icon( iconName ), deleteClass, deleteAttrs)
            + `</div>`;
        }
        
        return `<div class="${wrapClass.join(' ')}">`
            + input
        + `</div>`;
    },
    inputNumber: function( className, value, name, attrs = {}) {
        const attr = inputCommon( value, name, attrs );
        attr.push(`class="${classNameCheck( className, 'inputNumber input').join(' ')}"`);
        
        return `<input type="number" ${attr.join(' ')}>`;
    },
    inputFader: function( className, value, name, attrs = {}, option = {}) {
        const attr = inputCommon( value, name, attrs );
        let bodyClass = 'inputFaderBody';
        className = classNameCheck( className, 'inputFader inputNumber input');
        if ( option.before ) bodyClass += ' inputFaderBeforeWrap';
        if ( option.after ) bodyClass += ' inputFaderAfterWrap';
        
        attr.push(`class="${className.join(' ')}"`);
        
        let input = `<div class="${bodyClass}">`
            + `<input type="number" ${attr.join(' ')}>`
        + `</div>`;
        
        if ( option.before || option.after ) {
          const before = ( option.before )? `<div class="inputFaderBefore">${option.before}</div>`: '',
                after =  ( option.after )? `<div class="inputFaderAfter">${option.after}</div>`: '';
        
          input = `${before}${input}${after}`;
        }
        
        return `<div class="inputFaderWrap">`
            + input
            + `<div class="inputFaderRange">`
                + `<div class="inputFaderRangeKnob"></div>`
                + `<div class="inputFaderRangeLower"></div>`
                + `<div class="inputFaderRangeTooltip"></div>`
            + `</div>`
        + `</div>`;    
    },
    textarea: function( className, value, name, attrs = {}, widthAdjustmentFlag ) {
        const attr = inputCommon( null, name, attrs );
        
        className = classNameCheck( className, 'textarea input');
        if ( widthAdjustmentFlag ) className.push('textareaAdjustment')
        attr.push(`class="${className.join(' ')}"` );
        
        if ( widthAdjustmentFlag ) {
            return ``
            + `<div class="textareaAdjustmentWrap">`
                + `<textarea wrap="soft" ${attr.join(' ')}>${value}</textarea>`
                + `<div class="textareaAdjustmentText textareaWidthAdjustmentText">${value}</div>`
                + `<div class="textareaAdjustmentText textareaHeightAdjustmentText">${value}</div>`
            + `</div>`
        } else {
            return `<textarea wrap="off" ${attr.join(' ')}>${value}</textarea>`;
        }
    },
    check: function( className, value, name, id, attrs = {}) {
        const attr = inputCommon( value, name, attrs, id );
        attr.push(`class="${classNameCheck( className, 'checkbox').join(' ')}"`);
        
        return ``
        + `<div class="checkboxWrap">`
            + `<input type="checkbox" ${attr.join(' ')}>`
            + `<label for="${id}" class="checkboxLabel"></label>`
        + `</div>`;
    },
    checkboxText: function( className, value, name, id, attrs = {}) {
        const attr = inputCommon( value, name, attrs, id );
        attr.push(`class="${classNameCheck( className, 'checkboxText').join(' ')}"`);
        
        return ``
        + `<div class="checkboxTextWrap">`
            + `<input type="checkbox" ${attr.join(' ')}>`
            + `<label for="${id}" class="checkboxTextLabel"><span class="checkboxTextMark"></span>${value}</label>`
        + `</div>`;
    },
    radio: function( className, value, name, id, attrs = {}) {
        const attr = inputCommon( value, name, attrs, id );
        attr.push(`class="${classNameCheck( className, 'radio').join(' ')}"`);
        
        return ``
        + `<div class="radioWrap">`
            + `<input type="radio" ${attr.join(' ')}>`
            + `<label for="${id}" class="radioLabel"></label>`
        + `</div>`;
    },
    'select': function( list, className, value, name, attrs = {}) {
        const option = [],
              attr = inputCommon( null, name, attrs );
        attr.push(`class="${classNameCheck( className, 'select input').join(' ')}"`);
        
        // 必須じゃない場合空白を追加
        if ( attrs.required === '0') {
            option.push(`<option value=""></option>`);
        }
        
        for ( const key in list ) {
            const val = cmn.escape( list[ key ] ),
                  optAttr = [`value="${val}"`];
            if ( value === val ) optAttr.push('selected', 'selected');
            option.push(`<option ${optAttr.join(' ')}>${val}</option>`);
        }
        
        return ``
        + `<select ${attr.join(' ')}>`
            + option.join('')
        + `</select>`;
    },
    'noSelect': function() {
        return '<div class="noSelect input">No data</div>';
    },
    row: function( element, className ) {
        className = classNameCheck( className, 'tr');
        return `<tr class="${className.join(' ')}">${element}</tr>`;
    },
    cell: function( element, className, type = 'td', rowspan = 1, colspan = 1, attrs = {}) {
        const attr = bindAttrs( attrs );
        attr.push(`class="${classNameCheck( className, type ).join(' ')}"`);
        attr.push(`rowspan="${rowspan}"`);
        attr.push(`colspan="${colspan}"`);
        return ``
        + `<${type} ${attr.join(' ')}>`
            + `<div class="ci">${element}</div>`
        + `</${type}>`;
    },
    table: function( tableData, className, thNumber ) {
        className = classNameCheck( className, 'commonTable');
 
        const table = [];
        for ( const type in tableData ) {
            table.push(`<${type}>`);
            const row = [];
            for ( const cells of tableData[ type ] ) {
                const cellLength = cells.length,
                      cell = [];
                for ( let i = 0; i < cellLength; i++ ) {
                    const cellData = cells[i];
                    if ( type === 'thead') {
                        cell.push(`<th class="commonTh">${cellData}</th>`);
                    } else {
                        if ( i < thNumber ) {
                            cell.push(`<th class="commonTh">${cellData}</th>`);
                        } else {
                            cell.push(`<td class="commonTd">${cellData}</td>`);
                        }
                    }
                }
                const rowClass = ( type === 'thead')? 'tHeadTr': 'commonTr';
                row.push(`<tr class="${rowClass}">${cell.join('')}</tr>`);
            }
            table.push( row.join('') );
            table.push(`</${type}>`);
        }
        
        return `<table class="${className.join(' ')}">${table.join('')}</table>`;
    },
    dateInput: function( timeFlag, className, value, name, attrs = {} ) {
        className = classNameCheck( className, 'inputDate');
        
        let placeholder = 'yyyy/MM/dd';
        if ( timeFlag ) {
            if ( timeFlag === 'hm') {
                placeholder += ' HH:mm';
            } else if  ( timeFlag === 'h') {
                placeholder += ' HH';
            } else {
                placeholder += ' HH:mm:ss';
            }
        }
        attrs.timeFlag = timeFlag;
        attrs.placeholder = placeholder;
        
        const buttonAttrs = { action: 'normal', timeFlag: timeFlag };
        if ( attrs.disabled ) {
            buttonAttrs.disabled = 'disabled';
        }
                
        return `<div class="inputDateContainer">`
            + `<div class="inputDateBody">`
                + fn.html.inputText( className, value, name, attrs )
            + `</div>`
            + `<div class="inputDateCalendar">`
                + fn.html.button('<span class="icon icon-cal"></span>', ['itaButton', 'inputDateCalendarButton'], buttonAttrs )
            + `</div>`
        + `</div>`;
    },
    required: function() {
        return `<span class="required">必須</span>`;
    },
    operationItem: function( item ){
        const itemHtml = [],
              itemStyle = [],
              itemClass = ['operationMenuItem'],
              itemAttr = {};

        // item
        if ( item.className ) itemClass.push( item.className );
        if ( item.separate ) itemClass.push('operationMenuSeparate');
        if ( item.display ) itemStyle.push(`display:${item.display}`);
        if ( itemStyle.length ) itemAttr.style = itemStyle.join(';');
        itemAttr.class = itemClass.join(' ');
        
        const itemAttrs = bindAttrs( itemAttr ); 
        
        // button
        if ( item.button ) {
            const button = item.button,
                  buttonClass = ['itaButton', 'operationMenuButton'],
                  buttonStyle = [],
                  buttonAttr = { action: button.action, type: button.type };
            if ( button.width ) buttonStyle.push(`min-width:${button.width}`);
            if ( button.className ) buttonClass.push( button.className );
            if ( buttonStyle.length ) buttonAttr.style = buttonStyle.join(';');
            itemHtml.push( cmn.html.iconButton( button.icon, button.text, buttonClass, buttonAttr ) );
        }

        // input
        if ( item.input ) {
            const input = item.input,
                  inputClass = ['operationMenuInput'],
                  inputOption = { widthAdjustment: true, before: input.before, after: input.after };
            itemHtml.push( cmn.html.inputText( inputClass, input.value, null, null, inputOption ) );            
        }

        return `<li ${itemAttrs}>${itemHtml.join('')}</li>`;
    },
    operationMenu: function( menu, className ) {
        className = classNameCheck( className, 'operationMenuList');
        
        const html = [];
        const list = {
            Main: [],
            Sub: []
        };
                
        for ( const menuType in list ) {
            if ( menu[ menuType ] ) {
                for ( const item of menu[ menuType ] ) {
                    list[ menuType ].push( cmn.html.operationItem( item ) );
                }
                className.push(`operationMenu${menuType}`);
                if ( menu[ menuType ].length ) {
                    html.push(`<ul class="${className.join(' ')}">${list[ menuType ].join('')}</ul>`);
                }
            }
        }        
        
        return `<div class="operationMenu">${html.join('')}</div>`;
    }
},
/*
##################################################
   処理中モーダル
##################################################
*/
processingModal: function( title ) {
    const config = {
        mode: 'modeless',
        position: 'center',
        header: {
            title: title
        },
        width: '320px'
    };
    
    const dialog = new Dialog( config );
    dialog.open();
    
    return dialog;
},
/*
##################################################
   登録成功モーダル
##################################################
*/
resultModal: function( result ) {
    return new Promise(function( resolve ){
        const funcs = {};
        funcs.ok = function(){
            dialog.close();
            resolve( true );
        };
        const config = {
            mode: 'modeless',
            position: 'center',
            header: {
                title: '登録成功'
            },
            width: '480px',
            footer: {
                button: { ok: { text: '閉じる', action: 'normal'}}
            }
        };
        const html = []
    
        const listOrder = ['Register', 'Update', 'Discard', 'Restore'];
        for ( const key of listOrder ) {
              html.push(`<dl class="resultList resultType${key}">`
                  + `<dt class="resultType">${key}</dt>`
                  + `<dd class="resultNumber">${result[key]}</dd>`
              + `</dl>`);
        }    
        
        const dialog = new Dialog( config, funcs );
        dialog.open(`<div class="resultContainer">${html.join('')}</div>`);
    });
},
/*
##################################################
   登録失敗エラーモーダル
##################################################
*/
errorModal: function( error, pageName ) {
    return new Promise(function( resolve ){
        let errorMessage;
        try {
            errorMessage = JSON.parse(error.message);
        } catch ( e ) {
            //JSONを作成
            errorMessage = {"0":{"共通":[error.message]}};
        }
        const errorHtml = [];
        for ( const item in errorMessage ) {
            for ( const error in errorMessage[item] ) {
                const number = Number( item ) + 1,
                      name = cmn.cv( error, '', true ),
                      body = cmn.cv( errorMessage[item][error].join(''), '?', true );

                errorHtml.push(`<tr class="tBodyTr tr">`
                + cmn.html.cell( number, ['tBodyTh', 'tBodyLeftSticky'], 'th')
                + cmn.html.cell( name, 'tBodyTd')
                + cmn.html.cell( body, 'tBodyTd')
                + `</tr>`);
            }
        }

        const html = `
        <div class="errorTableContainer">
            <table class="table errorTable">
                <thead class="thead">
                    <tr class="tHeadTr tr">
                        <th class="tHeadTh tHeadLeftSticky th"><div class="ci">No.</div></th>
                        <th class="tHeadTh th"><div class="ci">エラー列</div></th>
                        <th class="tHeadTh th"><div class="ci">エラー内容</div></th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    ${errorHtml.join('')}
                </tbody>
            </table>
        </div>`;
        
        const funcs = {};
        funcs.ok = function() {
            dialog.close();
            resolve( true );
        };
        funcs.download = function() {
            cmn.download('json', errorMessage, pageName + '_register_error_log');
        };
        const config = {
            mode: 'modeless',
            position: 'center',
            header: {
                title: '登録失敗'
            },
            width: 'auto',
            footer: {
                button: {
                  download: { text: 'エラーログJSONダウンロード', action: 'default'},
                  ok: { text: '閉じる', action: 'normal'}
              }
            }
        };
        
        const dialog = new Dialog( config, funcs );
        dialog.open(`<div class="errorContainer">${html}</div>`);
    });
    
},
/*
##################################################
   Common events
##################################################
*/
setCommonEvents: function() {
    const $window = $( window ),
          $body = $('body');
    
    // input textの幅を入力に合わせる
    $body.on('input.textWidthAdjustment', '.inputTextWidthAdjustment', function(){
        const $text = $( this ),
              value = $text.val();
        $text.next('.inputTextWidthAdjustmentText').text( value );
    });
    
    // textareaの幅と高さを調整する
    $body.on('input.textareaWidthAdjustment', '.textareaAdjustment', cmn.textareaAdjustment );
    
    // パスワード表示・非表示切替
    $body.on('click', '.inputPasswordToggleButton', function(){
        const $button = $( this ),
              $input = $button.closest('.inputPasswordWrap').find('.inputPassword');
        
        if ( !$button.is('.on') ) {
            $button.addClass('on');
            $button.find('.inner').html( cmn.html.icon('eye_open'));
            $input.attr('type', 'text');
        } else {
            $button.removeClass('on');
            $button.find('.inner').html( cmn.html.icon('eye_close'));
            $input.attr('type', 'password');
        }
    });
    
    // パスワード候補を初回クリックで出さないようにする
    $body.on('pointerdown', '.inputPassword', function( e ){
        e.preventDefault();
        const $input = $( this );
        
        setTimeout( function(){
            $input.focus();
        }, 1 );
    });
    
    // 切替ボタン
    $body.on('click', '.toggleButton', function(){
        const $button = $( this ),
              flag = ( $button.attr('data-toggle') === 'on')? 'off': 'on';
        if ( !$button.closest('.standBy').length ) {
            $button.attr('data-toggle', flag );
        }
    });
    
    // titel の内容をポップアップ
    $body.on('pointerenter.popup', '.popup', function(){
        const $t = $( this ),
              ttl = $t.attr('title');
        if ( ttl !== undefined ) {
            $t.removeAttr('title');

            const $p = $('<div/>', {
                'class': 'popupBlock',
                'html': fn.escape( ttl, true )
            }).append('<div class="popupArrow"><span></span></div>');
            
            const $arrow = $p.find('.popupArrow');

            $body.append( $p );

            const r = $t[0].getBoundingClientRect(),
                  m = 8,
                  wW = $window.width(),
                  tW = $t.outerWidth(),
                  tH = $t.outerHeight(),
                  tL = r.left,
                  tT = r.top,
                  pW = $p.outerWidth(),
                  pH = $p.outerHeight(),
                  wsL = $window.scrollLeft();

            let l = ( tL + tW / 2 ) - ( pW / 2 ) - wsL,
                t = tT - pH - m;

            if ( t <= 0 ) {
                $p.addClass('popupBottom');
                t = tT + tH + m;
            } else {
                $p.addClass('popupTop');
            }
            if ( wW < l + pW ) l = wW - pW - m;
            if ( l <= 0 ) l = m;

            $p.css({
                'width': pW,
                'height': pH,
                'left': l,
                'top': t
            });
            
            // 矢印の位置
            let aL = 0;
            if ( tL - wsL + tW > wW ) {
                const twW = tW - ( tL - wsL + tW - wW );
                if ( twW > pW || wW < twW ) {
                    aL = pW / 2;
                } else {
                    aL = pW - ( twW / 2 );
                    if ( pW - aL < 20 ) aL = pW - 20;
                }    
            } else if ( tL < wsL ) {
                const twW = tL + tW - wsL;
                if ( twW > pW ) {
                    aL = pW / 2;
                } else {
                    aL = twW / 2;
                    if (aL < 20 ) aL = 20;
                }
            } else {
                aL = ( tL + ( tW / 2 )) - l - wsL;
            }
            $arrow.css('left', aL );

            if ( $t.is('.popupHide') ) {
                $p.addClass('popupHide');
            }

            $t.on('pointerleave.popup', function(){
                const $p = $body.find('.popupBlock'),
                      title = ttl;
                $p.remove();
                $t.off('pointerleave.popup click.popup').attr('title', title );
            });

            $t.on('click', function(){
                if ( $t.attr('data-popup') === 'click') {
                   if ( $t.is('.popupHide') ) {

                        $t.add( $p ).removeClass('popupHide');
                    } else {
                        $t.add( $p ).addClass('popupHide');
                    }
                }
            });

            const targetCheck = function(){
                if ( $t.is(':visible') ) {
                    if ( $p.is(':visible') ) {
                        setTimeout( targetCheck, 200 );
                    }
                } else {
                    $p.remove();
                }              
            };
            targetCheck();
        }
    });
},
/*
##################################################
   textareaの幅と高さを調整する
##################################################
*/
textareaAdjustment: function() {
    const $text = $( this ),
          $parent = $text.parent('.textareaAdjustmentWrap'),
          $width = $parent.find('.textareaWidthAdjustmentText'),
          $height = $parent.find('.textareaHeightAdjustmentText');
    
    // 空の場合、高さを求めるためダミー文字を入れる
    let value = fn.escape( $text.val() ).replace(/\n/g, '<br>').replace(/<br>$/g, '<br>!');
    if ( value === '') value = '!';

    $width.add( $height ).html( value );
    
    if ( $width.get(0).scrollWidth > 632 ) {
        $parent.addClass('textareaOverWrap');
    } else {
        $parent.removeClass('textareaOverWrap');
    }
    
    $parent.css('height', $height.outerHeight() + 1 );

},
/*
##################################################
  選択用モーダル
  config: {
      title: モーダルタイトル、ボタンテキスト
      selectNameKey: 選択で返す名称Key
      info: Table構造info URL
      infoData: Table構造infoが取得済みの場合はこちらに
      filter: Filter URL
      filterPulldown: Filter pulldown URL
      sub: infoに複数のTable構造がある場合のKey
  }
##################################################
*/
selectModalOpen: function( modalId, title, menu, config ) {
    return new Promise(function( resolve, reject ){
        const modalFuncs = {
            ok: function() {
                modalInstance[ modalId ].modal.hide();   
                const selectId = modalInstance[ modalId ].table.select.select;
                resolve( selectId );
            },
            cancel: function() {
                modalInstance[ modalId ].modal.hide();
                resolve( null );
            }
        };
        
        if ( !modalInstance[ modalId ] ) {
            fn.initSelectModal( title, menu, config ).then(function( modalAndTable ){
                modalInstance[ modalId ] = modalAndTable;
                modalInstance[ modalId ].modal.btnFn = modalFuncs;
            });
        } else {
            modalInstance[ modalId ].modal.show();
            modalInstance[ modalId ].modal.btnFn = modalFuncs;
        }
    });
},
/*
##################################################
   選択用モーダルの初期設定
   tableとmodalのインスタンスを返す
##################################################
*/
initSelectModal: function( title, menu, selectConfig ) {
    
    return new Promise(function( resolve, reject ) {
        const modalConfig = {
            mode: 'modeless',
            width: '100%',
            height: '100%',
            header: {
                title: title
            },
            footer: {
                button: {
                    ok:  { text: '選択決定', action: 'default'},
                    cancel: { text: 'キャンセル', action: 'normal'}
                }
            }
        };
        
        const modal = new Dialog( modalConfig );
        modal.open();
        
        const resolveModal = function( info ) {
            const params = cmn.getCommonParams();
            params.menuNameRest = menu;
            params.selectNameKey = selectConfig.selectNameKey;
            params.restFilter = selectConfig.filter;
            params.restFilterPulldown = selectConfig.filterPulldown;
            
            // 取得したinfoのSubキー確認
            if ( selectConfig.sub ) info = info[ selectConfig.sub ];

            const tableId = `SE_${menu.toUpperCase()}${( selectConfig.sub )? `_${selectConfig.sub}`: ``}`,
                  table = new DataTable( tableId, 'select', info, params );
            modal.setBody( table.setup() );
            
            resolve({
                modal: modal,
                table: table
            });
        };
        
        // Table info確認
        if ( selectConfig.infoData ) {
            resolveModal( selectConfig.infoData );
        } else {
            // infoが無ければ読み込む
            fn.fetch( selectConfig.info ).then(function( info ){
                resolveModal( info );
            });
        }
    });
},
/*
##################################################
  作業実行
##################################################
*/
executeModalOpen: function( modalId, menu, executeConfig ) {
    return new Promise(function( resolve ){
        const funcs = {
            ok: function(){
                modalInstance[ modalId ].hide();
                resolve({
                    selectName: executeConfig.selectName,
                    selectId: executeConfig.selectId,
                    id: modalInstance[ modalId ].$.dbody.find('.executeOperetionId').text(),
                    name: modalInstance[ modalId ].$.dbody.find('.executeOperetionName').text(),
                    schedule:  modalInstance[ modalId ].$.dbody.find('.executeSchedule').val()
                });
            },
            cancel: function(){
                modalInstance[ modalId ].hide();
                resolve('cancel');
            }
        };

        if ( !modalInstance[ modalId ] ) {
            const html = `
            <div class="commonSection">
                <div class="commonTitle">${executeConfig.title} ${executeConfig.itemName}</div>
                <div class="commonBody">
                    <table class="commonTable">
                        <tbody class="commonTbody">
                            <tr class="commonTr">
                                <th class="commonTh">ID</th>
                                <td class="commonTd">${executeConfig.selectId}</td>
                            </tr>
                            <tr class="commonTr">
                                <th class="commonTh">名称</th>
                                <td class="commonTd">${executeConfig.selectName}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="commonTitle">オペレーション ${cmn.html.required()}</div>
                <div class="commonBody">
                    <table class="commonTable">
                        <tbody class="commonTbody">
                            <tr class="commonTr">
                                <th class="commonTh">ID</th>
                                <td class="commonTd executeOperetionId"></td>
                            </tr>
                            <tr class="commonTr">
                                <th class="commonTh">名称</th>
                                <td class="commonTd executeOperetionName"></td>
                            </tr>
                        </tbody>
                    </table>
                    <ul class="commonMenuList">
                        <li class="commonMenuItem">
                            ${fn.html.button( fn.html.icon('menuList') + ' オペレーション選択', ['itaButton', 'commonButton executeOperetionSelectButton'], { action: 'default', style: `width:100%`})}
                        </li>
                    </ul>
                </div>
                <div class="commonTitle">スケジュール</div>
                <div class="commonBody">
                    <div class="commonInputArea">
                        ${fn.html.dateInput( true, 'executeSchedule', '')}
                    </div>
                    <p class="commonParagraph">予約日時を指定する場合は、日時フォーマット(yyyy/MM/dd HH:mm:ss)で入力して下さい。<br>ブランクの場合は即時実行となります。</p>
                </div>
            </div>`;

            const config = {
                mode: 'modeless',
                position: 'center',
                header: {
                    title: executeConfig.title + '設定'
                },
                width: '480px',
                footer: {
                    button: {
                        ok: { text: executeConfig.title, action: 'positive', className: 'dialogPositive',  style: `width:200px`},
                        cancel: { text: '閉じる', action: 'normal'}
                    }
                }
            };
            modalInstance[ modalId ] = new Dialog( config, funcs );
            
            modalInstance[ modalId ].open( html );
            cmn.setDatePickerEvent( modalInstance[ modalId ].$.dbody.find('.executeSchedule'), 'スケジュール');
            
            // オペレーション選択
            modalInstance[ modalId ].$.dbody.find('.executeOperetionSelectButton').on('click', function(){
                cmn.selectModalOpen( 'operation', 'オペレーション選択', menu, executeConfig.operation ).then(function( selectResult ){
                    if ( selectResult ) {
                        modalInstance[ modalId ].$.dbody.find('.executeOperetionId').text( selectResult[0].id );
                        modalInstance[ modalId ].$.dbody.find('.executeOperetionName').text( selectResult[0].name );
                        
                        modalInstance[ modalId ].buttonPositiveDisabled( false );
                    }
                });
            });
            
        } else {
            modalInstance[ modalId ].btnFn = funcs;
            modalInstance[ modalId ].show();
        }
    });
},
/*
##################################################
   メッセージを出す
##################################################
*/
message: function( type, message, title, icon, closeTime ) {
    const msg = new Message( type, message, title, icon, closeTime );
    msg.open();
    
    return msg;
},
/*
##################################################
   エラーページへ移動
##################################################
*/
gotoErrPage: function( message ) {
    // windowFlagでWorker内か判定
    if ( windowFlag ) {
        if ( message ) {
            window.alert( message );
        } else {
            window.alert('Unknown error.');
        }
        // window.location.href = './system_error/';
    } else {
        if ( message ) {
            console.error( message );
        } else {
            console.error('Unknown error.');
        }
    }
},

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   Contentローディング
// 
////////////////////////////////////////////////////////////////////////////////////////////////////

contentLoadingStart() {
    contentLoadingFlag = true;
},
contentLoadingEnd() {
    contentLoadingFlag = false;
},
checkContentLoading() {
    return contentLoadingFlag;
},

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   iframeモーダル
// 
////////////////////////////////////////////////////////////////////////////////////////////////////

modalIframe: function( menu, title, option = {}){
    if ( !modalInstance[ menu ] ) {
        const modalFuncs = {
            cancel: function() {
                modalInstance[ menu ] = null;
                modal.close();
            }
        };
        const modalConfig = {
            mode: 'modeless',
            width: '100%',
            height: '100%',
            header: {
                title: title
            },
            footer: {
                button: {
                    cancel: { text: '閉じる', action: 'normal'}
                }
            }
        };
        
        const filterEncode = function( json ) {
            try {
                return encodeURIComponent( JSON.stringify( json ) );
            } catch( error ) {
                return '';
            }
        };
        
        const url = [`?menu=${menu}`];
        if ( option.filter ) {
            url.push(`&filter=${filterEncode( option.filter )}`);
        }
        if ( option.iframeMode ) {
            url.push(`&iframeMode=${option.iframeMode}`);
        }
        
        // モーダル作成
        modalInstance[ menu ] = new Dialog( modalConfig, modalFuncs );
        
        const modal = modalInstance[ menu ];
        modal.open(`<iframe class="iframe" src="${url.join('')}"></iframe>`);
    }
},

iframeMessage( message ) {
    const html = `<div class="iframeMessage">
        <div class="contentMessage">
            <div class="contentMessageInner">${message}</div>
        </div>
    </div>`
    $('#container').html( html );
},

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   作業状態確認管理
// 
////////////////////////////////////////////////////////////////////////////////////////////////////

/*
##################################################
   新しい作業状態確認を作成する
##################################################
*/
createCheckOperation: function( menu, operationId ) {
    if ( !operationInstance[ operationId ] ) {
        operationInstance[ operationId ] = new Status( menu, operationId );
        operationInstance[ operationId ].setup();
        return operationInstance[ operationId ];
    }    
},
/*
##################################################
   作業状態確認をクリアする
##################################################
*/
clearCheckOperation: function( operationId ) {
    if ( operationInstance[ operationId ] ) {
        operationInstance[ operationId ] = null;
    }
},

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   Conductor管理
// 
////////////////////////////////////////////////////////////////////////////////////////////////////

/*
##################################################
   新しいConductorを作成する
##################################################
*/
createConductor: function( menu, target, mode, conductorId, option ) {
    if ( !conductorInstance[ conductorId ] ) {
        conductorInstance[ conductorId ] = new Conductor( menu, target, mode, conductorId, option );
        return conductorInstance[ conductorId ];
    } else {
        alert('指定のConductorはすでに開いています。');
    }
},
/*
##################################################
   Conductorを削除する
##################################################
*/
removeConductor: function( conductorId ) {
    if ( conductorInstance[ conductorId ] ) {
        $(`.conductor[data-conductor="${conductorId}"]`).remove();
        conductorInstance[ conductorId ] = null;
    } else {
        alert('指定のConductorは作成されていません。');
    }
},
/*
##################################################
   新しいConductorをモーダルで表示する
##################################################
*/
modalConductor: function( menu, mode, conductorId, option ) {
    if ( !conductorInstance[ conductorId ] ) {
        const modalFuncs = {
            cancel: function() {
                modalInstance[ conductorId ] = null;
                conductorInstance[ conductorId ] = null;
                modal.close();
            }
        };
        const modalConfig = {
            mode: 'modeless',
            width: '100%',
            height: '100%',
            header: {
                title: 'Conductor'
            },
            footer: {
                button: {
                    cancel: { text: '閉じる', action: 'normal'}
                }
            }
        };
        const target = `cd-${conductorId}-area`;
        
        // モーダル作成
        modalInstance[ conductorId ] = new Dialog( modalConfig, modalFuncs );
        const modal = modalInstance[ conductorId ];
        modal.open(`<div id="${target}" class="modalConductor"></div>`);
        
        // Conductor作成
        conductorInstance[ conductorId ] = new Conductor( menu, '#' + target, mode, conductorId, option );
        const cd = conductorInstance[ conductorId ];
        cd.setup();

    } else {
        alert('指定のConductorはすでに開いています。');
    }
},

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   画面フルスクリーン
// 
////////////////////////////////////////////////////////////////////////////////////////////////////
/*
##################################################
   フルスクリーン
##################################################
*/
// フルスクリーンチェック
fullScreenCheck() {
    if (
        ( document.fullScreenElement !== undefined && document.fullScreenElement === null ) ||
        ( document.msFullscreenElement !== undefined && document.msFullscreenElement === null ) ||
        ( document.mozFullScreen !== undefined && !document.mozFullScreen ) || 
        ( document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen )
    ) {
        return false;
    } else {
        return true;
    }
},
// フルスクリーン切り替え
fullScreen( elem ) {
    if ( elem === undefined ) elem = document.body;

    if ( !this.fullScreenCheck() ) {
      if ( elem.requestFullScreen ) {
        elem.requestFullScreen();
      } else if ( elem.mozRequestFullScreen ) {
        elem.mozRequestFullScreen();
      } else if ( elem.webkitRequestFullScreen ) {
        elem.webkitRequestFullScreen( Element.ALLOW_KEYBOARD_INPUT );
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if ( document.cancelFullScreen ) {
        document.cancelFullScreen();
      } else if ( document.mozCancelFullScreen ) {
        document.mozCancelFullScreen();
      } else if ( document.webkitCancelFullScreen ) {
        document.webkitCancelFullScreen();
      } else if ( document.msExitFullscreen ) {
        document.msExitFullscreen();
      }
    }
}

}; // end cmn



    // 共通パラメーター
    const commonParams = {};
    commonParams.dir = '/_/ita';
    if ( windowFlag ) {
        commonParams.path = cmn.getPathname();
    }

    return cmn;

}());

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   Log
//
////////////////////////////////////////////////////////////////////////////////////////////////////
class Log {
/*
##################################################
   Constructor
##################################################
*/
constructor( log, max ) {
    const lg = this;
    
    lg.log = log;
    lg.max = max;
}
/*
##################################################
   Setup
##################################################
*/
setup() {
    const lg = this;
    
    const menu = {
        Main: [
            { input: { className: '', before: 'ログ検索' } }
        ],
        Sub: []
    };
    
    const $log = $(`
    <div class="operationLogContainer">
        ${fn.html.operationMenu( menu )}
        <div class="operationLogBody">
            <div class="operationLog"></div>
        </div>
    </div>`);
    
    lg.$ = {};
    lg.$.log = $log.find('.operationLog');
    
    return $log;
}
/*
##################################################
   Update
##################################################
*/
update( log ) {
    const lg = this;
    
    lg.$.log( log );
}

}

////////////////////////////////////////////////////////////////////////////////////////////////////
//
//   Message
//
////////////////////////////////////////////////////////////////////////////////////////////////////
class Message {
/*
##################################################
   Constructor
##################################################
*/
constructor( type, title, message, icon, closeTime = 5000 ) {
    const ms = this;
    
    ms.type = type;
    ms.message = message;
    ms.title = title;
    if ( icon ) {
        ms.icon = icon;
    } else {
        switch ( type ) {
            case 'success': ms.icon = 'check'; break;
            case 'warning': ms.icon = 'circle_exclamation'; break;
            case 'danger': ms.icon = 'circle_exclamation'; break;
            case 'unkown': ms.icon = 'circle_question'; break;
            default: ms.icon = 'circle_info';
        }        
    }
    ms.closeTime = closeTime;
    
    ms.$ = {};
    ms.$.window = $( window );
    ms.$.body = $('body');
}
/*
##################################################
   Open
##################################################
*/
open() {
    const ms = this;
    
    // Container
    if ( !fn.exists('#messageContainer') ) {
        ms.$.body.append('<div id="messageContainer"></div>');
    }
    
    const html = [];
    html.push(`<div class="messageTime">${fn.date( new Date(), 'yyyy/MM/dd HH:mm:ss')}</div>`);
    if ( ms.icon ) html.push(`<div class="messageIcon">${fn.html.icon( ms.icon )}</div>`);
    if ( ms.title ) html.push(`<div class="messageTitle">${ms.title}</div>`);
    if ( ms.message ) html.push(`<div class="messageBody">${ms.message}</div>`);
    html.push(`<div class="messageClose"><button class="messageCloseButton">${fn.html.icon('cross')}</button></div>`);
    
    ms.$.container = $('#messageContainer');
    ms.$.message = $(`<div class="messageItem" data-message="${ms.type}">${html.join('')}</div>`);
    
    ms.$.container.append( ms.$.message );
    if ( ms.closeTime !== 0 ) {
        ms.timerId = setTimeout(function(){
            ms.close();
        }, ms.closeTime );
    }
    
    ms.$.message.find('.messageCloseButton').on('click', function(){
        if ( ms.timerId ) clearTimeout( ms.timerId );
        ms.close();
    });
}
/*
##################################################
   Close
##################################################
*/
close() {
    const ms = this;
    ms.$.message.fadeOut( 300 );
    /*
    ms.$.message.fadeOut( 300, function(){
        ms.$.message.remove();

        if ( !ms.$.container.find('.messageItem').length ) {
            ms.$.container.remove();
        }
    });
    */
}

}