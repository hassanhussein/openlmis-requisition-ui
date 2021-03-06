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
     * @name admin-template-list.templateListFactory
     *
     * @description
     * Provides methods for displaying template.
     */
    angular
        .module('admin-template-list')
        .factory('templateListFactory', factory);

    function factory() {

        var factory = {
            getProgramTemplates: getProgramTemplates,
            getTemplateFacilityTypes: getTemplateFacilityTypes
        };

        return factory;

        /**
         * @ngdoc method
         * @methodOf admin-template-list.templateListFactory
         * @name getProgramTemplates
         *
         * @description
         * Returns programs with its templates.
         *
         * @param   {Array} templates   all templates
         * @param   {Array} programs    all programs
         * @return  {Array}             array of programs with its templates
         */
        function getProgramTemplates(templates, programs) {
            var programTemplates = {};
            programs.forEach(function(program) {
                programTemplates[program.id] = [];
                templates.filter(function(template) {
                    if (template.program.id === program.id) {
                        programTemplates[program.id].push(template);
                    }
                });
            });
            return programTemplates;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template-list.templateListFactory
         * @name getTemplateFacilityTypes
         *
         * @description
         * Returns templates with its facility types.
         *
         * @param   {Array} templates       all templates
         * @param   {Array} facilityTypes   all facility types
         * @return  {Array}                 array of templates with its facility types
         */
        function getTemplateFacilityTypes(templates, facilityTypes) {
            var templateTypes = {};
            templates.forEach(function(template) {
                templateTypes[template.id] = [];
                template.facilityTypes.forEach(function(type) {
                    var filtered = facilityTypes.filter(function(facilityType) {
                        return facilityType.id === type.id;
                    });
                    if (filtered[0]) {
                        templateTypes[template.id].push(filtered[0]);
                    }
                });
            });
            return templateTypes;
        }
    }
})();
