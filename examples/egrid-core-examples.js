var app = angular.module('egrid-core-example', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/color');

    $stateProvider
      .state('simple', {
        url: '/simple',
        templateUrl: 'partials/simple.html',
        controller: function($scope) {
          var graph = egrid.core.graph.graph()
          var grid = graph(
            [{text: 'hoge'}, {text: 'fuga'}, {text: 'piyo'}],
            [{source: 0, target: 1}, {source: 1, target: 2}]
          );
          var egm = egrid.core.egm()
            .size([600, 200]);
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css())
            .call(egm);
        }
      })
      .state('color', {
        url: '/color',
        templateUrl: 'partials/color.html',
        controller: function($scope) {
          var grid = $scope.grid = {
            nodes: [
              {text: 'aaa', size: 1, visible: true, color: '#ff0000', opacity: 0.5},
              {text: 'いいい', size: 2, visible: true, color: '#00ff00', opacity: 0.8},
              {text: 'ccc', size: 3, visible: true, color: '#0000ff', opacity: 0.2},
              {text: 'ddd', size: 4, visible: true, color: '#00ffff', opacity: 0.4},
              {text: 'eee', size: 5, visible: true, color: '#ff00ff', opacity: 0.6},
              {text: 'fff', size: 6, visible: false, color: '#ffff00', opacity: 0.7}
            ],
            links: [
              {upper: 0, lower: 1},
              {upper: 1, lower: 2},
              {upper: 3, lower: 1},
              {upper: 1, lower: 4},
              {upper: 1, lower: 5}
            ]
          };
          var egm = egrid.egm({
            enableClickNode: true,
            nodeColor: function(node) {
              return node.color;
            },
            nodeOpacity: function(node) {
              return node.opacity;
            },
            nodeScale: function(node) {
              return node.size;
            },
            nodeVisibility: function(node) {
              return node.visible;
            },
            size: [$('div.display-container').width(), 300],
          });
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css())
            .call(egm);

          $scope.update = function() {
            d3.select('svg.display').call(egm);
          };
        }
      })
      .state('css', {
        url: '/css',
        templateUrl: 'partials/css.html',
        controller: function($scope) {
          var grid = {
            nodes: ['hoge', 'fuga', 'piyo'],
            links: [{upper: 0, lower: 1}, {upper: 1, lower: 2}]
          };
          var egm = egrid.egm()
            .nodeText(Object)
            .size([$('div.display-container').width(), 400]);
          $scope.css = {
            backgroundColor: '#ffffff',
            strokeColor: '#000000',
            upperStrokeColor: '#ff0000',
            lowerStrokeColor: '#0000ff',
            selectedStrokeColor: '#ff00ff'
          };
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css($scope.css))
            .call(egm);

          $scope.update = function() {
            d3.select('svg.display').call(egm.css($scope.css));
          };
        }
      })
      ;
  })
  ;
