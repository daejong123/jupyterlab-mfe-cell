import {
  INotebookTracker,
  INotebookModel,
  NotebookPanel
} from '@jupyterlab/notebook';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IDisposable, DisposableDelegate } from '@phosphor/disposable';
import { MFE_SPLIT_KEY } from './MyContentWidget';
import { Dialog, showDialog } from '@jupyterlab/apputils';
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
    const choiceButton = () => {
      const icon = 'lightbulb-o';
      const handleClick = () => {
        const activeCell = this.notebookTracker.activeCell;
        const valueText = activeCell.model.value.text;
        const isMfeCell = valueText.includes(MFE_SPLIT_KEY);
        if (!isMfeCell) {
          if (valueText.trim() !== '') {
            showDialog({
              title: `当前cell中还有内容，确定覆盖吗？`,
              buttons: [
                Dialog.cancelButton({ label: '取消' }),
                Dialog.warnButton({ label: '确定' })
              ]
            }).then(result => {
              if (result.button.accept) {
                activeCell.model.value.text = MFE_SPLIT_KEY;
              }
            });
          } else {
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

    const choiceBtn = choiceButton();
    panel.toolbar.insertItem(10, 'helpButton', choiceBtn);

    return new DisposableDelegate(() => {
      choiceBtn.dispose();
    });
  }
}

export default ButtonExtension;
