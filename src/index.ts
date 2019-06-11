import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import {
  NotebookTools,
  INotebookTools,
  INotebookTracker
} from '@jupyterlab/notebook';
import { Message } from '@phosphor/messaging';
import { Cell, CodeCell, ICellModel } from '@jupyterlab/cells';
import { Widget } from '@phosphor/widgets';
import { PanelLayout } from '@phosphor/widgets';
import { IObservableString, IObservableList } from '@jupyterlab/observables';
import 'antd/dist/antd.css';
import '../style/index.css';
import MyContentWidget, { MFE_SPLIT_KEY, MFE_VIEW_ID } from './MyContentWidget';
import ButtonExtension from './MfeButton';

class MyTool extends NotebookTools.Tool {
  constructor(notebook_Tracker: INotebookTracker, app: JupyterLab) {
    super();
    this.notebook_Tracker = notebook_Tracker;
  }

  protected onActiveCellChanged(msg: Message): void {
    console.log('激活onActiveCellChanged---start');
    let cell: Cell = this.notebookTools.activeCell;
    if (!cell || !cell.inputArea) return;
    const layout: PanelLayout = cell.inputArea.layout as PanelLayout;
    const isMfeCell = cell.model.value.text.includes(MFE_SPLIT_KEY);
    if (isMfeCell) {
      let myWidget = layout.widgets.find(
        (item: Widget) => item.id === MFE_VIEW_ID
      ) as MyContentWidget;
      this.addMyWidget(myWidget, layout, cell);
    }
    cell.model.value.changed.connect(
      (
        msg: IObservableString,
        changedModel: IObservableString.IChangedArgs
      ) => {
        console.log('检测cell model内容发生改变了!');
        console.log(msg, changedModel);
        const isMfeCell = cell.model.value.text.includes(MFE_SPLIT_KEY);
        let myWidget = layout.widgets.find(
          (item: Widget) => item.id === MFE_VIEW_ID
        ) as MyContentWidget;
        if (isMfeCell) {
          this.addMyWidget(myWidget, layout, cell);
        } else {
          if (myWidget) {
            layout.removeWidget(myWidget);
          }
        }
      }
    );
    console.log(cell);
    console.log('激活onActiveCellChanged-----end');
  }

  private addMyWidget(
    myWidget: MyContentWidget,
    layout: PanelLayout,
    cell: Cell
  ) {
    // 如果是选择题，隐藏之前的输入框。
    layout.widgets
      .find(item => item.node.classList.contains('jp-InputArea-editor'))
      .hide();
    // 如果是CodeCell框，隐藏掉该cell的输出框。
    if (cell instanceof CodeCell) {
      cell.outputArea.hide();
    }

    if (!myWidget) {
      myWidget = new MyContentWidget(this.notebook_Tracker);
      layout.addWidget(myWidget);
    }
    const innerValue: string[] = cell.model.value.text
      .replace(/\s/g, '')
      .split(MFE_SPLIT_KEY);
    myWidget.updateInnerValue(innerValue);
  }

  protected onAfterAttach() {
    this.notebook_Tracker.currentWidget.context.ready.then(() => {
      this.notebook_Tracker.currentWidget.content.widgets.forEach(
        (cell: Cell) => {
          const isMfeCell = cell.model.value.text.includes(MFE_SPLIT_KEY);
          const layout: PanelLayout = cell.inputArea.layout as PanelLayout;
          let myWidget = layout.widgets.find(
            (item: Widget) => item.id === MFE_VIEW_ID
          ) as MyContentWidget;
          if (isMfeCell) {
            this.addMyWidget(myWidget, layout, cell);
          } else {
            if (myWidget) {
              layout.removeWidget(myWidget);
            }
          }
        }
      );
    });
  }

  notebook_Tracker: INotebookTracker;
}

/**
 * Initialization data for the jupyterlab extension.
 */
function activate(
  app: JupyterLab,
  mfeTools: INotebookTools,
  notebook_Tracker: INotebookTracker
) {
  mfeTools.addItem({ tool: new MyTool(notebook_Tracker, app) });
  app.docRegistry.addWidgetExtension(
    'Notebook',
    new ButtonExtension(notebook_Tracker)
  );
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'mfe-cell',
  autoStart: true,
  requires: [INotebookTools, INotebookTracker],
  activate: activate
};

export default extension;

/**

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

this.notebook_Tracker.currentWidget.model.cells.changed.connect((cellList: IObservableList<ICellModel>) => {
      console.log('当前的cell-model改变了');
      console.log(cellList);
    });

 */
