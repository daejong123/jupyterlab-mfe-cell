import { JupyterLab, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { NotebookTools, INotebookTools, INotebookTracker } from '@jupyterlab/notebook';
import { Message } from '@phosphor/messaging';
import { Cell, ICellModel } from '@jupyterlab/cells';
import { Widget } from '@phosphor/widgets';
import { PanelLayout } from '@phosphor/widgets';
import { IObservableString, IObservableList } from '@jupyterlab/observables';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import '../style/index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Button } from 'antd';
import { Radio, message } from 'antd';

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
    {'不对': ''}]
}


 */

const MFE_SPLIT_KEY = '#_#_#mfeducation';
const MFE_VIEW_ID = 'mfe-view';

class ChoiceComponent extends React.Component<MfeObj, any> {

  constructor(props: MfeObj) {
    super(props);
    this.state = {
      value: '',
    };
  }

  onChange = (e: any) => {
    console.log('radio checked', e.target.value);
    message.success(`你选择了${e.target.value}`)
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const { title, option } = this.props;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        <h2>{title}</h2>
        <div>
          <Radio.Group onChange={this.onChange} value={this.state.value}>
            {
              (option as { [key: string]: string }[]).map((item) => {
                const choiceOption = Object.keys(item)[0];
                return (
                  <Radio style={radioStyle} value={choiceOption}>
                    {choiceOption}. {item[choiceOption]}
                  </Radio>
                )
              })
            }
          </Radio.Group>
        </div>
        <hr />
      </div>
    )
  }
}

interface MfeObj {
  type: string,
  title: string,
  option: { [key: string]: string }[] | string[]
}

class MfeComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      btnMsg: 'like it?'
    };
    this.handleClick = this.handleClick.bind(this); 
  }

  handleClick(e: any) {
    this.setState((state: any, props: any) => {
      let result = 'like it?'
      if (state.btnMsg === result) {
        result = 'you like it!'
      }
      return {
        btnMsg: result
      }
    })
  }

  render() {
    const { btnMsg } = this.state;
    const { innerValue } = this.props;
    console.log(innerValue);
    return (
      <div>
        <h1>hello world</h1>
        <Button onClick={this.handleClick}>{btnMsg}</Button>
        {
          innerValue.filter((item: string) => item.trim() !== '').map((item: string, index: number) => {
            try {
              const mfeObj: MfeObj = JSON.parse(`${item.replace(/'/g, '"')}`);
              console.log(mfeObj)
              if (mfeObj.type === "choice") {
                return <ChoiceComponent {...mfeObj} key={index} />;
              } else {
                console.log('不等于 choice');
              }
            } catch (error) {
              message.error('题目格式解析错误，请更正！');
              console.log(error);
            }
          })
        }
      </div>
    )
  }
}

class MyContentWidget extends Widget {
  constructor(notebook_Tracker: INotebookTracker) {
    super();
    this.id = MFE_VIEW_ID;
    this.addClass('jp-mfe-widget');
    this.notebookTracker = notebook_Tracker;
    this.renderView();
  }

  updateInnerValue(value: string[]) {
    this.innerValue = value;
    this.renderView();
  }

  renderView() {
    ReactDOM.render(
      <MfeComponent
        innerValue={this.innerValue} />,
      this.node
    );
  }

  notebookTracker: INotebookTracker = null;
  widget: MyContentWidget = null;
  innerValue: string[] = [];
}

export class MyTool extends NotebookTools.Tool {
  constructor(notebook_Tracker: INotebookTracker, app: JupyterLab) {
    super()
    this.notebook_Tracker = notebook_Tracker;
  }

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
      console.log('cell model发生改变了!');
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
    if (!myWidget) {
      myWidget = new MyContentWidget(this.notebook_Tracker);
      layout.addWidget(myWidget);
    }
    const innerValue: string[] = cell.model.value.text.replace(/\s/g, '').split(MFE_SPLIT_KEY);
    myWidget.updateInnerValue(innerValue);
  }

  protected onAfterAttach() {
    this.notebook_Tracker.currentWidget.context.ready.then(() => {
      console.log('context>>>');
      let notebook = this.notebook_Tracker.currentWidget;
      let cells = notebook.model.cells;
      for (var i = 0; i < cells.length; i++) {
        let cell = cells.get(i)
        console.log('cell>>>>>>')
        console.log(cell);
      }
    });
    this.notebook_Tracker.currentWidget.model.cells.changed.connect((cellList: IObservableList<ICellModel>) => {
      console.log('model.cells.changed...')
      console.log(cellList);
    });
  }

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
  mfeTools.addItem({ tool: new MyTool(notebook_Tracker, app) });
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'mfe-cell',
  autoStart: true,
  requires: [INotebookTools, INotebookTracker],
  activate: activate
};

export default extension;
