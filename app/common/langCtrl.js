(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('LanguageCtrl', langCtrl);

    langCtrl.$inject = ['$rootScope', '$translate', 'lodash', 'appConfig', 'langSvc'];

    /* @ngInject */
    function langCtrl($rootScope, $translate, _, config, langSvc) {
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
                var langCode = $translate.use();
                vm.languages = languages;
                vm.currentLang = _(vm.languages).filter(function (lang) {
                    return lang.code === langCode;
                }).first();

                // Notify of initial language.
                $rootScope.$broadcast(config.languageChanged, vm.currentLang);
            });
        }

        function setLanguage(newLanguage) {
            $translate.use(newLanguage.code);
            vm.currentLang = newLanguage;
            $rootScope.currentLang = vm.currentLang;

            // Broadcast (dispatch an event downwards through the scope hierarchy) the language changed event from the
            // $rootScope (so that all the listeners in the application know of this change).
            $rootScope.$broadcast(config.languageChanged, vm.currentLang);
        }
    }
})();