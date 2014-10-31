(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('HierarchyMasterCtrl', hierarchyMaster);

    hierarchyMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function hierarchyMaster(_, $scope) {
        /* jshint validthis: true */
        var vm = this,
            _gridApi = null;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedHierarchies = [];
        vm.selectedHierarchy = null;
        vm.hierarchy = null;
        vm.title = null;
        vm.titleKey = 'fc.merchandising.hierarchy.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = [
                {id: 1, code: "CLL", description: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}},
                {id: 2, code: "CLL", description: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}},
                {id: 3, code: "CLL", description: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}},
                {id: 4, code: "CLL", description: "Compulynx Limited", fields: {length: 20, width: 20, height: 8}}
            ];

            // Add extra fields to col definitions.
            if (vm.gridOptions.data && vm.gridOptions.data.length > 0) {
                var dat = vm.gridOptions.data[0];
                var fields = Object.keys(dat.fields);

                for (var i = 0; i < fields.length; i++) {
                    var key = fields[i];
                    if (dat.fields.hasOwnProperty(key)) {
                        // Push the result.
                        var colDef = {
                            name: "fields." +key,
                            displayName: _.string.capitalize(key),
                            visible: i === 0
                        };
                        vm.gridOptions.columnDefs.push(colDef);
                    }
                }
            }
        }

        function cancelChanges() {
            vm.hierarchy = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.hierarchy = angular.extend({}, vm.selectedHierarchy);
            vm.selectedHierarchies = [];
            vm.selectedHierarchy = null;
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
            vm.gridOptions.enableGridMenu = true;
//            vm.gridOptions.enableRowHeaderSelection = false;
//            vm.gridOptions.enableScrollbars = false;
            vm.gridOptions.enableSelectAll = true;
            vm.gridOptions.enableSelectionBatchEvent = false;
            vm.gridOptions.multiSelect = true;

            vm.gridOptions.columnDefs = [
                {name: "id", visible: false},
                {name: "code"},
                {name: "description"}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedHierarchies.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedHierarchy = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedHierarchies.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedHierarchies.splice(index, 1);
                        }

                        vm.selectedHierarchy = _.last(vm.selectedHierarchies);
                    }
                });
            };

            // TODO: Add external filtering and sorting.
        }

        function setupPagination() {
            vm.pagination.page = 1;
            vm.pagination.total = 100;
            vm.pagination.maxSize = 5;
        }
    }
})();