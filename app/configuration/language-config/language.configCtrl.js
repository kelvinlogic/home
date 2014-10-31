(function () {
    'use strict';

    angular
        .module("fc.configuration")
        .controller("LanguageConfigCtrl", languageConfigCtrl);

    languageConfigCtrl.$inject = ["lodash", "$modal", "$scope", "$state", "appConfig", "configSvc", "langSvc"];

    /* @ngInject */
    function languageConfigCtrl(_, $modal, $scope, $state, config, configSvc, langSvc)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.defaultLanguages = [];
        vm.languages = [];
        vm.titleKey = "fc.configuration.language.PAGE_TITLE";

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Register an event listener on this controller for language changes.
            // This event helps us know what language is in use.
            $scope.$on(config.languageChanged, load);
        }

        function load() {
            // Check if the language configuration has been performed.
            configSvc.getConfig().then(function (data) {
                // If it has been done, show a modal to ask whether to modify the existing configuration.
                if (data.language.completed){
                    var modalInstance = $modal.open({
                        templateUrl: "common/modal.template.html",
                        controller: "ModalTemplateCtrl as modalCtrl",
                        resolve: {
                            data: function () {
                                return {
                                    bodyTextKey: "fc.configuration.language.configCompleteModal.COMPLETE_MODAL_CONTENT",
                                    cancelKey: "fc.NO_TEXT",
                                    okKey: "fc.YES_TEXT",
                                    titleKey: "fc.configuration.language.configCompleteModal.COMPLETE_MODAL_TITLE"
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        // We want to modify...
                        populateData(data);
                    }, function () {
                        // We don't want to modify...go to hierarchy configuration.
                        $state.go("hierarchy-config");
                    });
                } else {
                    populateData(data);
                }
            });
        }

        function populateData(data) {
            langSvc.getLanguages().then(function (languages) {
                vm.defaultLanguages = _.filter(languages, function (language) {
                    return language.default;
                });

                var selected = data.language.languages;

                vm.languages = _(languages).filter(function (language) {
                    return !language.default;
                }).map(function (item) {
                    if(_.some(selected, {code: item.code})){
                        item.selected = true;
                    }

                    return item;
                }).value();
            });
        }

        function submit() {
            // Enter submit logic here.
        }
    }
})();