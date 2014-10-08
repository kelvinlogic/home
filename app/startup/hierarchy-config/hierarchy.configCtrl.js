(function () {
    "use strict";

    angular
        .module("fc.startup")
        .controller("HierarchyConfigCtrl", hierarchyConfigCtrl);

    hierarchyConfigCtrl.$inject = ["$scope", "appConfig", "configSvc", "dataContextSvc", "lodash"];

    /* @ngInject */
    function hierarchyConfigCtrl($scope, config, configSvc, datacontext, _) {
        /* jshint validthis: true */
        var vm = this;
        var maxLevels = 9;
        var bottomPosition = 2;

        vm.activate = activate;
        vm.addLevelAfter = addLevelAfter;
        vm.canAddLevelAfter = canAddLevelAfter;
        vm.canRemoveLevel = canRemoveLevel;
        vm.levels = null;
        vm.removeLevel = removeLevel;
        vm.titleKey = "fc.startup.config.hierarchy.PAGE_TITLE";
        vm.validate = validate;
        vm.validLevel = validLevel;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Register an event listener for language changes.
            // This event helps us know what language is in use.
            $scope.$on(config.languageChanged, function (event, language) {
                load(language);
            });
        }

        function addLevelAfter(level) {
            if (!canAddLevelAfter(level) || !validLevel(level)) {
                return;
            }

            // Create the level.
            var newLevel = {open: true, data: {}};

            // Find the index of the level in the array and move to the next index.
            var index = vm.levels.indexOf(level);
            index++;

            // Remove 0 elements and add level starting from the new index.
            vm.levels.splice(index, 0, newLevel);
        }

        function canAddLevelAfter(level) {
            var canAdd = false;

            // If we don't have a level to add after or if the level to add after is pinned to the bottom, we can't add
            // a level. Return false.
            if (!level || level.pin === bottomPosition) {
                return canAdd;
            }

            // Check that we haven't exceeded the maximum number of levels allowed and that the level to add our new
            // level after is not pinned to the bottom.
            canAdd = vm.levels.length < maxLevels && level.pin !== bottomPosition;

            return canAdd;
        }

        function canRemoveLevel(level) {
            // We shouldn't be able to remove a pinned level.
            return !level.pin;
        }

        function load(language) {
            datacontext.getConfig().then(function () {
                vm.levels = configSvc.config.hierarchy.levels;
                // By default, open the first item.
                vm.levels[0].open = true;
            });
        }

        function removeLevel(level) {
            if (!canRemoveLevel(level)){
                return;
            }

            var index = vm.levels.indexOf(level);
            vm.levels.splice(index, 1);
        }

        function save() {
            // TODO: Add save logic here.
        }

        function validate() {
            return _.all(vm.levels, function (level) {
                return vm.validLevel(level);
            });
        }

        function validLevel(level) {
            // Check that we have filled in all the required information on a level.
            return Boolean(level.description && level.data && level.data.name && level.data.code);
        }
    }
})();