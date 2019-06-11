import {
  INotebookTracker,
  INotebookModel,
  NotebookPanel
} from '@jupyterlab/notebook';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable, DisposableDelegate } from '@phosphor/disposable';
import { MFE_SPLIT_KEY } from './MyContentWidget';
import { RawCell } from '@jupyterlab/cells';
/**
 * A notebook widget extension that adds a button to the toolbar.
 */
class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  notebookTracker: INotebookTracker;

  constructor(notebookTracker: INotebookTracker) {
    this.notebookTracker = notebookTracker;
  }
  /**
   * Create a new extension object.
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    console.log('>>>> createNew');
    const helpButton = () => {
      let icon = 'lightbulb-o';
      let handleClick = () => {
        const activeCell = this.notebookTracker.activeCell;
        console.log(activeCell);
        if (activeCell instanceof RawCell) {
          const isMfeCell = activeCell.model.value.text.includes(MFE_SPLIT_KEY);
          if (!isMfeCell) {
            activeCell.model.value.text = MFE_SPLIT_KEY;
          }
        }
      };

      return new ToolbarButton({
        className: 'mfe-tool-btn',
        label: '选择题',
        iconClassName: `fa fa-${icon}`,
        onClick: handleClick,
        tooltip: '设置当前的框为选择题!'
      });
    };

    panel.toolbar.insertItem(10, 'helpButton', helpButton());

    return new DisposableDelegate(() => {
      helpButton().dispose();
    });
  }
}

export default ButtonExtension;
