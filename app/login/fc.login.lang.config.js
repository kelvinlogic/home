(function () {
    'use strict';

    angular
        .module('fc.login').config([
            '$translatePartialLoaderProvider',
            translationConfig
        ]);

    function translationConfig($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('login');
    }
})();