import {Component, Inject, bind, NgZone} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';

import {Dispatcher} from './dispatcher/dispatcher';

import {BackendActions} from './actions/backend-actions/backend-actions';
import {UserActions} from './actions/user-actions/user-actions';

import {UserActionType}
  from './actions/action-constants';

import {ComponentDataStore}
  from './stores/component-data/component-data-store';

import {BackendMessagingService} from './channel/backend-messaging-service';

import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import AppTrees from './components/app-trees/app-trees';

import * as Rx from 'rxjs';

import {ParseUtils} from './utils/parse-utils';

const BASE_STYLES = require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  directives: [TreeView, InfoPanel, AppTrees],
  template: `
    <div class="clearfix">
      <div class="col col-6 overflow-hidden vh-100
      border-right border-color-dark"
      [ngClass]="{'col-12 overflow-scroll': selectedTabIndex > 0}">
        <bt-app-trees
          [selectedTabIndex]="selectedTabIndex"
          [selectedNode]="selectedNode"
          [openedNodes]="openedNodes"
          [routerTree]="routerTree"
          [tree]="tree"
          [changedNodes]="changedNodes"
          (tabChange)="tabChange($event)">
        </bt-app-trees>
      </div>
      <div class="col col-6 overflow-hidden vh-100"
      [hidden]="selectedTabIndex > 0">
        <bt-info-panel [tree]="tree" [node]="selectedNode"></bt-info-panel>
      </div>
    </div>`
})
/**
 * Augury App
 */
class App {

  private tree: any;
  private previousTree: any;
  private routerTree: any;
  private selectedTabIndex = 0;
  private selectedNode: any;
  private openedNodes: Array<any> = [];
  private changedNodes: any = [];

  constructor(
    private backendAction: BackendActions,
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone,
    private parseUtils: ParseUtils
  ) {

    this.userActions.startComponentTreeInspection();

    // Listen for changes in selected node
    this.componentDataStore.dataStream
      .filter((data: any) => data.action &&
              data.action === UserActionType.START_COMPONENT_TREE_INSPECTION)
      .subscribe(data => {
        if (!this.tree) {
          this.tree = data.componentData;
        } else {
          this.previousTree = this.tree;
          this.tree = data.componentData;
          this.changedNodes =
            parseUtils.getChangedNodes(this.previousTree, this.tree);
        }
        if (data.selectedNode) {
          const treeMap = this.parseUtils.getNodesMap(this.tree);
          this.selectedNode = JSON.parse(treeMap[data.selectedNode.id]);
        }
        this.openedNodes = data.openedNodes;
        this._ngZone.run(() => undefined);
      }
    );

    this.componentDataStore.dataStream
      .filter((data: any) => data.action &&
              data.action === UserActionType.RENDER_ROUTER_TREE)
      .subscribe(data => {
        this.routerTree = data.tree.tree;
        this._ngZone.run(() => undefined);
      }
    );

    this.componentDataStore.dataStream
      .debounce(() => Rx.Observable.timer(250))
      .filter((data: any) => {
        return (data.action &&
          data.action !== UserActionType.GET_DEPENDENCIES &&
          data.action !== UserActionType.RENDER_ROUTER_TREE &&
          data.action !== UserActionType.START_COMPONENT_TREE_INSPECTION &&
          data.action !== UserActionType.CLEAR_TREE);
      })
      .subscribe(({ selectedNode }) => {
        this.selectedNode = selectedNode;
        this._ngZone.run(() => undefined);
      });

    this.componentDataStore.dataStream
      .filter((data: any) => {
        return (data.action &&
          data.action === UserActionType.CLEAR_TREE);
      })
      .subscribe(() => {
        this.tree = [];
        this.previousTree = [];
        this.selectedNode = undefined;
        this._ngZone.run(() => undefined);
      });
  }

  tabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 1) {
      this.userActions.renderRouterTree();
    }
  }
}

bootstrap(App, [
  BackendActions,
  UserActions,
  Dispatcher,
  ComponentDataStore,
  BackendMessagingService
]);
