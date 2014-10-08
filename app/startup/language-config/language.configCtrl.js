(function () {
    'use strict';

    angular
        .module("fc.startup")
        .controller("LanguageConfigCtrl", languageConfigCtrl);

    languageConfigCtrl.$inject = ["lodash", "$modal", "$scope", "$state", "appConfig", "configSvc", "dataContextSvc", "langSvc"];

    /* @ngInject */
    function languageConfigCtrl(_, $modal, $scope, $state, config, configSvc, dataContextSvc, langSvc)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.defaultLanguages = [];
        vm.languages = [];
        vm.titleKey = "fc.startup.config.language.PAGE_TITLE";

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Check if the language configuration has been performed.
            dataContextSvc.getConfig().then(function (data) {
                // If it has been done, show a modal to ask whether to modify the existing configuration.
                if (data.language.completed){
                    var modalInstance = $modal.open({
                        templateUrl: "common/modal.template.html",
                        controller: "ModalTemplateCtrl as modalCtrl",
                        resolve: {
                            data: function () {
                                return {
                                    bodyTextKey: "fc.startup.config.language.configCompleteModal.COMPLETE_MODAL_CONTENT",
                                    cancelKey: "fc.NO_TEXT",
                                    okKey: "fc.YES_TEXT",
                                    titleKey: "fc.startup.config.language.configCompleteModal.COMPLETE_MODAL_TITLE"
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        // We want to modify...
                        load();
                    }, function () {
                        // We don't want to modify...go to hierarchy configuration.
                        $state.go("hierarchy-config");
                    });
                } else {
                    load();
                }
            });
        }

        function load(language) {
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

                // Register an event listener on this controller for language changes.
                // This event helps us know what language is in use.
                $scope.$on(config.languageChanged, function (event, language) {
                    load(language);
                });
            });
        }

        function submit() {
            // Enter submit logic here.
        }
    }
})();