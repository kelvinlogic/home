(function () {
    'use strict';

    angular
        .module('fc.startup').config([
            '$translatePartialLoaderProvider',
            translationConfig
        ]);

    function translationConfig($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('startup');
    }
})();