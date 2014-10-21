/**
 * Created by Caleb on 9/19/2014.
 */
"use strict";

(function () {
    angular.module("fc.common").factory("authInterceptor", authInterceptor);

    authInterceptor.$inject = ['$q', '$window', '$location', 'appConfig'];

    function authInterceptor($q, $window, $location, appConfig) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }
                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                    // handle the case where the user is not authenticated.
                    var msgKey = "fc.common.errors.REMOTE_ACCESS_DENIED";
                    $window.location = appConfig.loginPage;
//                    $location.path("shell.login", {messageKey: msgKey})
                }
                return response || $q.when(response);
            }
        };
    }
})();