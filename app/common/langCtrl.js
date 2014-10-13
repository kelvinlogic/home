(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('LanguageCtrl', langCtrl);

    langCtrl.$inject = ['$rootScope', '$translate', 'lodash', 'appConfig', "configSvc", 'langSvc'];

    /* @ngInject */
    function langCtrl($rootScope, $translate, _, config, configSvc, langSvc) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.currentLang = null;
        vm.setLanguage = setLanguage;
        vm.languages = [];

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            load();
        }

        function load() {
            langSvc.getActiveLanguages().then(function (languages) {
                var currentConfig = configSvc.getLocalConfig();

                // Set the language to the configured language in local storage.
                $translate.use(currentConfig.languageCode);

                vm.languages = languages;
                vm.currentLang = _(vm.languages).filter(function (lang) {
                    return lang.code === currentConfig.languageCode;
                }).first();

                $rootScope.language = vm.currentLang;

                // Notify of initial language.
                $rootScope.$broadcast(config.languageChanged, vm.currentLang);
            });
        }

        function saveLanguageConfig(language) {
            var currentConfig = configSvc.getLocalConfig();
            currentConfig.languageCode = language.code;
            configSvc.setLocalConfig(currentConfig);
        }

        function setLanguage(newLanguage) {
            $translate.use(newLanguage.code);
            vm.currentLang = newLanguage;
            saveLanguageConfig(newLanguage);
            $rootScope.language = newLanguage;

            // Broadcast (dispatch an event downwards through the scope hierarchy) the language changed event from the
            // $rootScope (so that all the listeners in the application know of this change).
            $rootScope.$broadcast(config.languageChanged, vm.currentLang);
        }
    }
})();