(function () {
    'use strict';

    angular
        .module('fc.common')
        .filter('string', stringFilter);

    stringFilter.$inject = ['lodash'];

    /* @ngInject */
    function stringFilter(_)
    {
        function filter(input, func) {
            return _.string[func](input);
        }

        return filter;
    }
})();