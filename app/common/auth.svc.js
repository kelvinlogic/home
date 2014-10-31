(function () {
    'use strict';

    angular
        .module('fc.common')
        .provider('authSvc', authSvcProvider);

    /* @ngInject */
    function authSvcProvider() {
        // Available in config.
        var cfg = this;
        cfg.loginUrl = null;
        cfg.signOutUrl = null;

        cfg.$get = authSvc;

        authSvc.$inject = ['$http', '$window'];

        function authSvc($http, $window) {
            return {
                clearAuthData: clearAuthData,
                getAuthData: getAuthData,
                getCurrentUser: getCurrentUser,
                isAdmin: isAdmin,
                isLoggedIn: isLoggedIn,
                isUser: isUser,
                login: login,
                setAuthData: setAuthData,
                signOut: signOut
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function clearAuthData() {
                $window.sessionStorage.removeItem("auth");
            }

            function getAuthData() {
                return JSON.parse($window.sessionStorage.getItem("auth"));
            }

            function getCurrentUser() {
                var data = getAuthData();
                return data ? data.user : null;
            }

            function isAdmin() {
                var data = getAuthData();
                if (data && !data.user) {
                    return false;
                }

                return _.any(data.user.roles, function (role) {
                    return role.name === "Admin";
                });
            }

            function isUser() {
                var data = getAuthData();
                if (data && !data.user) {
                    return false;
                }

                return _.any(data.user.roles, function (role) {
                    return role.name === "Company";
                });
            }

            function isLoggedIn() {
                return Boolean(getAuthData());
            }

            function login(credentials) {
                return $http.post(cfg.loginUrl, credentials)
                    .success(function (data, status, headers, config) {
                        var auth = getAuthData() || {};
                        auth.token = data.token;
                        auth.user = data.user;
                        setAuthData(auth);
                    })
                    .error(function (data, status, headers, config) {
                        // Erase the token if the user fails to log in
                        clearAuthData();

                        // Handle login errors here
                    });
            }

            function setAuthData(data) {
                $window.sessionStorage.setItem("auth", JSON.stringify(data));
            }

            function signOut() {
                return $http.post(cfg.signOutUrl)
                    .success(function (data, status, headers, config) {
                        clearAuthData();
                    })
                    .error(function (data, status, headers, config) {
                        // On error, still erase the token so the user is signed out.
                        clearAuthData();

                        // Handle login errors here
                    });
            }
        }
    }
})();