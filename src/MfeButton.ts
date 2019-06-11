import { INotebookTracker, INotebookModel, NotebookPanel } from "@jupyterlab/notebook";
import { ToolbarButton } from "@jupyterlab/apputils";
import { DocumentRegistry } from "@jupyterlab/docregistry";
import { IDisposable, DisposableDelegate } from "@phosphor/disposable";

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

    notebookTracker: INotebookTracker;

    constructor(notebookTracker: INotebookTracker) {
        this.notebookTracker = notebookTracker;
    }
    /**
     * Create a new extension object.
     */
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
        const helpButton = () => {
            let icon = "lightbulb-o";
            let handleClick = () => {
                const activeCell = this.notebookTracker.activeCell;
                console.log(activeCell);
            };

            return new ToolbarButton({
                className: "",
                label: "设为求助",
                iconClassName: `fa fa-${icon}`,
                onClick: handleClick,
                tooltip: "hi mfe!"
            });
        };

        panel.toolbar.insertItem(10, "helpButton", helpButton());

        return new DisposableDelegate(() => {
            helpButton().dispose();
        });
    }
}

export default ButtonExtension;