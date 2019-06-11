import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { NotebookTools, INotebookTools, INotebookTracker } from '@jupyterlab/notebook';
import { Message } from '@phosphor/messaging';
import { Cell, CodeCell } from '@jupyterlab/cells';
import { Widget } from '@phosphor/widgets';
import { PanelLayout } from '@phosphor/widgets';
import { IObservableString } from '@jupyterlab/observables';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import '../style/index.css';
import MfeComponent from './MfeComponent';
import { MfeObj } from './components/ChoiceComponent';
import ButtonExtension from './MfeButton';

const MFE_SPLIT_KEY = '#_#_#mfeducation';
const MFE_VIEW_ID = 'mfe-view';

class MyContentWidget extends Widget {
  constructor(notebook_Tracker: INotebookTracker) {
    super();
    this.id = MFE_VIEW_ID;
    this.addClass('jp-mfe-widget');
    this.notebookTracker = notebook_Tracker;
    this.renderView();
    this.onChangeContent = this.onChangeContent.bind(this);
    this.addChoiceItem = this.addChoiceItem.bind(this);
    this.deleteChoiceItem = this.deleteChoiceItem.bind(this);
  }

  // 重新渲染cellview
  updateInnerValue(value: string[]) {
    this.innerValue = value;
    this.renderView();
  }

  // 修改内容
  onChangeContent(title: string, mfeObj: MfeObj) {
    console.log(title, mfeObj);
    const targetMfeObjIndex = this.mfeObjs.findIndex(item => item.title === title);
    if (targetMfeObjIndex !== -1) {
      this.mfeObjs[targetMfeObjIndex] = mfeObj;
    }
    let jsonArr = this.mfeObjs.map(item => JSON.stringify(item))
    jsonArr.unshift(MFE_SPLIT_KEY);
    const jsonStr = jsonArr.join(`\n${MFE_SPLIT_KEY}\n`);
    this.notebookTracker.activeCell.model.value.text = jsonStr;
  }

  // 添加选择题
  addChoiceItem(mfeObj: MfeObj) {
    this.mfeObjs.push(mfeObj);
    let jsonArr = this.mfeObjs.map(item => JSON.stringify(item))
    jsonArr.unshift(MFE_SPLIT_KEY);
    const jsonStr = jsonArr.join(`\n${MFE_SPLIT_KEY}\n`);
    this.notebookTracker.activeCell.model.value.text = jsonStr;
  }

  // 删除选择题
  deleteChoiceItem(title: string) {
    const targetMfeObjIndex = this.mfeObjs.findIndex(item => item.title === title);
    if (targetMfeObjIndex !== -1) {
      this.mfeObjs.splice(targetMfeObjIndex, 1);
      let jsonArr = this.mfeObjs.map(item => JSON.stringify(item));
      jsonArr.unshift(MFE_SPLIT_KEY);
      const jsonStr = jsonArr.join(`\n${MFE_SPLIT_KEY}\n`);
      this.notebookTracker.activeCell.model.value.text = jsonStr;
    }
  }

  // 渲染view
  renderView() {
    this.mfeObjs = this.innerValue.filter((item: string) => item.trim() !== '').map((item: string, index: number) => {
      try {
        const mfeObj: MfeObj = JSON.parse(`${item.replace(/'/g, '"')}`);
        if (["choice", 'judge'].find(type => type === mfeObj.type)) {
          return mfeObj;
        } else {
          console.log('type不等于choice、judge');
        }
      } catch (error) {
        console.log('解析错误!', item);
        console.log(error);
      }
    });
    ReactDOM.render(
      <MfeComponent
        mfeObjs={this.mfeObjs}
        onChangeContent={this.onChangeContent}
        addChoiceItem={this.addChoiceItem}
        deleteChoiceItem={this.deleteChoiceItem}
      />,
      this.node
    );
  }

  notebookTracker: INotebookTracker = null;
  widget: MyContentWidget = null;
  innerValue: string[] = [];
  mfeObjs: MfeObj[];
}

