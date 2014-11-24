/**
 * Created by Caleb on 9/19/2014.
 */
"use strict";

(function () {
    angular.module("fc.common")
        .factory("authInterceptor", authInterceptor)
        .factory("languageInterceptor", languageInterceptor);

    authInterceptor.$inject = ['$q', '$window', 'appConfig'];

    function authInterceptor($q, $window, appConfig) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.FC_Authorization = $window.sessionStorage.token;
                }

                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                    // handle the case where the user is not authenticated.
                    $window.location = appConfig.loginPage;
                }
                return response || $q.when(response);
            }
        };
    }

    languageInterceptor.$inject = ['$window'];

    function languageInterceptor($window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};

                if($window.localStorage.localConfig && typeof($window.localStorage.localConfig) === "string"){
                    var localConfig = JSON.parse($window.localStorage.localConfig);
                    config.headers.FC_ActiveLanguage = localConfig.languageCode || "en-US";
                }

                return config;
            }
        };
    }
})();