(function () {
    "use strict";

    angular
        .module("fc.merchandising")
        .controller("HierarchyMappingCtrl", hierarchyMappingCtrl);

    hierarchyMappingCtrl.$inject = ["lodash", "$modal", "$scope", "appConfig", "orgHierarchyDataSvc", "reloadMenuEventValue"];

    /* @ngInject */
    function hierarchyMappingCtrl(_, $modal, $scope, config, hierarchyDataSvc, reloadMenuEventValue) {
        /* jshint validthis: true */
        var vm = this;
        var maxLevels = 9;
        var bottomPosition = 2;

        vm.activate = activate;
        vm.addCustomField = addCustomField;
        vm.addLevelAfter = addLevelAfter;
        vm.canAddCustomField = canAddCustomField;
        vm.canAddLevelAfter = canAddLevelAfter;
        vm.canRemoveLevel = canRemoveLevel;
        vm.levels = null;
        vm.removeField = removeField;
        vm.removeLevel = removeLevel;
        vm.save = save;
        vm.titleKey = "fc.merchandising.hierarchyMapping.PAGE_TITLE";
        vm.validate = validate;
        vm.validLevel = validLevel;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Register an event listener for language changes.
            // This event helps us know what language is in use.
            load();
            $scope.$on(config.languageChanged, load);
        }

        function addCustomField(level) {
            if (!canAddCustomField(level)) {
                return;
            }

            level.data.customFields.push({});
        }

        function addLevelAfter(level) {
            if (!canAddLevelAfter(level) || !validLevel(level)) {
                return;
            }

            // Create the level.
            var newLevel = {open: true, data: {customFields: []}};

            // Find the index of the level in the array and move to the next index.
            var index = vm.levels.indexOf(level);
            index++;

            // Remove 0 elements and add level starting from the new index.
            vm.levels.splice(index, 0, newLevel);
        }

        function canAddCustomField(level) {
            if (!level) {
                return false;
            }

            if (!canRemoveLevel(level)) {
                return false;
            }

            if (!level.data) {
                level.data = {};
            }

            if (!level.data.customFields || !_.isArray(level.data.customFields)) {
                level.data.customFields = [];
                return true;
            }

            if (level.data.customFields.length && level.data.customFields.length >= 8) {
                return false;
            }

            var isFieldInvalid = _.any(level.data.customFields, function (field) {
                return !field.name || !field.value;
            });

            return !isFieldInvalid;
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

        function load() {
            // Check if the hierarchy configuration has been performed.
            hierarchyDataSvc.getHierarchyConfig().then(function (data) {
                function populateData(data) {
                    vm.levels = data;
                    // By default, open the first item.
                    vm.levels[0].open = true;
                }

                populateData(data);
            });
        }

        function removeField(level, field) {
            if (!canRemoveLevel(level)){
                return;
            }

            var index = level.data.customFields.indexOf(field);
            level.data.customFields.splice(index, 1);
        }

        function removeLevel(level) {
            if (!canRemoveLevel(level)){
                return;
            }

            var index = vm.levels.indexOf(level);
            vm.levels.splice(index, 1);
        }

        function save() {
            hierarchyDataSvc.createHierarchyConfig(vm.levels).then(function () {
                // Finished saving...yay!!!
                $scope.$emit(reloadMenuEventValue);
            });
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