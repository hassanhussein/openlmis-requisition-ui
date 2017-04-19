/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    angular
        .module('requisition-initiate')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS', 'REQUISITION_STATUS'];

    function routes($stateProvider, REQUISITION_RIGHTS, REQUISITION_STATUS) {

        $stateProvider.state('openlmis.requisitions.initRnr', {
            url: '/initiate?supervised&program&facility&emergency',
            showInNavigation: true,
            priority: 11,
            label: 'requisitionInitiate.createAuthorize',
            controller: 'RequisitionInitiateController',
            controllerAs: 'vm',
            templateUrl: 'requisition-initiate/requisition-initiate.html',
            accessRights: [
                REQUISITION_RIGHTS.REQUISITION_CREATE,
                REQUISITION_RIGHTS.REQUISITION_DELETE,
                REQUISITION_RIGHTS.REQUISITION_AUTHORIZE
            ],
            resolve: {
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                supervisedPrograms: function (programService, user) {
                    return programService.getUserPrograms(user.user_id, false);
                },
                homePrograms: function (programService, user) {
                    return programService.getUserPrograms(user.user_id, true);
                },
                periods: function(periodFactory, $stateParams, $q, messageService) {
                    if ($stateParams.program && $stateParams.facility) {
                        var deferred = $q.defer(),
                            emergency = $stateParams.emergency === 'true';

                        periodFactory.get(
                            $stateParams.program,
                            $stateParams.facility,
                            emergency
                        ).then(function(periods) {
                            periods.forEach(setStatus(emergency));
                            deferred.resolve(periods);
                        }, deferred.reject);

                        return deferred.promise;
                    }
                    return undefined;

                    function setStatus(emergency) {
                        return function(period) {
                            if (isNotStarted(period, emergency)) {
                                period.rnrStatus = messageService.get('requisitionInitiate.notYetStarted');
                            }
                        };
                    }
                }
            }
        });

        function isNotStarted(period, emergency) {
            return emergency &&
                (period.rnrStatus == REQUISITION_STATUS.AUTHORIZED ||
                period.rnrStatus == REQUISITION_STATUS.IN_APPROVAL ||
                period.rnrStatus == REQUISITION_STATUS.APPROVED ||
                period.rnrStatus == REQUISITION_STATUS.RELEASED);
        }
    }

})();
