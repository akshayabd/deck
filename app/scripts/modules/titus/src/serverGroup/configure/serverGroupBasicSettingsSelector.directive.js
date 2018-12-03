'use strict';

const angular = require('angular');

import _ from 'lodash';

module.exports = angular
  .module('spinnaker.serverGroup.configure.titus.basicSettingsSelector', [])
  .directive('titusServerGroupBasicSettingsSelector', function() {
    return {
      restrict: 'E',
      scope: {
        command: '=',
        application: '=',
        hideClusterNamePreview: '=',
      },
      templateUrl: require('./serverGroupBasicSettingsDirective.html'),
      controller: 'titusServerGroupBasicSettingsSelectorCtrl as basicSettingsCtrl',
    };
  })
  .controller('titusServerGroupBasicSettingsSelectorCtrl', function($scope, $controller, $uibModalStack, $state) {
    angular.extend(
      this,
      $controller('BasicSettingsMixin', {
        $scope: $scope,
        $uibModalStack: $uibModalStack,
        $state: $state,
      }),
    );

    this.detailPattern = {
      test: function(detail) {
        var pattern = $scope.command.viewState.templatingEnabled
          ? /^([a-zA-Z_0-9._$-{}\\\^~]*(\${.+})*)*$/
          : /^[a-zA-Z_0-9._$-{}\\\^~]*$/;

        return isNotExpressionLanguage(detail) ? pattern.test(detail) : true;
      },
    };

    let isNotExpressionLanguage = field => {
      return field && !field.includes('${');
    };

    function updateImageId(oldValues, newValues) {
      // Make sure one of the watched fields was actually changed before updating imageId
      if (!_.isEqual(oldValues, newValues)) {
        if ($scope.command.repository && $scope.command.tag) {
          $scope.command.imageId = `${$scope.command.repository}:${$scope.command.tag}`;
        } else {
          delete $scope.command.imageId;
        }
      }
    }

    if ($scope.command.imageId) {
      const image = $scope.command.imageId;
      $scope.command.organization = '';
      const parts = image.split('/');
      if (parts.length > 1) {
        $scope.command.organization = parts.shift();
      }

      const rest = parts.shift().split(':');
      if ($scope.command.organization) {
        $scope.command.repository = `${$scope.command.organization}/${rest.shift()}`;
      } else {
        $scope.command.repository = rest.shift();
      }
      $scope.command.tag = rest.shift();
    }

    $scope.$watchGroup(['command.repository', 'command.tag'], updateImageId);
  });