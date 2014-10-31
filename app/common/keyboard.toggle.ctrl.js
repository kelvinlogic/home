(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('KeyboardToggleCtrl', keyboardToggleCtrl);

    keyboardToggleCtrl.$inject = ["$rootScope", "appConfig", "configSvc"];

    /* @ngInject */
    function keyboardToggleCtrl($rootScope, config, configSvc) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.keyboardEnabled = false;
        vm.keyboardVisible = false;
        vm.toggleKeyboard = toggleKeyboard;
        vm.toggleVisibility = toggleVisibility;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            var localConfig = configSvc.getLocalConfig();
            vm.keyboardEnabled = localConfig.keyboardEnabled;
            vm.keyboardVisible = localConfig.keyboardVisible;
        }

        function toggleKeyboard() {
            var localConfig = configSvc.getLocalConfig();
            localConfig.keyboardEnabled = !localConfig.keyboardEnabled;

            vm.keyboardEnabled = localConfig.keyboardEnabled;
            configSvc.setLocalConfig(localConfig);
            $rootScope.$broadcast(config.keyboardToggledEvent);
        }

        function toggleVisibility() {
            var localConfig = configSvc.getLocalConfig();
            localConfig.keyboardVisible = !localConfig.keyboardVisible;

            vm.keyboardVisible = localConfig.keyboardVisible;
            configSvc.setLocalConfig(localConfig);
            $rootScope.$broadcast(config.keyboardToggledEvent);
        }
    }
})();