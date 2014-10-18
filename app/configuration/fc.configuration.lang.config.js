(function () {
    'use strict';

    angular
        .module('fc.configuration').config([
            '$translatePartialLoaderProvider',
            translationConfig
        ]);

    function translationConfig($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('configuration');
    }
})();