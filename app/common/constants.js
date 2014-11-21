(function () {
    'use strict';

    angular
        .module('fc.common')
        .constant('lodash', _)
        .constant('rx', Rx)
        .value('throttleValue', 500);
})();