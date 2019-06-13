import { INotebookTracker } from '@jupyterlab/notebook';
import { Widget } from '@phosphor/widgets';
import { MfeObj } from './components/ChoiceComponent';
import MfeComponent from './MfeComponent';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const MFE_SPLIT_KEY = '#_#_#mfeducation';
export const MFE_VIEW_ID = 'mfe-view';

export default class MyContentWidget extends Widget {
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
    onChangeContent(title: string, mfeObj: MfeObj, index: number) {
        console.log(title, mfeObj);
        const targetMfeObjIndex = this.mfeObjs
            .filter(item => item)
            .findIndex((item, i) => {
                return item.title === title && index === i;
            });
        if (targetMfeObjIndex !== -1) {
            this.mfeObjs[targetMfeObjIndex] = mfeObj;
        }
        let jsonArr = this.mfeObjs.map(item => JSON.stringify(item));
        jsonArr.unshift(MFE_SPLIT_KEY);
        const jsonStr = jsonArr.join(`\n${MFE_SPLIT_KEY}\n`);
        this.notebookTracker.activeCell.model.value.text = jsonStr;
    }

    // 添加选择题
    addChoiceItem(mfeObj: MfeObj) {
        this.mfeObjs.push(mfeObj);
        let jsonArr = this.mfeObjs.map(item => JSON.stringify(item));
        jsonArr.unshift(MFE_SPLIT_KEY);
        const jsonStr = jsonArr.join(`\n${MFE_SPLIT_KEY}\n`);
        this.notebookTracker.activeCell.model.value.text = jsonStr;
    }

    // 删除选择题
    deleteChoiceItem(title: string, index: number) {
        const targetMfeObjIndex = this.mfeObjs.findIndex(
            (item, i) => item.title === title && index === i
        );
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
        this.mfeObjs = this.innerValue
            .filter((item: string) => item.trim() !== '')
            .map((item: string, index: number) => {
                try {
                    const mfeObj: MfeObj = JSON.parse(`${item.replace(/'/g, '"')}`);
                    if (mfeObj) {
                        return mfeObj;
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
