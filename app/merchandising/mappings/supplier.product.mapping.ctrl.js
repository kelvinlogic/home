(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .controller("SupplierProductMappingCtrl", supplierProductMapping)
        .controller("SupplierProductMappingDetailCtrl", supplierProductMappingDetail);

    supplierProductMapping.$inject = ["lodash", "$modal", "$scope", "$translate", "merchandisingConstants", "DTOptionsBuilder"];

    /* @ngInject */
    function supplierProductMapping(_, $modal, $scope, $translate, constants, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this,
            _suppliersEngine = null,
            _mappingDetailModalOptions = null,
            _selectionEnum = {"none": 0, "some": 1, "all": 2 };

        vm.deactivate = deactivate;
        vm.edit = edit;
        vm.filters = {};
        vm.gridOptions = null;
        vm.mappings = [];
        vm.newMapping = newMapping;
        vm.typeaheadOptions = null;
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.products = [];
        vm.selectAll = selectAll;
        vm.selected = null;
        vm.selectedSupplier = null;
        vm.supplierDataset = null;
        vm.suppliers = [];
        vm.titleKey = "fc.merchandising.supplierProductMapping.MASTER_PAGE_TITLE";
        vm.toggleSelection = toggleSelection;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();

            // Set up pagination.
            setupPagination();

            _mappingDetailModalOptions = {
                templateUrl: "fc/editView",
                controller: "SupplierProductMappingDetailCtrl as vm"
            };

            _suppliersEngine = new Bloodhound({
                datumTokenizer: function(d) {
                    return Bloodhound.tokenizers.whitespace(d[constants.suggestions.suppliers.displayKey]);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: constants.suggestions.suppliers.remote
            });

            _suppliersEngine.initialize();

            vm.typeaheadOptions = {
                hint: true,
                highlight: true,
                minLength: 1
            };
            vm.supplierDataset = {
                name: "suppliers",
                displayKey: constants.suggestions.suppliers.displayKey,
                source: _suppliersEngine.ttAdapter(),
                templates: constants.suggestions.suppliers.templates
            };

            $scope.$watch(function () {
                return vm.selectedSupplier;
            }, function () {
                // TODO: Load user data here.
                load();
            });
        }

        function deactivate(item) {
            // Show alert...
        }

        function edit(item) {
            // Prevent propagation to disable selecting row...done on view.
            if (!item) {
                return;
            }

            // Use extend to prevent reference copying so we can edit the item in isolation.
            var mapping = angular.extend({}, item);

            // Setup modal options.
            _mappingDetailModalOptions.resolve = {
                data: function () {
                    return {
                        constants: constants,
                        mapping: mapping,
                        supplierDataset: vm.supplierDataset,
                        typeaheadOptions: vm.typeaheadOptions
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_mappingDetailModalOptions);

            modalInstance.result.then(function (editedMapping) {
                // We selected ok...
                angular.extend(item, editedMapping);
            }, function () {
                // We cancelled the search...
                // Do nothing...
            });
        }

        function load() {
            // TODO: Load data...
            vm.mappings = [
                {
                    id: 1,
                    supplierCode: 4321,
                    product: {id: 1, code: 1234, name: "Rosy Toilet Paper"},
                    supplier: {id: 1, code: "LH01", name: "Longhorn Publishers"}
                },
                {
                    id: 2,
                    supplierCode: 4321,
                    product: {id: 1, code: 1234, name: "Rosy Toilet Paper"},
                    supplier: {id: 1, code: "LH01", name: "Longhorn Publishers"}
                },
                {
                    id: 3,
                    supplierCode: 4321,
                    product: {id: 1, code: 1234, name: "Rosy Toilet Paper"},
                    supplier: {id: 1, code: "LH01", name: "Longhorn Publishers"}
                },
                {
                    id: 4,
                    product: {id: 1, code: 1234, name: "Rosy Toilet Paper"},
                    supplier: {id: 1, code: "LH01", name: "Longhorn Publishers"},
                    supplierCode: 4321
                }
            ];

            $scope.$watchCollection(function () {
                return vm.filters;
            }, function (newCollection) {
                if (newCollection.all) {
                    // Search on all fields.
                }

                if (newCollection.productCode) {
                    // Search on productCode field.
                }

                if (newCollection.productName) {
                    // Search on productName field.
                }

                if (newCollection.supplierCode) {
                    // Search on supplierCode field.
                }

                if (newCollection.supplierName) {
                    // Search on supplierName field.
                }
            });
        }

        function newMapping() {
            var mapping = {};
            mapping.supplier = vm.selectedSupplier || null;

            // Add new mapping to the grid.
            vm.mappings.push(mapping);

            // Setup modal options.
            _mappingDetailModalOptions.resolve = {
                data: function () {
                    return {
                        constants: constants,
                        mapping: mapping,
                        supplierDataset: vm.supplierDataset,
                        typeaheadOptions: vm.typeaheadOptions
                    };
                }
            };

            // Open modal popup.
            var modalInstance = $modal.open(_mappingDetailModalOptions);

            modalInstance.result.then(function (newMapping) {
                // We selected ok...
                // Show the new mapping on the grid.
            }, function () {
                // We cancelled the search...
                // Do nothing...
                var index = vm.mappings.indexOf(mapping);
                vm.mappings.splice(index, 1);
            });
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function refreshSelection(){
            var check = function (mapping) {
                return mapping.isSelected;
            };

            var allSelected = _.all(vm.mappings, check);
            var someSelected = _.any(vm.mappings, check);
            if (allSelected) {
                vm.selected = _selectionEnum.all;
            } else if (someSelected) {
                vm.selected = _selectionEnum.some;
            } else {
                vm.selected = _selectionEnum.none;
            }
        }

        function selectAll() {
            if (!vm.selected || vm.selected === _selectionEnum.none) {
                _.forEach(vm.mappings, function(mapping) {
                    mapping.isSelected = true;
                });
            } else {
                _.forEach(vm.mappings, function(mapping) {
                    mapping.isSelected = false;
                });
            }

            refreshSelection();
        }

        function setupGrid() {
            var sDom = "<'dt-toolbar'<'col-xs-12 col-sm-6'T><'col-sm-6 col-xs-6 hidden-xs'C>r>"+
                "t"+
                "<'dt-toolbar-footer'<'col-sm-12 col-xs-12'i>>";

            // ColVis specified in sDom as 'C'. Don't need withColVis option.
            vm.gridOptions = DTOptionsBuilder
                .newOptions()
                .withDOM(sDom)
                .withBootstrap()
                .withTableToolsOption("sSwfPath", "theme/SmartAdmin/js/plugin/datatables/swf/copy_csv_xls_pdf.swf")
                .withOption("paging", false)
                .withOption("autoWidth", true)
                .withOption('responsive', true);

            $translate([
                "fc.table.COL_VIS_TEXT",
                "fc.table.COPY_TOOL_TEXT",
                "fc.table.PRINT_TOOL_TEXT",
                "fc.table.SAVE_AS_TOOL_TEXT"
            ]).then(function (translations) {
                var colVisText = translations["fc.table.COL_VIS_TEXT"];
                vm.gridOptions.withColVisOption("buttonText", colVisText);

                var ttBtnCfg = [
                    {
                        "sExtends": "copy",
                        "sButtonText": translations["fc.table.COPY_TOOL_TEXT"]
                    },
                    {
                        "sExtends": "print",
                        "sButtonText": translations["fc.table.PRINT_TOOL_TEXT"]
                    },
                    {
                        "sExtends": "collection",
                        "sButtonText": translations["fc.table.SAVE_AS_TOOL_TEXT"],
                        "aButtons": [
                            "csv",
                            "xls",
                            "pdf"
                        ]
                    }
                ];

                vm.gridOptions.withTableToolsButtons(ttBtnCfg);
            });

            // TODO: Add external filtering and sorting.
        }

        function setupPagination() {
            vm.pagination.page = 1;
            vm.pagination.total = 100;
            vm.pagination.maxSize = 5;
        }

        function toggleSelection(item) {
            item.isSelected = !item.isSelected;

            refreshSelection();
        }
    }

    /* Add functions to su */

    supplierProductMappingDetail.$inject = ["$modalInstance", "data"];

    function supplierProductMappingDetail($modalInstance, data) {
        var vm = this,
            _productsEngine = null,
            _constants = data.constants;

        vm.cancel = cancel;
        vm.canSaveChanges = canSaveChanges;
        vm.mapping = data.mapping;
        vm.ok = ok;
        vm.productDataset = null;
        vm.supplierDataset = data.supplierDataset;
        vm.typeaheadOptions = data.typeaheadOptions;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            _productsEngine = new Bloodhound({
                datumTokenizer: function(d) {
                    return Bloodhound.tokenizers.whitespace(d[_constants.suggestions.products.displayKey]);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: _constants.suggestions.products.remote
            });

            _productsEngine.initialize();

            vm.productDataset = {
                name: "products",
                displayKey: _constants.suggestions.products.displayKey,
                source: _productsEngine.ttAdapter(),
                templates: _constants.suggestions.products.templates
            };

            vm.validationData = {
                product: {
                    required: true
                },
                supplier: {
                    required: true
                },
                supplierCode: {
                    required: true
                }
            };
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function canSaveChanges() {
            return vm.mapping && vm.mapping.supplier && vm.mapping.product && vm.mapping.supplierCode;
        }

        function ok() {
            $modalInstance.close(vm.mapping);
        }
    }
})();