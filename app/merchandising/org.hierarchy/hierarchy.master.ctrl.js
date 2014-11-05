(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('HierarchyMasterCtrl', hierarchyMaster);

    hierarchyMaster.$inject = ['lodash', '$scope', '$translate', 'DTOptionsBuilder'];

    /* @ngInject */
    function hierarchyMaster(_, $scope, $translate, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.fields = [];
        vm.filters = {};
        vm.gridOptions = {};
        vm.hierarchies = [];
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedHierarchies = [];
        vm.selectedHierarchy = null;
        vm.hierarchy = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.hierarchy.MASTER_PAGE_TITLE';
        vm.toggleSelection = toggleSelection;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            load();


        }

        function cancelChanges() {
            vm.hierarchy = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.hierarchy = angular.extend({}, vm.selectedHierarchy);

            // Clear table selection
            delete vm.selectedHierarchy.isSelected;
            vm.selectedHierarchies = [];
            vm.selectedHierarchy = null;
        }

        function load() {
            vm.hierarchies = [
                {id: 1, code: "CLL", name: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}},
                {id: 2, code: "CLL", name: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}},
                {id: 3, code: "CLL", name: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}},
                {id: 4, code: "CLL", name: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}}
            ];

            // Add extra fields.
            if (vm.hierarchies && vm.hierarchies.length > 0) {
                var dat = vm.hierarchies[0];
                var fields = Object.keys(dat.fields);

                for (var i = 0; i < fields.length; i++) {
                    var key = fields[i];
                    if (dat.fields.hasOwnProperty(key)) {
                        // Push the result.
                        vm.fields.push(key);
                    }
                }
            }

            $scope.$watchCollection(function () {
                return vm.filters;
            }, function (newCollection) {
                if (newCollection.all) {
                    // Search on all fields.
                }

                if (newCollection.id) {
                    // Search on id field.
                }

                if (newCollection.code) {
                    // Search on code field.
                }

                if (newCollection.name) {
                    // Search on name field.
                }

                _.each(fields, function (field) {
                    if (newCollection["fields-" + field]) {
                        // Search on dynamic fields.
                    }
                });
            });
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.hierarchy = null;
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
            var index = vm.selectedHierarchies.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedHierarchy = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedHierarchies.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedHierarchies.splice(index, 1);
                }

                vm.selectedHierarchy = _.last(vm.selectedHierarchies);
            }
        }
    }
})();