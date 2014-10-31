(function () {
    "use strict";

    angular
        .module("fc.merchandising")
        .controller("ProductHierarchyMappingCtrl", productHierarchyMappingCtrl);

    productHierarchyMappingCtrl.$inject = ["$modal", "$scope", "$state", "appConfig", "hierarchyDataSvc", "lodash"];

    /* @ngInject */
    function productHierarchyMappingCtrl($modal, $scope, $state, config, hierarchyDataSvc, _) {
        /* jshint validthis: true */
        var vm = this;
        var maxLevels = 5;

        vm.activate = activate;
        vm.addFirstLevel = addFirstLevel;
        vm.addLevelAfter = addLevelAfter;
        vm.canAddFirstLevel = canAddFirstLevel;
        vm.canAddLevelAfter = canAddLevelAfter;
        vm.canRemoveLevel = canRemoveLevel;
        vm.levels = [];
        vm.removeLevel = removeLevel;
        vm.save = save;
        vm.titleKey = "fc.merchandising.productHierarchyMapping.PAGE_TITLE";
        vm.validate = validate;
        vm.validLevel = validLevel;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            load();
        }

        function addFirstLevel() {
            // Create the level.
            var newLevel = {open: true, data: {}};
            vm.levels.push(newLevel);
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

        function canAddFirstLevel() {
            return vm.levels && vm.levels.length < 1;
        }

        function canAddLevelAfter(level) {
            var canAdd = false;

            // If we don't have a level to add after. Return false.
            if (!level) {
                return canAdd;
            }

            // Check that we haven't exceeded the maximum number of levels allowed.
            canAdd = vm.levels.length < maxLevels;

            return canAdd;
        }

        function canRemoveLevel(level) {
            return true;
        }

        function load(language) {
            hierarchyDataSvc.getHierarchyMapping().then(function (data) {
                vm.levels = data || [];
                // By default, open the first item.
                vm.levels[0].open = true;

                // Register an event listener for language changes.
                // This event helps us know what language is in use.
                $scope.$on(config.languageChanged, function (event, language) {
                    load(language);
                });
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