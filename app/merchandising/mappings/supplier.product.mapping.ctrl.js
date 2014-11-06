(function () {
    'use strict';

    angular
        .module("fc.merchandising")
        .controller("SupplierProductMappingCtrl", supplierProductMapping);

    supplierProductMapping.$inject = ["lodash", "$scope", "$translate", "merchandisingConstants", "DTOptionsBuilder"];

    /* @ngInject */
    function supplierProductMapping(_, $scope, $translate, constants, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this,
            _productsEngine = null,
            _suppliersEngine = null;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.canSaveChanges = canSaveChanges;
        vm.edit = edit;
        vm.filters = {};
        vm.gridOptions = null;
        vm.mapping = null;
        vm.mappings = [];
        vm.newMapping = newMapping;
        vm.typeaheadOptions = null;
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.products = [];
        vm.productDataset = null;
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedMappings = [];
        vm.selectedMapping = null;
        vm.selectedSupplier = null;
        vm.supplierDataset = null;
        vm.suppliers = [];
        vm.titleKey = "fc.merchandising.supplierProductMapping.MASTER_PAGE_TITLE";
        vm.toggleSelection = toggleSelection;
        vm.validationData = null;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();

            // Set up pagination.
            setupPagination();

            _productsEngine = new Bloodhound({
                datumTokenizer: function(d) {
                    return Bloodhound.tokenizers.whitespace(d[constants.suggestions.products.displayKey]);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: constants.suggestions.products.remote
            });

            _suppliersEngine = new Bloodhound({
                datumTokenizer: function(d) {
                    return Bloodhound.tokenizers.whitespace(d[constants.suggestions.suppliers.displayKey]);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: constants.suggestions.suppliers.remote
            });

            _productsEngine.initialize();
            _suppliersEngine.initialize();

            vm.typeaheadOptions = {
                hint: true,
                highlight: true,
                minLength: 1
            };
            vm.productDataset = {
                name: "products",
                displayKey: constants.suggestions.products.displayKey,
                source: _productsEngine.ttAdapter(),
                templates: constants.suggestions.products.templates
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

        function cancelChanges() {
            vm.mapping = null;
            vm.selectedMapping = null;
        }

        function canSaveChanges() {
            return vm.mapping && vm.mapping.supplier && vm.mapping.product && vm.mapping.supplierCode;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.mapping = angular.extend({}, vm.selectedMapping);

            // Clear table selection
            delete vm.selectedMapping.isSelected;
            vm.selectedMappings = [];
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

            $scope.$watchCollection(function () {
                return vm.filters;
            }, function (newCollection) {
                if (newCollection.all) {
                    // Search on all fields.
                }

                if (newCollection.id) {
                    // Search on id field.
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

            vm.mapping = mapping;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            if (vm.mapping.id) {
                vm.selectedMapping = vm.mapping;
            } else {
                vm.mappings.push(vm.mapping);
            }

            vm.mapping = null;
            vm.selectedMapping = null;
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

                vm.gridOptions.withTableToolsOption("sSwfPath", "theme/SmartAdmin/js/plugin/datatables/swf/copy_csv_xls_pdf.swf");
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
            var index = vm.selectedMappings.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedMapping = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedMappings.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedMappings.splice(index, 1);
                }

                vm.selectedMapping = _.last(vm.selectedMappings);
            }
        }
    }
})();