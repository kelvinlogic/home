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
        vm.canToggleSelection = canToggleSelection;
        vm.edit = edit;
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selectedAll = false;
        vm.selectedEntities = [];
        vm.selectedEntity = null;
        vm.entity = null;
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

            if (vm.gridOptions.data && vm.gridOptions.data.length > 0) {
                var dat = vm.gridOptions.data[0];
                var fields = Object.keys(dat.fields);
                var widthPercent = 60/fields.length;

                for (var i = 0; i < fields.length; i++) {
                    var key = fields[i];
                    if (dat.fields.hasOwnProperty(key)) {
                        var displayName = null;

                        // Make a character array of letters in key.
                        var letters = key.split("");

                        if (letters && letters.length > 0) {
                            // Replace the first letter with its uppercase value.
                            letters.splice(0, 1, _.first(letters).toLocaleUpperCase());

                            // Join the letters.
                            displayName = letters.join("");
                        }

                        // Push the result.
                        var colDef = {name: "fields." +key, displayName: displayName, width: widthPercent + "%"};
                        vm.gridOptions.columnDefs.push(colDef);
                    }
                }
            }
        }

        function cancelChanges() {
            vm.entity = null;
        }

        function canToggleSelection() {
            return _gridApi;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.entity = angular.extend({}, vm.selectedEntity);
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.entity = null;
        }

        function selectAll() {
            if (!_gridApi) {
                return;
            }

            if (vm.selectedAll) {
                _gridApi.selection.clearSelectedRows();
            } else {
                _gridApi.selection.selectAllRows();
            }

            vm.selectedAll = !vm.selectedAll;
        }

        function setupGrid() {
//            vm.gridOptions.enableRowHeaderSelection = false;
//            vm.gridOptions.enableScrollbars = false;
            vm.gridOptions.enableSelectAll = true;
            vm.gridOptions.enableSelectionBatchEvent = false;
            vm.gridOptions.multiSelect = true;

            vm.gridOptions.columnDefs = [
                {name: "id", width: "5%"},
                {name: "code", width: "10%"},
                {name: "description", width: "25%"}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedEntities.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedEntity = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedEntities.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedEntities.splice(index, 1);
                        }

                        vm.selectedEntity = _.last(vm.selectedEntities);
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