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
     * @ngdoc directive
     * @restrict 'C'
     * @name openlmis-table.directive:openlmisTableContainer
     *
     * @description
     * Checks if there is a single table element with in the container, if so the contents are arranged to meet our custom layout
     */
    angular
        .module('openlmis-table')
        .directive('openlmisTableContainer', directive);

    directive.$inject = [];

    function directive() {
        var directive = {
            link: link,
            restrict: 'C',
            priority: 10
        };
        return directive;
    }

    function link(scope, element) {
        if (element.children('table').length == 1) {
            element.children('table').wrap('<div class="openlmis-flex-table"></div>');
        }
    }

})();
