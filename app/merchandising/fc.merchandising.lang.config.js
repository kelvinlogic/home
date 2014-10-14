(function () {
    'use strict';

    angular
        .module('fc.merchandising').config([
            '$translatePartialLoaderProvider',
            translationConfig
        ]);

    function translationConfig($translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('merchandising');
    }
})();