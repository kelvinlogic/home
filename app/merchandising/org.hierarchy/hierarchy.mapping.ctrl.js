(function () {
    "use strict";

    angular
        .module("fc.merchandising")
        .controller("OrganisationalHierarchyMappingCtrl", hierarchyMappingCtrl);

    hierarchyMappingCtrl.$inject = ["lodash", "$scope", "appConfig", "orgHierarchyDataSvc", "reloadMenuEventValue"];

    /* @ngInject */
    function hierarchyMappingCtrl(_, $scope, config, hierarchyDataSvc, reloadMenuEventValue) {
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
                    description: {
                        required: false
                    },
                    location: {
                        required: true
                    },
                    name: {
                        required: true
                    },
                    address1: {
                        required: true
                    },
                    phone1: {
                        required: true
                    },
                    fax1: {
                        required: true
                    },
                    email1: {
                        required: true
                    },
                    pin: {
                        required: true
                    },
                    registration: {
                        required: true
                    }
                }
            };

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
            _setupFormFields(newLevel);

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

                    _.map(vm.levels, _setupFormFields);
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
            var hierNameInValid = level.formFields.name && vd.name.required && (!level.name);
            var codeInValid = level.formFields.data.code && vd.data.code.required && (!level.data || !level.data.code);

            var locationInValid = level.formFields.data.location && vd.data.location.required &&
                (!level.data || !level.data.location);

            var nameInValid = level.formFields.data.name && vd.data.name.required && (!level.data || !level.data.name);

            var descriptionInValid = level.formFields.data.description && vd.data.description.required &&
                (!level.data || !level.data.description);

            var address1InValid = level.formFields.data.address1 && vd.data.address1.required &&
                (!level.data || !level.data.address1);

            var phone1InValid = level.formFields.data.phone1 && vd.data.phone1.required &&
                (!level.data || !level.data.phone1);

            var fax1InValid = level.formFields.data.fax1 && vd.data.fax1.required && (!level.data || !level.data.fax1);

            var email1InValid = level.formFields.data.email1 && vd.data.email1.required &&
                (!level.data || !level.data.email1);

            var pinInValid = level.formFields.data.pin && vd.data.pin.required && (!level.data || !level.data.pin);

            var registrationInValid = level.formFields.data.registration && vd.data.registration.required &&
                (!level.data || !level.data.registration);

            return !hierNameInValid && !codeInValid && !locationInValid && !nameInValid && !descriptionInValid &&
                !address1InValid && !phone1InValid && !fax1InValid && !email1InValid && !pinInValid &&
                !registrationInValid;
        }

        function _setupFormFields(level) {
            level.formFields = {
                name: true,
                data: {
                    code: true,
                    name: true
                }
            };

            if (level.pin === 1) {
                level.formFields.data.description = true;
                level.formFields.data.location = true;
            }

            if (!level.pin) {
                level.formFields.data.customFields = true;
            }

            if (level.pin === 2) {
                level.formFields.data.address1 = true;
                level.formFields.data.phone1 = true;
                level.formFields.data.fax1 = true;
                level.formFields.data.email1 = true;
                level.formFields.data.branchIsWarehouse = true;
                level.formFields.data.pin = true;
                level.formFields.data.registration = true;
            }
        }
    }
})();