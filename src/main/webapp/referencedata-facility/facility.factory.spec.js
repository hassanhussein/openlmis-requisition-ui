/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2013 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License along with this program.  If not, see http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org.
 */
describe('facilityFactory', function() {

    var $rootScope, $q, facility1, facility2, userPrograms, programService, facilityService, authorizationService, facilityFactory;

    beforeEach(function() {
        module('referencedata-facility', function($provide){
            programService = jasmine.createSpyObj('programService', ['getUserPrograms']);

            $provide.factory('programService', function() {
                return programService;
            });

            facilityService = jasmine.createSpyObj('facilityService', [
                'getUserSupervisedFacilities',
                'getFulfillmentFacilities'
            ]);

            $provide.factory('facilityService', function() {
                return facilityService;
            });
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            authorizationService = $injector.get('authorizationService');
            facilityFactory = $injector.get('facilityFactory');
        });

        facility1 = {
            id: '1',
            name: 'facility1'
        };
        facility2 = {
            id: '2',
            name: 'facility2'
        };

        userPrograms = [
            {
                name: 'program1',
                id: '1'
            },
            {
                name: 'program2',
                id: '2'
            }
        ];
    });

    it('should get all facilities and save them to storage', function() {
        var data,
            userId = '1';

        spyOn(authorizationService, 'getRightByName').andReturn({id: '1'});
        programService.getUserPrograms.andCallFake(function() {
            return $q.when(userPrograms);
        });
        facilityService.getUserSupervisedFacilities.andCallFake(function() {
            return $q.when([facility1, facility2]);
        });

        facilityFactory.getUserFacilities(userId, 'REQUISITION_VIEW').then(function(response) {
            data = response;
        });
        $rootScope.$apply();

        expect(data.length).toBe(2);
        expect(data[0].id).toBe(facility1.id);
        expect(data[1].id).toBe(facility2.id);
        expect(facilityService.getUserSupervisedFacilities.callCount).toEqual(2);
    });

    describe('getSupplyingFacilities', function() {

        var userId, ordersViewFacilities, podsManageFacilities;

        beforeEach(function() {
            userId = 'user-id';

            ordersViewFacilities = [
                createFacility('facility-one', 'facilityOne'),
                createFacility('facility-two', 'facilityTwo')
            ];

            podsManageFacilities = [
                createFacility('facility-two', 'facilityTwo'),
                createFacility('facility-three', 'facilityThree')
            ];

            spyOn(authorizationService, 'getRightByName').andCallFake(function(name) {
                if (name === 'ORDERS_VIEW') return {
                    id: 'orders-view-id'
                };
                if (name === 'PODS_MANAGE') return {
                    id: 'pods-manage-id'
                };
            });

            facilityService.getFulfillmentFacilities.andCallFake(function(params) {
                if (params.rightId === 'orders-view-id') return $q.when(ordersViewFacilities);
                if (params.rightId === 'pods-manage-id') return $q.when(podsManageFacilities);
            });
        });

        it('should fetch facilities for ORDERS_VIEW right', function() {
            facilityFactory.getSupplyingFacilities(userId);

            expect(facilityService.getFulfillmentFacilities).toHaveBeenCalledWith({
                userId: userId,
                rightId: 'orders-view-id'
            });
        });

        it('should fetch facilities for PODS_MANAGE right', function() {
            facilityFactory.getSupplyingFacilities(userId);

            expect(facilityService.getFulfillmentFacilities).toHaveBeenCalledWith({
                userId: userId,
                rightId: 'pods-manage-id'
            });
        });

        it('should resolve to set of facilities', function() {
            var result;

            facilityFactory.getSupplyingFacilities(userId).then(function(facilities) {
                result = facilities;
            });
            $rootScope.$apply();

            expect(result.length).toBe(3);
            expect(result[0]).toEqual(ordersViewFacilities[0]);
            expect(result[1]).toEqual(podsManageFacilities[0]);
            expect(result[2]).toEqual(podsManageFacilities[1]);
        });

    });

    describe('getRequestingFacilities', function() {

        var userId, requisitionCreateFacilities, requisitionAuthorizeFacilities;

        beforeEach(function() {
            userId = 'user-id';

            requisitionCreateFacilities = [
                createFacility('facility-one', 'facilityOne'),
                createFacility('facility-two', 'facilityTwo')
            ];

            requisitionAuthorizeFacilities = [
                createFacility('facility-two', 'facilityTwo'),
                createFacility('facility-three', 'facilityThree')
            ];

            spyOn(facilityFactory, 'getUserFacilities').andCallFake(function(userId, rightName) {
                if (rightName === 'REQUISITION_CREATE') {
                    return $q.when(requisitionCreateFacilities);
                }
                if (rightName === 'REQUISITION_AUTHORIZE') {
                    return $q.when(requisitionAuthorizeFacilities);
                }
            });
        });

        it('should fetch facilities for REQUISITION_CREATE right', function() {
            facilityFactory.getRequestingFacilities(userId);

            expect(facilityFactory.getUserFacilities)
                .toHaveBeenCalledWith(userId, 'REQUISITION_CREATE');
        });

        it('should fetch facilities for REQUISITION_AUTHORIZE right', function() {
            facilityFactory.getRequestingFacilities(userId);

            expect(facilityFactory.getUserFacilities)
                .toHaveBeenCalledWith(userId, 'REQUISITION_AUTHORIZE');
        });

        it('should resolve to set of facilities', function() {
            var result;

            facilityFactory.getRequestingFacilities(userId).then(function(facilities) {
                result = facilities;
            });
            $rootScope.$apply();

            expect(result.length).toBe(3);
            expect(result[0]).toEqual(requisitionCreateFacilities[0]);
            expect(result[1]).toEqual(requisitionAuthorizeFacilities[0]);
            expect(result[2]).toEqual(requisitionAuthorizeFacilities[1]);
        });

    });

    function createFacility(id, name) {
        return {
            id: id,
            name: name
        };
    }

});
