(function () {
    'use strict';

    angular
        .module('fc.startup')
        .controller('LanguageConfigCtrl', languageConfigCtrl);

    languageConfigCtrl.$inject = ['lodash', '$scope', 'appConfig', "configSvc", "dataContextSvc", 'langSvc'];

    /* @ngInject */
    function languageConfigCtrl(_, $scope, config, configSvc, dataContextSvc, langSvc)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.defaultLanguages = [];
        vm.languages = [];
        vm.titleKey = 'fc.startup.config.language.PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Register an event listener on this controller for language changes.
            // This event helps us know what language is in use.
            $scope.$on(config.languageChanged, function (event, language) {
                load(language);
            });
        }

        function load(language) {
            dataContextSvc.getConfig().then(function () {
                langSvc.getLanguages().then(function (languages) {
                    vm.defaultLanguages = _.filter(languages, function (language) {
                        return language.default;
                    });

                    var selected = configSvc.config.language.languages;

                    vm.languages = _(languages).filter(function (language) {
                        return !language.default;
                    }).map(function (item) {
                        if(_.some(selected, {code: item.code})){
                            item.selected = true;
                        }

                        return item;
                    }).value();
                });
            });
        }

        function submit() {
            // Enter submit logic here.
        }
    }
})();