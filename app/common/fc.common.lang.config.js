(function () {
    'use strict';

    angular
        .module('fc.common').config([
            '$translatePartialLoaderProvider',
            translationConfig
        ]);

    function translationConfig($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('common');
    }
})();