export class MyTool extends NotebookTools.Tool {

  constructor(notebook_Tracker: INotebookTracker, app: JupyterLab) {
    super()
    this.notebook_Tracker = notebook_Tracker;
  }

  protected onActiveCellChanged(msg: Message): void {
    console.log('激活cell-start')
    let cell: Cell = this.notebookTools.activeCell;
    if (!cell || !cell.inputArea) return;
    const layout: PanelLayout = cell.inputArea.layout as PanelLayout;
    const isMfeCell = cell.model.value.text.includes(MFE_SPLIT_KEY);
    if (isMfeCell) {
      let myWidget = layout.widgets.find((item: Widget) => item.id === MFE_VIEW_ID) as MyContentWidget;
      this.addMyWidget(myWidget, layout, cell);
    }

    cell.model.value.changed.connect((msg: IObservableString, changedModel: IObservableString.IChangedArgs) => {
      console.log('检测cell model内容发生改变了!');
      console.log(msg, changedModel);
      const isMfeCell = cell.model.value.text.includes(MFE_SPLIT_KEY);
      let myWidget = layout.widgets.find((item: Widget) => item.id === MFE_VIEW_ID) as MyContentWidget;
      if (isMfeCell) {
        this.addMyWidget(myWidget, layout, cell);
      } else {
        if (myWidget) {
          layout.removeWidget(myWidget);
        }
      }
    });
    console.log(cell);
    console.log('激活cell-end')
  }

  private addMyWidget(myWidget: MyContentWidget, layout: PanelLayout, cell: Cell) {
    // 如果是选择题，隐藏之前的输入框。
    layout.widgets.find(item => item.node.classList.contains('jp-InputArea-editor')).hide();
    // 如果是CodeCell框，隐藏掉该cell的输出框。
    if (cell instanceof CodeCell) {
      cell.outputArea.hide();
    }

    if (!myWidget) {
      myWidget = new MyContentWidget(this.notebook_Tracker);
      layout.addWidget(myWidget);
    }
    const innerValue: string[] = cell.model.value.text.replace(/\s/g, '').split(MFE_SPLIT_KEY);
    myWidget.updateInnerValue(innerValue);
  }

  // protected onAfterAttach() {
  //   this.notebook_Tracker.currentWidget.model.cells.changed.connect((cellList: IObservableList<ICellModel>) => {
  //     console.log('当前的cell-model改变了');
  //     console.log(cellList);
  //   });
  // }

  notebook_Tracker: INotebookTracker;
}

/**
 * Initialization data for the jupyterlab-celltags extension.
 */
function activate(
  app: JupyterLab,
  mfeTools: NotebookTools,
  notebook_Tracker: INotebookTracker
) {
  app.docRegistry.addWidgetExtension("choiceBtn", new ButtonExtension(notebook_Tracker));
  mfeTools.addItem({ tool: new MyTool(notebook_Tracker, app) });
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'mfe-cell',
  autoStart: true,
  requires: [INotebookTools, INotebookTracker],
  activate: activate
};

export default extension;

/**
#_#_#mfeducation
{
"type": 'choice',
"title": "你最喜欢的颜色",
"option": [
    {'A': 'white'},
    {'B': 'black'},
    {'C': 'blue'},
    {'D': 'red'}
],
"answer": 'A'
}

#_#_#mfeducation
{
'type': 'choice',
'title': '你是小明吗?',
'option': [ {'对': ''},
    {'不对': ''}],
"answer": "对"
}

 */

/**
 import { Dialog, showDialog } from '@jupyterlab/apputils';
 onShowAlert() {
   void showDialog({
     title: `you are editing....`,
     buttons: [
       Dialog.cancelButton(),
       Dialog.warnButton({ label: 'hello' })
     ]
   }).then(result => {
     if (result.button.accept) {
       console.log('dddd');
     }
   });
 }

 */