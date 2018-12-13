/**
 * 跨域存储
 * cross storage
 */

(function (global, factory) {
    if (typeof define == 'function') {
        define(factory);
    } else {
        global.crossStorage = factory();
    }
}(this, function () {
    var crossStorage = {
        setItem: function (key, val) { },
        getItem: function (key) { },
        removeItem: function (key) { },
        clear: function () { },
        change: function (callback) { },//监听 window.onstorage
        setProxyUrl: function (url) { } //设置要跨域的域名
    };

    var isFunction = function (f) {
        return typeof f === 'function';
    };

    var isString = function (s) {
        return typeof s === 'string';
    };

    var isUndefined = function (u) {
        return typeof u === 'undefined';
    };


    var isPossMessageSupported = 'postMessage' in window;
    var isStorageSupported = 'localStorage' in window;


    //不支持 postMessage 的情况 存当前页面
    if (!isPossMessageSupported) {
        if (isStorageSupported) {
            crossStorage = localStorage;

            crossStorage.change = function (callback) {
                if (isFunction(callback) && window.addEventListener) {
                    window.addEventListener('storage', callback);
                }
            };
        }
        return crossStorage;
    }

    crossStorage.setItem = function (key, val) {
        if (key && isString(key) && !isUndefined(key)) {
            var data = {};
            data[key] = val;
            send('set', data);
        }
    };


    crossStorage.getItem = function (key, callback) {
        if (key && isString(key) && !isUndefined(key) && isFunction(callback)) {
            send('get', key, callback);
        }
    };

    crossStorage.removeItem = function (key) {
        if (key && isString(key) && !isUndefined(key)) {
            send('del', key);
        }
    };

    crossStorage.clear = function () {
        send('del');
    };

    var storeChangeCallbacks = [];

    crossStorage.change = function (callback) {
        if (isFunction(callback)) {
            storeChangeCallbacks.push(callback);
            proxyReady();
        }
    };

    //设置要跨域的域名
    var proxyAddress = '';

    crossStorage.setProxyUrl = function (url) {
        if (url && isString(url) && !isUndefined(url)) {
            proxyAddress = url;
        }
    };

    var sign = 'CROSS_STORAGE';
    var sendSuccessCallbacks = {};

    //send
    function send(type, data, callback) {
        var msg = {
            sign: sign,
            type: type,
            data: data,
        };

        if (type == 'get') {
            msg.token = 'f_' + (new Date()).getTime() + Math.floor(Math.random() * 1e10);
            sendSuccessCallbacks[msg.token] = callback;
        }

        var s = '';

        try {
            s = JSON.stringify(msg);
        } catch (error) {

        }

        s && proxyReady(function (target) {
            target.postMessage(s, '*');
        });
    }

    //receive
    if ('addEventListener' in document) {
        window.addEventListener('message', receive, false);
    } else if ('attachEvent' in document) {
        document.attachEvent('onmessage', receive);
    }


    function receive(msg) {
        var data = null;

        try {
            data = JSON.parse(msg.data);
        } catch (error) {

        }

        if (data && data.sign == sign) {
            if (data.token) {
                if (data.token == 'STORE_CHANGE') {
                    for (var i = 0, l = storeChangeCallbacks.length; i < l; i++) {
                        storeChangeCallbacks[i](data.data);
                    }
                } else {
                    sendSuccessCallbacks[data.token](data.data);
                    sendSuccessCallbacks[data.token] = null;
                }
            }
        }
    }

    //代理仓库 本地数据库
    var proxyReady = (function () {
        var proxy = null;
        var storage = null;
        var isReady = false;
        var callbacks = [];
        var onload = function () {
            isReady = true;
            storage = proxy.contentWindow;

            for (var i = 0, l = callbacks.length; i < l; i++) {
                callbacks[i](storage);
            }
        };

        return function (callback) {
            if (!proxy) {
                proxy = document.createElement('iframe');
                proxy.style.display = 'none';

                //先插入 后赋值 ie6 onload不会触发
                document.body.insertBefore(proxy, document.body.firstChild);

                if (proxy.attachEvent) {
                    proxy.attachEvent('onload', onload);
                } else {
                    proxy.onload = onload;
                }

                proxy.src = proxyAddress + '/crossStore.html';
            }

            if (isFunction(callback)) {
                isReady ? callback(storage) : callbacks.push(callback);
            }
        };
    })();

    return crossStorage;

}));