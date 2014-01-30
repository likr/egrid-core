/// <reference path="../ts-definitions/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="../core/egm.ts"/>
/// <reference path="../core/egm-ui.ts"/>
/// <reference path="../model/participant.ts"/>
/// <reference path="../model/project-grid.ts"/>

module egrid.app {
  export class ProjectGridController {
    projectKey : string;
    egm : EGM;
    filter : {} = {};
    participants : model.Participant[];
    participantState : {} = {};

    constructor($q, $routeParams, $modal, private $scope) {
      this.projectKey = $routeParams.projectId;

      var egmui = egrid.egmui();
      this.egm = egmui.egm();
      this.egm.showRemoveLinkButton(true);
      this.egm.options().scalingConnection = false;
      d3.select("#display")
        .attr({
          width: $(window).width(),
          height: $(window).height(),
        })
        .call(this.egm.display($(window).width(), $(window).height()))
        ;
      d3.select(window)
        .on('resize', () => {
          d3.select("#display")
            .attr({
              width: $(window).width(),
              height: $(window).height(),
            })
            ;
        })
        ;

      d3.select("#undoButton")
        .call(egmui.undoButton()
            .onEnable(() => {
              d3.select("#undoButtonContainer").classed("disabled", false);
            })
            .onDisable(() => {
              d3.select("#undoButtonContainer").classed("disabled", true);
            }));
      d3.select("#redoButton")
        .call(egmui.redoButton()
            .onEnable(() => {
              d3.select("#redoButtonContainer").classed("disabled", false);
            })
            .onDisable(() => {
              d3.select("#redoButtonContainer").classed("disabled", true);
            }));

      d3.select("#removeNodeButton")
        .call(egmui.removeNodeButton()
            .onEnable(selection => this.showNodeController(selection))
            .onDisable(() => this.hideNodeController())
        );
      d3.select("#mergeNodeButton")
        .call(egmui.mergeNodeButton()
            .onEnable(selection => this.showNodeController(selection))
            .onDisable(() => this.hideNodeController())
        );

      d3.select("#filterButton")
        .on("click", () => {
          var node = this.egm.selectedNode();
          this.participants.forEach(participant => {
            if (node) {
              this.participantState[participant.key()] = node.participants.indexOf(participant.key()) >= 0;
            } else {
              this.participantState[participant.key()] = false;
            }
          });
          var m = $modal.open({
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/partials/filter-participants-dialog.html',
            controller: ($scope, $modalInstance) => {
              $scope.results = this.filter;
              $scope.participants = this.participants;
              $scope.active = this.participantState;
              $scope.close = () => {
                $modalInstance.close($scope.results);
              };
            },
          });
          m.result.then(result => {
            this.egm.nodes().forEach(d => {
              m.active = m.participants.some(key => result[key]);
            });
            this.egm
              .draw()
              .focusCenter()
              ;
          });
          $scope.$apply();
        })
        ;

      d3.select("#layoutButton")
        .on("click", () => {
          var m = $modal.open({
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/partials/setting-dialog.html',
            controller: ($scope, $modalInstance) => {
              $scope.options = this.egm.options();
              $scope.ViewMode = egrid.ViewMode;
              $scope.InactiveNode = egrid.InactiveNode;
              $scope.close = () => {
                $modalInstance.close();
              }
            },
          });
          m.result.then(() => {
            this.egm.draw();
          });
          $scope.$apply();
        })
        ;

      $q.when(model.ProjectGrid.get(this.projectKey))
        .then((grid : model.ProjectGrid) => {
          var nodes = grid.nodes.map(d => new Node(d.text, d.weight, d.original, d.participants));
          var links = grid.links.map(d => new Link(nodes[d.source], nodes[d.target], d.weight));
          this.egm
            .nodes(nodes)
            .links(links)
            .draw()
            .focusCenter()
            ;
        })
        ;

      $q.when(model.Participant.query(this.projectKey))
        .then((participants : model.Participant[]) => {
          this.participants = participants;
          this.participants.forEach(participant => {
            this.participantState[participant.key()] = false;
            this.filter[participant.key()] = true;
          });
        })
        ;
    }

    private showNodeController(selection) {
      if (!selection.empty()) {
        var nodeRect = selection.node().getBoundingClientRect();
        var controllerWidth = $("#nodeController").width();
        d3.select("#nodeController")
          .classed("invisible", false)
          .style("top", nodeRect.top + nodeRect.height + 10 + "px")
          .style("left", nodeRect.left + (nodeRect.width - controllerWidth) / 2 + "px")
          ;
      }
    }

    private hideNodeController() {
      d3.select("#nodeController")
        .classed("invisible", true);
    }

    private moveNodeController(selection) {
      var nodeRect = selection.node().getBoundingClientRect();
      var controllerWidth = $("#nodeController").width();
      d3.select("#nodeController")
        .style("top", nodeRect.top + nodeRect.height + 10 + "px")
        .style("left", nodeRect.left + (nodeRect.width - controllerWidth) / 2 + "px")
        ;
    }
  }
}