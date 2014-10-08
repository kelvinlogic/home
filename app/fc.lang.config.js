(function () {
    'use strict';

    angular
        .module('fc').config([
            '$translateProvider',
            '$translatePartialLoaderProvider',
            translationConfig
        ]);

    function translationConfig($translateProvider, $translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('.');
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '{part}/i18n/{lang}.json'
        });
        $translateProvider.preferredLanguage('en-US');
//        $translateProvider.useLocalStorage();
    }
})();