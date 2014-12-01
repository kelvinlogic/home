(function () {
    "use strict";

    angular
        .module("fc.merchandising")
        .controller("ProductHierarchyMappingCtrl", productHierarchyMappingCtrl);

    productHierarchyMappingCtrl.$inject = ["lodash", "$scope", "appConfig", "prodHierarchyDataSvc", "reloadMenuEventValue"];

    /* @ngInject */
    function productHierarchyMappingCtrl(_, $scope, config, hierarchyDataSvc, reloadMenuEventValue) {
        /* jshint validthis: true */
        var vm = this;
        var maxLevels = 5;

        vm.activate = activate;
        vm.addLevelAfter = addLevelAfter;
        vm.canAddLevelAfter = canAddLevelAfter;
        vm.canRemoveLevel = canRemoveLevel;
        vm.levels = null;
        vm.removeLevel = removeLevel;
        vm.save = save;
        vm.titleKey = "fc.merchandising.productHierarchyMapping.PAGE_TITLE";
        vm.validate = validate;
        vm.validLevel = validLevel;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Register an event listener for language changes.
            // This event helps us know what language is in use.
            vm.validationData = {
                name: {
                    required: true
                },
                data: {
                    code: {
                        required: true
                    },
                    name: {
                        required: true
                    },
                    description: {
                        required: false
                    },
                    extraInfo: {
                        required: false
                    }
                }
            };

            load();
            $scope.$on(config.languageChanged, load);
        }

        function addLevelAfter(level) {
            if (!canAddLevelAfter(level) || !validLevel(level)) {
                return;
            }

            // Create the level.
            var newLevel = {open: true, data: {}};
            _setupFormFields(newLevel);

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
            if (!level) {
                return canAdd;
            }

            // Check that we haven't exceeded the maximum number of levels allowed and that the level to add our new
            // level after is not pinned to the bottom.
            canAdd = vm.levels.length < maxLevels;

            return canAdd;
        }

        function canRemoveLevel(level) {
            return true;
        }

        function load() {
            // Check if the hierarchy configuration has been performed.
            hierarchyDataSvc.getHierarchyConfig().then(function (data) {
                function populateData(data) {
                    vm.levels = data;
                    // By default, open the first item.
                    vm.levels[0].open = true;

                    _.map(vm.levels, _setupFormFields);
                }

                populateData(data);
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
            vm.isSaving = true;
            if (!_.any(vm.levels, "id")) {
                hierarchyDataSvc.createHierarchyConfig(vm.levels).then(function () {
                    // Finished saving...yay!!!
                    vm.isSaving = false;
                    load();
                    $scope.$emit(reloadMenuEventValue);
                });
            }
        }

        function validate() {
            return _.all(vm.levels, function (level) {
                return vm.validLevel(level);
            });
        }

        function validLevel(level) {
            // Check that we have filled in all the required information on a level.
            var vd = vm.validationData;
            var codeInValid = level.formFields.code && vd.data.code.required && (!level.data || !level.data.code);
            var descriptionInValid = level.formFields.description && vd.data.description.required && (!level.data || !level.data.description);
            var extraInfoInValid = level.formFields.extraInfo && vd.data.extraInfo.required && (!level.data || !level.data.extraInfo);
            var hierNameInValid = level.formFields.name && vd.name.required && (!level.name);
            var nameInValid = level.formFields.name && vd.data.name.required && (!level.data || !level.data.name);
            return !hierNameInValid && !codeInValid && !descriptionInValid && !extraInfoInValid && !nameInValid;
        }

        function _setupFormFields(level) {
            level.formFields = {
                name: true,
                data: {
                    code: true,
                    description: true,
                    extraInfo: true
                }
            };
        }
    }
})();