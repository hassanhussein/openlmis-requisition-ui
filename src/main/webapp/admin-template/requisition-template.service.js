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

    /**
     * @ngdoc service
     * @name admin-template.requisitionTemplateService
     *
     * @description
     * Allows user to perform operations on requisition template resource.
     *
     */
    angular.module('admin-template').service('requisitionTemplateService', requisitionTemplateService);

    requisitionTemplateService.$inject = ['requisitionUrlFactory', '$resource'];

    function requisitionTemplateService(requisitionUrlFactory, $resource) {

        var resource = $resource(requisitionUrlFactory('/api/requisitionTemplates/:id'), {}, {
            'getAll': {
                url: requisitionUrlFactory('/api/requisitionTemplates'),
                method: 'GET',
                isArray: true
            },
            'search': {
                url: requisitionUrlFactory('/api/requisitionTemplates/search'),
                method: 'GET'
            },
            'save': {
                method: 'PUT'
            }
        });

        this.get = get;
        this.getAll = getAll;
        this.search = search;
        this.save = save;

        /**
         * @ngdoc function
         * @name  get
         * @methodOf admin-template.requisitionTemplateService
         * @param {String} id Requisition template UUID
         * @returns {Promise} Requisition template info
         *
         * @description
         * Gets requisition template by id.
         */
        function get(id) {
            return resource.get({id: id}).$promise;
        }

        /**
         * @ngdoc function
         * @name  getAll
         * @methodOf admin-template.requisitionTemplateService
         * @returns {Promise} Array of all requisition templates
         *
         * @description
         * Gets all requisition templates.
         */
        function getAll() {
            return resource.getAll().$promise;
        }

        /**
         * @ngdoc function
         * @name  search
         * @methodOf admin-template.requisitionTemplateService
         * @param {String} programId Program UUID
         * @return {Promise} Requisition template for given program
         *
         * @description
         * Gets requisition template for given program.
         */
        function search(programId) {
            return resource.search({program: programId}).$promise;
        }

        /**
         * @ngdoc function
         * @name  save
         * @methodOf admin-template.requisitionTemplateService
         * @return {Promise} Saved requisition template
         *
         * @description
         * Saves changes to requisition template.
         */
        function save(template) {
            return resource.save({id: template.id}, template).$promise;
        }
    }

})();
