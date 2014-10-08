(function () {
    'use strict';

    angular
        .module('fc.login')
        .controller('LoginCtrl', loginCtrl);

    loginCtrl.$inject = ['$window', '$stateParams', 'appConfig', 'authSvc'];

    /* @ngInject */
    function loginCtrl($window, $stateParams, config, authSvc) {
        /* jshint validthis: true */
        var vm = this;
        var returnUrl = $stateParams.returnUrl || config.defaultPage;

        vm.activate = activate;
        vm.loginModel = {};
        vm.messageKey = $stateParams.messageKey;
        vm.submit = submit;
        vm.titleKey = 'fc.login.form.TITLE';
        vm.validationData = {};


        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            vm.validationData.username = {
                fieldName: "username",
                fieldPrefix: "your ",
                minLength: 3,
                required: true
            };

            vm.validationData.password = {
                fieldName: "password",
                fieldPrefix: "your ",
                minLength: 6,
                required: true
            };

            // Warn about clearing the current session.
        }

        function submit() {
            authSvc.login(vm.loginModel).then(function (data) {
                $window.location = returnUrl || data.returnUrl;
            }, function () {
                vm.messageKey = 'fc.ERROR_OCCURRED';
            });
        }
    }
})();