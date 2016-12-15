/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2013 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program.  If not, see http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name openlmis.requisitions.InitiateRnrController
     * @description
     * Controller responsible for actions connected with displaying available periods and
     * initiating or navigating to an existing requisition.
     */
    angular
        .module('openlmis.requisitions')
        .controller('InitiateRnrController', InitiateRnrController);

    InitiateRnrController.$inject = ['$scope', 'messageService', 'facility', 'user', 'supervisedPrograms', 'PeriodFactory',
    'RequisitionService', '$state', 'DateUtils', 'Status', 'LoadingModalService', 'Notification',
     'AuthorizationService', '$q', 'RequisitionRights', 'SupervisedFacilities'];

    function InitiateRnrController($scope, messageService, facility, user, supervisedPrograms, PeriodFactory,
    RequisitionService, $state, DateUtils, Status, LoadingModalService, Notification,
    AuthorizationService, $q, RequisitionRights, SupervisedFacilities) {

        /**
         * @ngdoc property
         * @name emergency
         * @propertyOf openlmis.requisitions.InitiateRnrController
         * @type {Boolean}
         *
         * @description
         * Holds a boolean indicating if the currently selected requisition type is standard or emergency
         */
        $scope.emergency = false;

        /**
         * @ngdoc property
         * @name facilities
         * @propertyOf openlmis.requisitions.InitiateRnrController
         * @type {Array}
         *
         * @description
         * Holds available facilities based on the selected type and/or programs
         */
        $scope.facilities = [];

        /**
         * @ngdoc property
         * @name supervisedPrograms
         * @propertyOf openlmis.requisitions.InitiateRnrController
         * @type {Array}
         *
         * @description
         * Holds available programs where user has supervisory permissions.
         */
        $scope.supervisedPrograms = supervisedPrograms;

        /**
         * @ngdoc property
         * @name homeFacilityPrograms
         * @propertyOf openlmis.requisitions.InitiateRnrController
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        $scope.homeFacilityPrograms = facility.supportedPrograms;

        /**
         * @ngdoc property
         * @name isSupervised
         * @propertyOf openlmis.requisitions.InitiateRnrController
         * @type {Integer}
         *
         * @description
         * Holds currently selected facility selection type:
         *  false - my facility
         *  true - supervised facility
         */
        $scope.isSupervised = false;

        /**
         * @ngdoc property
         * @name periodGridOptions
         * @propertyOf openlmis.requisitions.InitiateRnrController
         *
         * @description
         * Holds configuration of the period grid
         */
        $scope.periodGridOptions = {
            data: 'periodGridData',
            canSelectRows: false,
            displayFooter: false,
            displaySelectionCheckbox: false,
            enableColumnResize: true,
            showColumnMenu: false,
            showFilter: false,
            enableSorting: false,
            columnDefs: [
                {
                    field: 'name',
                    displayName: messageService.get('label.periods')
                }, {
                    field: 'startDate',
                    displayName: messageService.get('period.header.startDate'),
                    type: 'date',
                    cellFilter: DateUtils.FILTER
                }, {
                    field: 'endDate',
                    displayName: messageService.get('period.header.endDate'),
                    type: 'date',
                    cellFilter: DateUtils.FILTER
                }, {
                    field: 'rnrStatus',
                    displayName: messageService.get('label.rnr.status')
                }, {
                    name: 'proceed',
                    displayName: '',
                    cellTemplate: 'requisitions/init-rnr-button.html'
                }
            ]
        };

        $scope.supervisedFacilitiesDisabled = _.isEmpty($scope.supervisedPrograms);

        // Functions

        $scope.loadPeriods = loadPeriods;

        $scope.programOptionMessage = programOptionMessage;

        $scope.initRnr = initRnr;

        $scope.loadFacilityData = loadFacilityData;

        $scope.loadFacilities = loadFacilities;

        if (facility) {
            $scope.facilities = [facility];

            $scope.selectedProgram = undefined;

            $scope.facilityDisplayName = facility.code + '-' + facility.name;
            $scope.selectedFacilityId = facility.id;
            $scope.homeFacilityPrograms = facility.supportedPrograms;
            $scope.programs = facility.supportedPrograms;
            if (_.isEmpty($scope.programs)) {
                $scope.error = messageService.get("msg.no.program.available");
            } else if ($scope.programs.length === 1) {
                $scope.selectedProgram = $scope.programs[0];
                $scope.loadPeriods();
            }
        } else {
            $scope.facilityDisplayName = messageService.get("label.none.assigned");
            $scope.error = messageService.get("error.rnr.user.facility.not.assigned");
        }

        /**
         * @ngdoc function
         * @name programOptionMessage
         * @methodOf openlmis.requisitions.InitiateRnrController
         *
         * @description
         * Determines a proper message for the programs dropdown, based on the presence of programs.
         *
         * @return {String} localized message
         */
        function programOptionMessage() {
            return $scope.programs === undefined || _.isEmpty($scope.programs) ? messageService.get("label.none.assigned") : messageService.get("label.select.program");
        };

        /**
         * @ngdoc function
         * @name loadPeriods
         * @methodOf openlmis.requisitions.InitiateRnrController
         *
         * @description
         * Responsible for displaying and updating a grid, containing available periods for the
         * selected program, facility and type. It will set an error message if no periods have
         * been found for the given parameters. It will also filter out periods for which there
         * already exists a requisition with an AUTHORIZED, APPROVED or RELEASED status.
         */
        function loadPeriods() {
            $scope.periodGridData = [];
            if (!($scope.selectedProgram && $scope.selectedFacilityId)) {
                return;
            }
            LoadingModalService.open();
            PeriodFactory.get($scope.selectedProgram.id, $scope.selectedFacilityId, $scope.emergency).then
            (function(data) {
                if (data.length === 0) {
                    Notification.error('msg.no.period.available');
                } else {
                    $scope.periodGridData = data;
                    $scope.error = "";
                }
                data.forEach(function (period) {
                    if ($scope.emergency && (period.rnrStatus == Status.AUTHORIZED ||
                    period.rnrStatus == Status.APPROVED ||
                    period.rnrStatus == Status.RELEASED)) {
                        period.rnrStatus = messageService.get("msg.rnr.not.started");
                    }
                });
                LoadingModalService.close();
            }).catch(function() {
                Notification.error('msg.no.period.available');
                LoadingModalService.close();
            });
        };

        /**
         * @ngdoc function
         * @name initRnr
         * @methodOf openlmis.requisitions.InitiateRnrController
         *
         * @description
         * Responsible for initiating and/or navigating to the requisition, based on the specified
         * period. If the provided period does not have a requisition associated with it, one
         * will be initiated for the currently selected facility, program, emergency status and
         * provided period. In case of a successful response, a redirect to the newly initiated
         * requisition is made. Otherwise an error about failed requisition initiate is shown. If
         * the provided period is already associated with a requisition, the function only
         * performs a redirect to that requisition.
         *
         * @param {Object} selectedPeriod  a period to initiate or proceed with the requisition for
         */
        function initRnr(selectedPeriod) {
            $scope.error = "";
            if (!selectedPeriod.rnrId ||
            selectedPeriod.rnrStatus == messageService.get("msg.rnr.not.started")){
                RequisitionService.initiate($scope.selectedFacilityId,
                $scope.selectedProgram.id,
                selectedPeriod.id,
                $scope.emergency).then(
                function (data) {
                    $state.go('requisitions.requisition.fullSupply', {
                        rnr: data.id
                    });
                }, function () {
                    Notification.error('error.requisition.not.initiated');
                });
            } else {
                $state.go('requisitions.requisition.fullSupply', {
                    rnr: selectedPeriod.rnrId
                });
            }
        };

        /**
         * @ngdoc function
         * @name loadFacilityData
         * @methodOf openlmis.requisitions.InitiateRnrController
         *
         * @description
         * Responsible for displaying and updating select elements that allow to choose
         * program and facility to initiate or proceed with the requisition for.
         * If selected type is equal 1 then it will display all programs where the current
         * user has supervisory permissions. If the selected type is equal 0, then it will
         * display list of programs that are available in user's home facility.
         *
         * @param {Object} isSupervised  a type of facility to initiate or proceed with the requisition for
         */
        function loadFacilityData(isSupervised) {
            if (isSupervised) {
                $scope.programs = $scope.supervisedPrograms;
                $scope.facilities = [];
                $scope.selectedFacilityId = undefined;
            } else {
                $scope.programs = $scope.homeFacilityPrograms;
                $scope.facilities = [facility];
                $scope.selectedFacilityId = facility.id;
            }
            $scope.selectedProgram = undefined;
        };

        /**
         * @ngdoc function
         * @name loadFacilities
         * @methodOf openlmis.requisitions.InitiateRnrController
         *
         * @description
         * Responsible for providing a list of facilities where selected program is active and
         * where the current user has supervisory permissions.
         *
         * @param {Object} selectedProgram selected program where user has supervisory permissions
         */
        function loadFacilities(selectedProgram) {
            if (selectedProgram) {
                LoadingModalService.open();
                var createRightId = AuthorizationService.getRightIdByName(RequisitionRights.REQUISITION_CREATE);
                var authorizeRightId = AuthorizationService.getRightIdByName(RequisitionRights.REQUISITION_AUTHORIZE);

                $q.all([
                    SupervisedFacilities(user.user_id, selectedProgram.id, createRightId),
                    SupervisedFacilities(user.user_id, selectedProgram.id, authorizeRightId)
                ])
                    .then(function (facilities) {
                        $scope.facilities = facilities[0].concat(facilities[1]);
                    })
                    .catch(function (error) {
                        Notification.error('msg.error.occurred');
                        LoadingModalService.close();
                    })
                    .finally(LoadingModalService.close());
            }
        }
    }
})();